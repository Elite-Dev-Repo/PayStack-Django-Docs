import CodeBlock from '../CodeBlock'
import Callout from '../Callout'
import IC from '../InlineCode'
import { Steps, Step } from '../Step'

export default function WebSockets() {
  return (
    <div className="doc-prose">
      <h1 className="font-serif text-4xl font-semibold mb-2 tracking-tight text-[#E8EDF5]" style={{fontFamily:'Fraunces,serif'}}>WebSockets</h1>
      <p className="text-lg text-[#A0ABBE] mb-8 leading-relaxed">
        Use Django Channels to push real-time payment status updates to connected clients — no polling required. When a webhook fires, broadcast the result over a WebSocket channel keyed by payment reference.
      </p>

      <h2>How it works</h2>
      <Steps>
        <Step num="1" title="Client opens WebSocket">
          Frontend connects to <IC>wss://yourdomain.com/ws/payments/&#123;reference&#125;/</IC> immediately after initiating a payment.
        </Step>
        <Step num="2" title="Paystack charges customer">
          Customer completes payment on the Paystack-hosted page.
        </Step>
        <Step num="3" title="Webhook fires">
          Paystack POSTs <IC>charge.success</IC> to your server. Your webhook handler updates the database.
        </Step>
        <Step num="4" title="Broadcast to client">
          The handler calls <IC>channel_layer.group_send</IC>. The consumer pushes the update to the browser instantly.
        </Step>
      </Steps>

      <h2>Install Django Channels</h2>
      <CodeBlock lang="bash">
        {`pip install channels channels-redis daphne`}
      </CodeBlock>
      <CodeBlock lang="python" filename="settings.py">
        {`INSTALLED_APPS = [\n    "daphne",   # must be first\n    ...\n    "channels",\n    "payments",\n]\n\nASGI_APPLICATION = "core.asgi.application"\n\nCHANNEL_LAYERS = {\n    "default": {\n        "BACKEND": "channels_redis.core.RedisChannelLayer",\n        "CONFIG":  {"hosts": [("127.0.0.1", 6379)]},\n    }\n}`}
      </CodeBlock>

      <h2>ASGI configuration</h2>
      <CodeBlock lang="python" filename="core/asgi.py">
        {`import os\nfrom django.core.asgi import get_asgi_application\nfrom channels.routing import ProtocolTypeRouter, URLRouter\nfrom channels.auth import AuthMiddlewareStack\nfrom channels.security.websocket import AllowedHostsOriginValidator\nfrom payments.routing import websocket_urlpatterns\n\nos.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")\n\napplication = ProtocolTypeRouter({\n    "http": get_asgi_application(),\n    "websocket": AllowedHostsOriginValidator(\n        AuthMiddlewareStack(\n            URLRouter(websocket_urlpatterns)\n        )\n    ),\n})`}
      </CodeBlock>

      <h2>WebSocket consumer</h2>
      <CodeBlock lang="python" filename="payments/consumers.py">
        {`import json\nfrom channels.generic.websocket import AsyncWebsocketConsumer\n\n\nclass PaymentStatusConsumer(AsyncWebsocketConsumer):\n    async def connect(self):\n        self.reference  = self.scope["url_route"]["kwargs"]["reference"]\n        self.group_name = f"payment_{self.reference}"\n\n        await self.channel_layer.group_add(\n            self.group_name, self.channel_name\n        )\n        await self.accept()\n        # Send initial connection acknowledgement\n        await self.send(text_data=json.dumps({\n            "type":      "connected",\n            "reference": self.reference,\n        }))\n\n    async def disconnect(self, close_code):\n        await self.channel_layer.group_discard(\n            self.group_name, self.channel_name\n        )\n\n    # Called by channel_layer.group_send from webhook handler\n    async def payment_update(self, event):\n        await self.send(text_data=json.dumps({\n            "type":      "payment_update",\n            "reference": event["reference"],\n            "status":    event["status"],\n            "amount":    event.get("amount"),\n            "channel":   event.get("channel"),\n        }))`}
      </CodeBlock>

      <h2>URL routing</h2>
      <CodeBlock lang="python" filename="payments/routing.py">
        {`from django.urls import re_path\nfrom . import consumers\n\nwebsocket_urlpatterns = [\n    re_path(\n        r"ws/payments/(?P<reference>[\\w-]+)/$",\n        consumers.PaymentStatusConsumer.as_asgi()\n    ),\n]`}
      </CodeBlock>

      <h2>Broadcast from webhook handler</h2>
      <CodeBlock lang="python" filename="payments/handlers.py">
        {`from asgiref.sync import async_to_sync\nfrom channels.layers import get_channel_layer\nfrom django.utils import timezone\nfrom .models import Payment\n\n\ndef handle_charge_success(data):\n    reference = data.get("reference")\n    amount    = data.get("amount", 0) / 100\n\n    # 1. Update database\n    Payment.objects.filter(reference=reference).update(\n        status="success",\n        paid_at=timezone.now(),\n        channel=data.get("channel", ""),\n    )\n\n    # 2. Broadcast over WebSocket\n    channel_layer = get_channel_layer()\n    async_to_sync(channel_layer.group_send)(\n        f"payment_{reference}",\n        {\n            "type":      "payment_update",  # maps to consumer method name\n            "reference": reference,\n            "status":    "success",\n            "amount":    amount,\n            "channel":   data.get("channel"),\n        }\n    )`}
      </CodeBlock>

      <h2>Frontend JavaScript client</h2>
      <CodeBlock lang="javascript" filename="client.js">
        {`const reference = "your_payment_reference_here";\nconst ws = new WebSocket(\`wss://yourdomain.com/ws/payments/\${reference}/\`);\n\nws.onopen = () => {\n  console.log("Listening for payment updates...");\n};\n\nws.onmessage = (event) => {\n  const data = JSON.parse(event.data);\n\n  if (data.type === "payment_update") {\n    if (data.status === "success") {\n      showSuccessUI(data.amount);\n      ws.close();\n    } else if (data.status === "failed") {\n      showFailureUI();\n      ws.close();\n    }\n  }\n};\n\nws.onerror = (err) => {\n  console.error("WebSocket error:", err);\n  // Fallback: poll the verify endpoint\n  pollVerify(reference);\n};\n\nws.onclose = () => {\n  console.log("WebSocket connection closed");\n};`}
      </CodeBlock>

      <Callout type="info" title="Running the ASGI server">
        For WebSocket support you must use an ASGI server. Run <IC>daphne core.asgi:application</IC> instead of <IC>python manage.py runserver</IC>. In production, use Daphne behind nginx or gunicorn with uvicorn workers.
      </Callout>

      <h2>Production deployment</h2>
      <CodeBlock lang="nginx" filename="nginx.conf (WebSocket proxy)">
        {`location /ws/ {\n    proxy_pass         http://127.0.0.1:8000;\n    proxy_http_version 1.1;\n    proxy_set_header   Upgrade $http_upgrade;\n    proxy_set_header   Connection "upgrade";\n    proxy_set_header   Host $host;\n    proxy_read_timeout 86400;  # 24h — keep alive\n}`}
      </CodeBlock>
    </div>
  )
}
