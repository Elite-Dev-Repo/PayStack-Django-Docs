import CodeBlock from '../CodeBlock'
import Endpoint from '../Endpoint'
import Callout from '../Callout'

export default function Refunds() {
  return (
    <div className="doc-prose">
      <h1 className="font-serif text-4xl font-semibold mb-2 tracking-tight text-[#E8EDF5]" style={{fontFamily:'Fraunces,serif'}}>Refunds</h1>
      <p className="text-lg text-[#A0ABBE] mb-8 leading-relaxed">
        Process full and partial refunds through the Paystack API and keep your local records in sync.
      </p>

      <h2>Refund model</h2>
      <CodeBlock lang="python" filename="payments/models.py">
        {`class Refund(models.Model):\n    STATUS_CHOICES = [\n        ("pending",    "Pending"),\n        ("processing", "Processing"),\n        ("processed",  "Processed"),\n        ("failed",     "Failed"),\n    ]\n\n    payment       = models.ForeignKey(\n        Payment, on_delete=models.CASCADE, related_name="refunds"\n    )\n    paystack_ref  = models.CharField(max_length=100, blank=True)\n    amount        = models.PositiveIntegerField(help_text="Refund amount in kobo")\n    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")\n    reason        = models.TextField(blank=True)\n    merchant_note = models.TextField(blank=True)\n    refunded_at   = models.DateTimeField(null=True, blank=True)\n    created_at    = models.DateTimeField(auto_now_add=True)\n\n    def __str__(self):\n        return f"Refund {self.paystack_ref} — {self.status}"\n\n    @property\n    def amount_naira(self):\n        return self.amount / 100`}
      </CodeBlock>

      <h2>Create a refund</h2>
      <Endpoint method="POST" path="/refund" />
      <CodeBlock lang="python" filename="payments/views.py">
        {`class RefundView(APIView):\n    def post(self, request):\n        serializer = RefundSerializer(data=request.data)\n        serializer.is_valid(raise_exception=True)\n        d = serializer.validated_data\n\n        try:\n            payment = Payment.objects.get(\n                reference=d["reference"],\n                user=request.user,\n                status="success",\n            )\n        except Payment.DoesNotExist:\n            return Response(\n                {"error": "Payment not found or not eligible for refund"},\n                status=404\n            )\n\n        # Build payload — amount is optional (omit for full refund)\n        payload = {"transaction": d["reference"]}\n        if d.get("amount"):\n            payload["amount"] = int(d["amount"] * 100)\n        if d.get("merchant_note"):\n            payload["merchant_note"] = d["merchant_note"]\n\n        res  = paystack.post("/refund", json=payload)\n        body = res.json()\n\n        if not body["status"]:\n            return Response({"error": body["message"]}, status=400)\n\n        refund_data = body["data"]\n        Refund.objects.create(\n            payment=payment,\n            paystack_ref=str(refund_data.get("id", "")),\n            amount=refund_data["amount"],\n            status=refund_data["status"],\n        )\n        return Response({\n            "status": refund_data["status"],\n            "amount": refund_data["amount"] / 100,\n        }, status=201)`}
      </CodeBlock>

      <h2>List refunds for a transaction</h2>
      <Endpoint method="GET" path="/refund" />
      <CodeBlock lang="python" filename="payments/views.py">
        {`class RefundListView(APIView):\n    def get(self, request):\n        reference = request.query_params.get("reference")\n        res  = paystack.get("/refund", params={"transaction": reference})\n        body = res.json()\n        return Response(body.get("data", []))`}
      </CodeBlock>

      <Callout type="warn" title="Partial refunds">
        You can issue multiple partial refunds up to the original transaction amount. Track the total refunded amount in your database to prevent over-refunding. Paystack also enforces this on their end.
      </Callout>

      <Callout type="info" title="Refund timeline">
        Refunds typically appear in the customer's account within 5–10 business days, depending on their bank. Paystack debits your settlement balance immediately.
      </Callout>
    </div>
  )
}
