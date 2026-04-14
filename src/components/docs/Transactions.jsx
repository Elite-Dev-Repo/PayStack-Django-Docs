import CodeBlock from '../CodeBlock'
import Callout from '../Callout'
import Endpoint from '../Endpoint'
import IC from '../InlineCode'

export default function Transactions() {
  return (
    <div className="doc-prose">
      <h1 className="font-serif text-4xl font-semibold mb-2 tracking-tight text-[#E8EDF5]" style={{fontFamily:'Fraunces,serif'}}>Transactions</h1>
      <p className="text-lg text-[#A0ABBE] mb-8 leading-relaxed">
        The core primitive of Paystack. Initialize, verify, list, and charge saved authorizations.
      </p>

      <h2>Initialize a transaction</h2>
      <Endpoint method="POST" path="/transaction/initialize" />
      <CodeBlock lang="python" filename="payments/views.py">
        {`from payments.client import paystack\nfrom .models import Payment\n\nclass InitiatePaymentView(APIView):\n    def post(self, request):\n        serializer = InitiatePaymentSerializer(data=request.data)\n        serializer.is_valid(raise_exception=True)\n        data = serializer.validated_data\n\n        payment = Payment.objects.create(\n            user=request.user,\n            email=data["email"],\n            amount=int(data["amount"] * 100),\n        )\n\n        res = paystack.post("/transaction/initialize", json={\n            "email":        data["email"],\n            "amount":       payment.amount,\n            "reference":    str(payment.reference),\n            "callback_url": settings.PAYSTACK_CALLBACK_URL,\n            "metadata":     {"payment_id": payment.pk},\n            "channels":     ["card", "bank", "ussd", "bank_transfer"],\n        })\n\n        body = res.json()\n        if not body["status"]:\n            payment.delete()\n            return Response({"error": body["message"]}, status=502)\n\n        return Response({\n            "authorization_url": body["data"]["authorization_url"],\n            "reference":         str(payment.reference),\n        }, status=201)`}
      </CodeBlock>

      <h2>Verify a transaction</h2>
      <Endpoint method="GET" path="/transaction/verify/:reference" />
      <CodeBlock lang="python" filename="payments/views.py">
        {`from django.utils import timezone\n\nclass VerifyPaymentView(APIView):\n    def get(self, request):\n        reference = request.query_params.get("reference")\n        if not reference:\n            return Response({"error": "reference is required"}, status=400)\n\n        try:\n            payment = Payment.objects.get(reference=reference, user=request.user)\n        except Payment.DoesNotExist:\n            return Response({"error": "Payment not found"}, status=404)\n\n        res  = paystack.get(f"/transaction/verify/{reference}")\n        body = res.json()\n\n        if not body["status"]:\n            return Response({"error": body["message"]}, status=502)\n\n        tx = body["data"]\n\n        if tx["status"] == "success":\n            payment.status  = "success"\n            payment.channel = tx.get("channel", "")\n            payment.paid_at = timezone.now()\n            payment.save(update_fields=["status", "channel", "paid_at"])\n\n        return Response({\n            "status":    tx["status"],\n            "amount":    tx["amount"] / 100,\n            "currency":  tx["currency"],\n            "channel":   tx.get("channel"),\n            "paid_at":   tx.get("paid_at"),\n            "reference": tx["reference"],\n        })`}
      </CodeBlock>

      <h2>Charge an authorization (recurring)</h2>
      <p>After a successful payment, Paystack stores the card as an <IC>authorization_code</IC>. Charge it again without any customer redirect.</p>
      <Endpoint method="POST" path="/transaction/charge_authorization" />
      <CodeBlock lang="python" filename="payments/views.py">
        {`class ChargeAuthorizationView(APIView):\n    def post(self, request):\n        auth_code = request.data.get("authorization_code")\n        email     = request.data.get("email")\n        amount    = request.data.get("amount")\n\n        res = paystack.post("/transaction/charge_authorization", json={\n            "authorization_code": auth_code,\n            "email":              email,\n            "amount":             int(amount) * 100,\n        })\n        body = res.json()\n\n        if body["status"] and body["data"]["status"] == "success":\n            Payment.objects.create(\n                user=request.user,\n                email=email,\n                amount=int(amount) * 100,\n                status="success",\n                paid_at=timezone.now(),\n            )\n            return Response({"message": "Charge successful"})\n\n        return Response({"error": body.get("message", "Charge failed")}, status=402)`}
      </CodeBlock>

      <h2>List transactions</h2>
      <Endpoint method="GET" path="/transaction" />
      <CodeBlock lang="python" filename="payments/views.py">
        {`class TransactionListView(APIView):\n    def get(self, request):\n        params = {\n            "perPage": request.query_params.get("per_page", 50),\n            "page":    request.query_params.get("page", 1),\n            "status":  request.query_params.get("status", ""),\n            "from":    request.query_params.get("from", ""),\n            "to":      request.query_params.get("to", ""),\n        }\n        res = paystack.get("/transaction",\n            params={k: v for k, v in params.items() if v})\n        return Response(res.json())`}
      </CodeBlock>

      <Callout type="info" title="Idempotency">
        Always store a <IC>reference</IC> in your database before calling Paystack. If the request times out, you can retry safely by looking up the existing reference rather than creating a duplicate payment.
      </Callout>
    </div>
  )
}
