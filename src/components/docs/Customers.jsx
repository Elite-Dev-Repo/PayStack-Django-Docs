import CodeBlock from '../CodeBlock'
import Endpoint from '../Endpoint'

export default function Customers() {
  return (
    <div className="doc-prose">
      <h1 className="font-serif text-4xl font-semibold mb-2 tracking-tight text-[#E8EDF5]" style={{fontFamily:'Fraunces,serif'}}>Customers</h1>
      <p className="text-lg text-[#A0ABBE] mb-8 leading-relaxed">Manage Paystack customer records, store authorization codes, and re-use saved cards for future charges.</p>

      <h2>Create a customer</h2>
      <Endpoint method="POST" path="/customer" />
      <CodeBlock lang="python" filename="payments/views.py">
        {`class CreateCustomerView(APIView):\n    def post(self, request):\n        res = paystack.post("/customer", json={\n            "email":      request.data["email"],\n            "first_name": request.data.get("first_name", ""),\n            "last_name":  request.data.get("last_name", ""),\n            "phone":      request.data.get("phone", ""),\n        })\n        body = res.json()\n        if body["status"]:\n            return Response(body["data"], status=201)\n        return Response({"error": body["message"]}, status=400)`}
      </CodeBlock>

      <h2>Authorization codes model</h2>
      <p>After a successful payment, save the customer's authorization code for future charges:</p>
      <CodeBlock lang="python" filename="payments/models.py">
        {`class CustomerAuthorization(models.Model):\n    user               = models.ForeignKey(User, on_delete=models.CASCADE, related_name="authorizations")\n    authorization_code = models.CharField(max_length=100)\n    bin                = models.CharField(max_length=10)\n    last4              = models.CharField(max_length=4)\n    exp_month          = models.CharField(max_length=2)\n    exp_year           = models.CharField(max_length=4)\n    card_type          = models.CharField(max_length=50)\n    bank               = models.CharField(max_length=100)\n    reusable           = models.BooleanField(default=False)\n    country_code       = models.CharField(max_length=5)\n    is_default         = models.BooleanField(default=False)\n    created_at         = models.DateTimeField(auto_now_add=True)\n\n    class Meta:\n        unique_together = ["user", "authorization_code"]\n\n    def __str__(self):\n        return f"{self.card_type} **** {self.last4} ({self.user.email})"`}
      </CodeBlock>

      <h2>Save auth from webhook</h2>
      <CodeBlock lang="python" filename="payments/handlers.py">
        {`def handle_charge_success(data):\n    auth = data.get("authorization", {})\n    if not auth.get("reusable"):\n        return\n\n    from django.contrib.auth import get_user_model\n    User = get_user_model()\n    try:\n        user = User.objects.get(email=data["customer"]["email"])\n    except User.DoesNotExist:\n        return\n\n    CustomerAuthorization.objects.update_or_create(\n        user=user,\n        authorization_code=auth["authorization_code"],\n        defaults={\n            "bin":          auth.get("bin", ""),\n            "last4":        auth.get("last4", ""),\n            "exp_month":    auth.get("exp_month", ""),\n            "exp_year":     auth.get("exp_year", ""),\n            "card_type":    auth.get("card_type", ""),\n            "bank":         auth.get("bank", ""),\n            "reusable":     True,\n            "country_code": auth.get("country_code", ""),\n        }\n    )`}
      </CodeBlock>
    </div>
  )
}
