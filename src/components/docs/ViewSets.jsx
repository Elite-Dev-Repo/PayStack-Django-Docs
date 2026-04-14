import CodeBlock from '../CodeBlock'
import Callout from '../Callout'

export default function ViewSets() {
  return (
    <div className="doc-prose">
      <h1 className="font-serif text-4xl font-semibold mb-2 tracking-tight text-[#E8EDF5]" style={{fontFamily:'Fraunces,serif'}}>ViewSets & Routing</h1>
      <p className="text-lg text-[#A0ABBE] mb-8 leading-relaxed">
        Full ViewSet patterns for transactions, subscriptions, and custom permissions — with proper throttling and pagination.
      </p>

      <h2>Subscription ViewSet</h2>
      <CodeBlock lang="python" filename="payments/viewsets.py">
        {`from rest_framework import viewsets, status\nfrom rest_framework.decorators import action\nfrom rest_framework.response import Response\nfrom rest_framework.permissions import IsAuthenticated\nfrom .client import paystack\nfrom .serializers import SubscribeSerializer\nfrom .models import Subscription, Plan, CustomerAuthorization\n\n\nclass SubscriptionViewSet(viewsets.GenericViewSet):\n    permission_classes = [IsAuthenticated]\n\n    @action(detail=False, methods=["post"])\n    def subscribe(self, request):\n        serializer = SubscribeSerializer(data=request.data)\n        serializer.is_valid(raise_exception=True)\n        d = serializer.validated_data\n\n        res = paystack.post("/subscription", json={\n            "customer":      d["customer"],\n            "plan":          d["plan"],\n            "authorization": d.get("authorization", ""),\n            "start_date":    (\n                d["start_date"].isoformat() if d.get("start_date") else ""\n            ),\n        })\n        body = res.json()\n        if not body["status"]:\n            return Response({"error": body["message"]}, status=400)\n        return Response(body["data"], status=201)\n\n    @action(detail=False, methods=["post"])\n    def cancel(self, request):\n        code  = request.data.get("subscription_code")\n        token = request.data.get("email_token")\n        res   = paystack.post("/subscription/disable",\n                    json={"code": code, "token": token})\n        return Response(res.json())\n\n    @action(detail=False, methods=["get"])\n    def list_subscriptions(self, request):\n        res = paystack.get("/subscription", params={\n            "customer": request.query_params.get("customer", ""),\n            "plan":     request.query_params.get("plan", ""),\n        })\n        return Response(res.json())`}
      </CodeBlock>

      <h2>Custom permissions</h2>
      <CodeBlock lang="python" filename="payments/permissions.py">
        {`from rest_framework.permissions import BasePermission\n\n\nclass IsPaystackWebhook(BasePermission):\n    """\n    Used only on the webhook endpoint.\n    Skips DRF user auth — actual security is HMAC verification inside the view.\n    """\n    def has_permission(self, request, view):\n        return True\n\n\nclass IsPaymentOwner(BasePermission):\n    def has_object_permission(self, request, view, obj):\n        return obj.user == request.user\n\n\nclass HasActiveSubscription(BasePermission):\n    message = "An active subscription is required to access this resource."\n\n    def has_permission(self, request, view):\n        from .models import Subscription\n        return Subscription.objects.filter(\n            user=request.user, status="active"\n        ).exists()`}
      </CodeBlock>

      <h2>Throttling</h2>
      <CodeBlock lang="python" filename="payments/throttles.py">
        {`from rest_framework.throttling import UserRateThrottle\n\n\nclass PaymentInitiateThrottle(UserRateThrottle):\n    """Limit payment initiations to prevent abuse."""\n    scope = "payment_initiate"\n    rate  = "10/minute"\n\n\nclass WebhookThrottle(UserRateThrottle):\n    """Webhook endpoint throttle — generous but protected."""\n    scope = "webhook"\n    rate  = "200/minute"`}
      </CodeBlock>
      <CodeBlock lang="python" filename="settings.py">
        {`REST_FRAMEWORK = {\n    ...\n    "DEFAULT_THROTTLE_CLASSES": [\n        "rest_framework.throttling.AnonRateThrottle",\n        "rest_framework.throttling.UserRateThrottle",\n    ],\n    "DEFAULT_THROTTLE_RATES": {\n        "anon":             "100/day",\n        "user":             "1000/day",\n        "payment_initiate": "10/minute",\n        "webhook":          "200/minute",\n    },\n}`}
      </CodeBlock>

      <h2>Pagination</h2>
      <CodeBlock lang="python" filename="payments/pagination.py">
        {`from rest_framework.pagination import PageNumberPagination\n\n\nclass PaymentPagination(PageNumberPagination):\n    page_size            = 20\n    page_size_query_param = "per_page"\n    max_page_size        = 100\n\n    def get_paginated_response_schema(self, schema):\n        return {\n            "type": "object",\n            "properties": {\n                "count":    {"type": "integer"},\n                "next":     {"type": "string", "nullable": True},\n                "previous": {"type": "string", "nullable": True},\n                "results":  schema,\n            }\n        }`}
      </CodeBlock>

      <Callout type="info" title="Apply to ViewSet">
        Add <code style={{background:'rgba(121,192,255,0.1)',color:'#79C0FF',padding:'1px 6px',borderRadius:'4px',fontSize:'13px'}}>pagination_class = PaymentPagination</code> to your ViewSet to automatically paginate list responses.
      </Callout>
    </div>
  )
}
