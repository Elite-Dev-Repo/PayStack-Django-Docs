import CodeBlock from '../CodeBlock'
import Endpoint from '../Endpoint'
import Callout from '../Callout'

export default function Subscriptions() {
  return (
    <div className="doc-prose">
      <h1 className="font-serif text-4xl font-semibold mb-2 tracking-tight text-[#E8EDF5]" style={{fontFamily:'Fraunces,serif'}}>Subscriptions</h1>
      <p className="text-lg text-[#A0ABBE] mb-8 leading-relaxed">
        Build a full recurring billing system. Customers subscribe to plans, Paystack handles charging on schedule, and your Django app responds to invoice webhook events.
      </p>

      <h2>Subscription model</h2>
      <CodeBlock lang="python" filename="payments/models.py">
        {`class Subscription(models.Model):\n    STATUS_CHOICES = [\n        ("active",        "Active"),\n        ("non-renewing",  "Non-renewing"),\n        ("attention",     "Attention"),\n        ("completed",     "Completed"),\n        ("cancelled",     "Cancelled"),\n    ]\n\n    user              = models.ForeignKey(User, on_delete=models.CASCADE, related_name="subscriptions")\n    plan              = models.ForeignKey(Plan, on_delete=models.PROTECT)\n    paystack_sub_code = models.CharField(max_length=100, unique=True)\n    email_token       = models.CharField(max_length=100)\n    status            = models.CharField(max_length=20, choices=STATUS_CHOICES)\n    quantity          = models.PositiveIntegerField(default=1)\n    next_payment_date = models.DateTimeField(null=True, blank=True)\n    created_at        = models.DateTimeField(auto_now_add=True)\n    updated_at        = models.DateTimeField(auto_now=True)\n\n    class Meta:\n        ordering = ["-created_at"]\n\n    def __str__(self):\n        return f"{self.user.email} — {self.plan.name} ({self.status})"\n\n    @property\n    def is_active(self):\n        return self.status == "active"`}
      </CodeBlock>

      <h2>Subscribe a customer</h2>
      <Endpoint method="POST" path="/subscription" />
      <CodeBlock lang="python" filename="payments/views.py">
        {`class SubscribeView(APIView):\n    def post(self, request):\n        plan_code = request.data.get("plan_code")\n        email     = request.user.email\n\n        # Customer must have a reusable authorization on file\n        auth = CustomerAuthorization.objects.filter(\n            user=request.user, reusable=True\n        ).first()\n\n        if not auth:\n            return Response(\n                {"error": "No reusable card on file. Make a payment first."},\n                status=400\n            )\n\n        res = paystack.post("/subscription", json={\n            "customer":      email,\n            "plan":          plan_code,\n            "authorization": auth.authorization_code,\n        })\n        body = res.json()\n        if not body["status"]:\n            return Response({"error": body["message"]}, status=400)\n\n        sub_data = body["data"]\n        plan     = Plan.objects.get(paystack_plan_code=plan_code)\n\n        Subscription.objects.create(\n            user=request.user,\n            plan=plan,\n            paystack_sub_code=sub_data["subscription_code"],\n            email_token=sub_data["email_token"],\n            status="active",\n        )\n        return Response(\n            {"subscription_code": sub_data["subscription_code"]},\n            status=201\n        )`}
      </CodeBlock>

      <h2>Handle invoice webhook events</h2>
      <p>Paystack fires <code style={{color:'#79C0FF',fontFamily:'monospace',fontSize:'13px'}}>invoice.update</code> on every billing cycle. Update your subscription records here:</p>
      <CodeBlock lang="python" filename="payments/handlers.py">
        {`from django.utils import timezone\nfrom django.utils.dateparse import parse_datetime\nfrom .models import Subscription, Payment\n\n\ndef handle_invoice_update(data):\n    sub_code = data["subscription"]["subscription_code"]\n    paid     = data.get("paid", False)\n\n    try:\n        sub = Subscription.objects.get(paystack_sub_code=sub_code)\n    except Subscription.DoesNotExist:\n        return\n\n    if paid:\n        sub.status = "active"\n        # Record the successful invoice charge as a payment\n        Payment.objects.create(\n            user=sub.user,\n            email=sub.user.email,\n            amount=data["amount"],\n            status="success",\n            paid_at=timezone.now(),\n        )\n    else:\n        sub.status = "attention"\n\n    next_date_str = data["subscription"].get("next_payment_date")\n    if next_date_str:\n        sub.next_payment_date = parse_datetime(next_date_str)\n\n    sub.save()\n\n\ndef handle_invoice_payment_failed(data):\n    sub_code = data["subscription"]["subscription_code"]\n    Subscription.objects.filter(\n        paystack_sub_code=sub_code\n    ).update(status="attention")\n    # TODO: notify user, trigger retry logic, send email\n\n\ndef handle_subscription_disable(data):\n    sub_code = data.get("subscription_code") or data.get("data", {}).get("subscription_code")\n    Subscription.objects.filter(\n        paystack_sub_code=sub_code\n    ).update(status="cancelled")`}
      </CodeBlock>

      <h2>Cancel a subscription</h2>
      <Endpoint method="POST" path="/subscription/disable" />
      <CodeBlock lang="python" filename="payments/views.py">
        {`class CancelSubscriptionView(APIView):\n    def post(self, request):\n        try:\n            sub = Subscription.objects.get(\n                user=request.user, status="active"\n            )\n        except Subscription.DoesNotExist:\n            return Response({"error": "No active subscription found"}, status=404)\n\n        res = paystack.post("/subscription/disable", json={\n            "code":  sub.paystack_sub_code,\n            "token": sub.email_token,\n        })\n        if res.json()["status"]:\n            sub.status = "cancelled"\n            sub.save(update_fields=["status"])\n            return Response({"message": "Subscription cancelled successfully"})\n\n        return Response({"error": "Cancel request failed"}, status=400)`}
      </CodeBlock>

      <h2>Fetch subscription details</h2>
      <Endpoint method="GET" path="/subscription/:id_or_code" />
      <CodeBlock lang="python" filename="payments/views.py">
        {`class SubscriptionDetailView(APIView):\n    def get(self, request, sub_code):\n        sub = Subscription.objects.get(\n            paystack_sub_code=sub_code, user=request.user\n        )\n        res  = paystack.get(f"/subscription/{sub.paystack_sub_code}")\n        body = res.json()\n        return Response(body.get("data", {}))`}
      </CodeBlock>

      <Callout type="info" title="email_token is required to cancel">
        Paystack returns an <code style={{color:'#79C0FF',fontFamily:'monospace',fontSize:'13px'}}>email_token</code> when the subscription is created. Store it — it is required alongside the subscription code to disable a subscription via the API.
      </Callout>
    </div>
  )
}
