import CodeBlock from '../CodeBlock'
import Endpoint from '../Endpoint'
import Callout from '../Callout'

export default function Plans() {
  return (
    <div className="doc-prose">
      <h1 className="font-serif text-4xl font-semibold mb-2 tracking-tight text-[#E8EDF5]" style={{fontFamily:'Fraunces,serif'}}>Plans</h1>
      <p className="text-lg text-[#A0ABBE] mb-8 leading-relaxed">
        Plans define the billing interval and price for subscriptions. Create and manage plans via the API or sync them from the Paystack dashboard.
      </p>

      <h2>Plan model</h2>
      <CodeBlock lang="python" filename="payments/models.py">
        {`class Plan(models.Model):\n    INTERVAL_CHOICES = [\n        ("hourly",   "Hourly"),\n        ("daily",    "Daily"),\n        ("weekly",   "Weekly"),\n        ("monthly",  "Monthly"),\n        ("annually", "Annually"),\n    ]\n\n    paystack_plan_code = models.CharField(max_length=100, unique=True)\n    name               = models.CharField(max_length=200)\n    interval           = models.CharField(max_length=20, choices=INTERVAL_CHOICES)\n    amount             = models.PositiveIntegerField(help_text="In kobo")\n    description        = models.TextField(blank=True)\n    is_active          = models.BooleanField(default=True)\n    created_at         = models.DateTimeField(auto_now_add=True)\n\n    def __str__(self):\n        return f"{self.name} ({self.interval})"\n\n    @property\n    def amount_display(self):\n        return self.amount / 100`}
      </CodeBlock>

      <h2>Create a plan</h2>
      <Endpoint method="POST" path="/plan" />
      <CodeBlock lang="python" filename="payments/views.py">
        {`from rest_framework.permissions import IsAdminUser\n\nclass CreatePlanView(APIView):\n    permission_classes = [IsAdminUser]\n\n    def post(self, request):\n        serializer = PlanSerializer(data=request.data)\n        serializer.is_valid(raise_exception=True)\n        d = serializer.validated_data\n\n        res = paystack.post("/plan", json={\n            "name":     d["name"],\n            "interval": d["interval"],\n            "amount":   d["amount"],\n            "currency": d.get("currency", "NGN"),\n        })\n        body = res.json()\n        if not body["status"]:\n            return Response({"error": body["message"]}, status=400)\n\n        plan = Plan.objects.create(\n            paystack_plan_code=body["data"]["plan_code"],\n            name=d["name"],\n            interval=d["interval"],\n            amount=d["amount"],\n        )\n        return Response({"plan_code": plan.paystack_plan_code}, status=201)`}
      </CodeBlock>

      <h2>List plans (public endpoint)</h2>
      <CodeBlock lang="python" filename="payments/views.py">
        {`class PlanListView(APIView):\n    permission_classes = []  # plans are publicly viewable\n\n    def get(self, request):\n        plans = Plan.objects.filter(is_active=True).values(\n            "paystack_plan_code", "name", "interval", "amount"\n        )\n        return Response(list(plans))`}
      </CodeBlock>

      <h2>Sync plans management command</h2>
      <p>Use this management command to sync plans from the Paystack dashboard to your local database — useful after manual edits or in CI pipelines.</p>
      <CodeBlock lang="python" filename="payments/management/commands/sync_plans.py">
        {`from django.core.management.base import BaseCommand\nfrom payments.client import paystack\nfrom payments.models import Plan\n\n\nclass Command(BaseCommand):\n    help = "Sync Paystack plans to the local database"\n\n    def handle(self, *args, **options):\n        res   = paystack.get("/plan", params={"perPage": 200})\n        plans = res.json().get("data", [])\n\n        created = updated = 0\n        for p in plans:\n            _, is_new = Plan.objects.update_or_create(\n                paystack_plan_code=p["plan_code"],\n                defaults={\n                    "name":     p["name"],\n                    "interval": p["interval"],\n                    "amount":   p["amount"],\n                }\n            )\n            if is_new:\n                created += 1\n            else:\n                updated += 1\n\n        self.stdout.write(\n            self.style.SUCCESS(\n                f"Done — {created} created, {updated} updated"\n            )\n        )`}
      </CodeBlock>
      <CodeBlock lang="bash">
        {`python manage.py sync_plans`}
      </CodeBlock>

      <Callout type="warn" title="Amount is in kobo">
        When creating plans via the API, <code style={{background:'rgba(121,192,255,0.1)',color:'#79C0FF',padding:'1px 5px',borderRadius:'4px',fontSize:'13px'}}>amount</code> must be in kobo. For a ₦2,000/month plan, pass <code style={{background:'rgba(121,192,255,0.1)',color:'#79C0FF',padding:'1px 5px',borderRadius:'4px',fontSize:'13px'}}>amount: 200000</code>.
      </Callout>
    </div>
  )
}
