import CodeBlock from '../CodeBlock'
import Callout from '../Callout'
import DocTable from '../DocTable'
import IC from '../InlineCode'

export default function Webhooks() {
  return (
    <div className="doc-prose">
      <h1 className="font-serif text-4xl font-semibold mb-2 tracking-tight text-[#E8EDF5]" style={{fontFamily:'Fraunces,serif'}}>Webhooks</h1>
      <p className="text-lg text-[#A0ABBE] mb-8 leading-relaxed">
        Webhooks are the authoritative source of truth for payment outcomes. Paystack POSTs signed events to your server — you must verify the HMAC-SHA512 signature before processing any event.
      </p>

      <Callout type="danger" title="Critical security rule">
        Never fulfill orders or activate subscriptions based on the callback URL redirect alone. Always use webhooks or a server-side verify call as the definitive confirmation.
      </Callout>

      <h2>Webhook view with HMAC verification</h2>
      <CodeBlock lang="python" filename="payments/views.py">
        {`import hmac\nimport hashlib\nimport json\nfrom django.views.decorators.csrf import csrf_exempt\nfrom django.utils.decorators import method_decorator\nfrom rest_framework.views import APIView\nfrom rest_framework.response import Response\nfrom django.conf import settings\nfrom .permissions import IsPaystackWebhook\n\n\n@method_decorator(csrf_exempt, name="dispatch")\nclass WebhookView(APIView):\n    permission_classes     = [IsPaystackWebhook]\n    authentication_classes = []  # No session/token auth on this endpoint\n\n    def post(self, request):\n        # 1. Verify HMAC-SHA512 signature\n        signature = request.headers.get("X-Paystack-Signature", "")\n        raw_body  = request.body\n\n        expected = hmac.new(\n            settings.PAYSTACK_WEBHOOK_SECRET.encode("utf-8"),\n            msg=raw_body,\n            digestmod=hashlib.sha512,\n        ).hexdigest()\n\n        if not hmac.compare_digest(expected, signature):\n            return Response({"error": "Invalid signature"}, status=400)\n\n        # 2. Parse payload\n        try:\n            payload = json.loads(raw_body)\n        except json.JSONDecodeError:\n            return Response({"error": "Bad payload"}, status=400)\n\n        event = payload.get("event")\n        data  = payload.get("data", {})\n\n        # 3. Idempotency check\n        if not self._is_new_event(event, data):\n            return Response({"status": "already processed"})\n\n        # 4. Dispatch to handler\n        self._dispatch(event, data)\n\n        # 5. Always return 200 quickly\n        return Response({"status": "ok"})\n\n    def _is_new_event(self, event, data):\n        from .models import WebhookEvent\n        event_id = str(data.get("id") or data.get("reference", ""))\n        _, created = WebhookEvent.objects.get_or_create(\n            event_id=f"{event}:{event_id}",\n            defaults={"event_type": event, "payload": data},\n        )\n        return created\n\n    def _dispatch(self, event, data):\n        import logging\n        from . import handlers\n        log = logging.getLogger("payments.webhook")\n\n        dispatcher = {\n            "charge.success":         handlers.handle_charge_success,\n            "subscription.create":    handlers.handle_subscription_create,\n            "subscription.disable":   handlers.handle_subscription_disable,\n            "invoice.update":         handlers.handle_invoice_update,\n            "invoice.payment_failed": handlers.handle_invoice_payment_failed,\n            "transfer.success":       handlers.handle_transfer_success,\n            "transfer.failed":        handlers.handle_transfer_failed,\n        }\n        handler = dispatcher.get(event)\n        if handler:\n            try:\n                handler(data)\n                log.info("Handled webhook", extra={"event": event})\n            except Exception as e:\n                log.exception(f"Handler error for {event}: {e}")`}
      </CodeBlock>

      <h2>Idempotency model</h2>
      <CodeBlock lang="python" filename="payments/models.py">
        {`class WebhookEvent(models.Model):\n    event_id   = models.CharField(max_length=200, unique=True)\n    event_type = models.CharField(max_length=100)\n    payload    = models.JSONField()\n    processed  = models.BooleanField(default=True)\n    created_at = models.DateTimeField(auto_now_add=True)\n\n    class Meta:\n        indexes = [models.Index(fields=["event_id"])]\n\n    def __str__(self):\n        return f"{self.event_type} — {self.event_id}"`}
      </CodeBlock>

      <h2>All webhook events</h2>
      <DocTable
        headers={['Event','When it fires']}
        rows={[
          ['<code class="text-[#79C0FF] font-mono text-[12px]">charge.success</code>','A card or bank charge succeeds'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">charge.dispute.create</code>','A dispute is opened on a charge'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">charge.dispute.remind</code>','A dispute requires a response'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">charge.dispute.resolve</code>','A dispute is resolved'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">subscription.create</code>','A new subscription is created'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">subscription.disable</code>','A subscription is cancelled or disabled'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">invoice.create</code>','Invoice created for an upcoming charge'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">invoice.update</code>','Invoice paid or updated'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">invoice.payment_failed</code>','Invoice charge failed'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">transfer.success</code>','A payout to a bank account succeeds'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">transfer.failed</code>','A payout to a bank account fails'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">transfer.reversed</code>','A payout has been reversed'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">customeridentification.success</code>','BVN verification succeeds'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">customeridentification.failed</code>','BVN verification fails'],
        ]}
      />

      <h2>Local development with ngrok</h2>
      <CodeBlock lang="bash">
        {`# 1. Install ngrok from https://ngrok.com\nngrok http 8000\n\n# Output: https://abc123.ngrok-free.app\n# Set this as your webhook URL in Paystack dashboard:\n# https://abc123.ngrok-free.app/api/payments/webhook/`}
      </CodeBlock>

      <Callout type="info" title="Response time matters">
        Paystack expects a <IC>200</IC> response within 5 seconds. Do all heavy work (database writes, emails, notifications) asynchronously with Celery or Django-Q after returning the response.
      </Callout>

      <h2>Async webhook processing with Celery</h2>
      <CodeBlock lang="python" filename="payments/tasks.py">
        {`from celery import shared_task\nimport logging\n\nlog = logging.getLogger("payments.tasks")\n\n\n@shared_task(bind=True, max_retries=3, default_retry_delay=60)\ndef process_webhook_event(self, event: str, data: dict):\n    from . import handlers\n    dispatcher = {\n        "charge.success":         handlers.handle_charge_success,\n        "invoice.update":         handlers.handle_invoice_update,\n        "invoice.payment_failed": handlers.handle_invoice_payment_failed,\n        "subscription.disable":   handlers.handle_subscription_disable,\n    }\n    handler = dispatcher.get(event)\n    if not handler:\n        return\n    try:\n        handler(data)\n    except Exception as exc:\n        log.exception(f"Task failed for {event}")\n        raise self.retry(exc=exc)`}
      </CodeBlock>
      <CodeBlock lang="python" filename="payments/views.py — inside _dispatch">
        {`# Replace direct handler call with Celery task\nfrom .tasks import process_webhook_event\n\nif handler:\n    process_webhook_event.delay(event, data)`}
      </CodeBlock>
    </div>
  )
}
