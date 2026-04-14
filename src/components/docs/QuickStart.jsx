import CodeBlock from '../CodeBlock'
import Callout from '../Callout'
import IC from '../InlineCode'

export default function QuickStart() {
  return (
    <div className="doc-prose">
      <h1 className="font-serif text-4xl font-semibold mb-2 tracking-tight text-[#E8EDF5]" style={{fontFamily:'Fraunces,serif'}}>Quick Start</h1>
      <p className="text-lg text-[#A0ABBE] mb-8 leading-relaxed">
        Get Paystack working in your Django project in under 10 minutes.
      </p>

      <h2>1. Install dependencies</h2>
      <CodeBlock lang="bash">
        {`pip install requests django djangorestframework python-dotenv`}
      </CodeBlock>

      <h2>2. Set environment variables</h2>
      <CodeBlock lang="env" filename=".env">
        {`PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\nPAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\nPAYSTACK_CALLBACK_URL=https://yourdomain.com/payments/callback/\nPAYSTACK_WEBHOOK_SECRET=your_webhook_secret`}
      </CodeBlock>
      <Callout type="info" title="Test vs Live">
        Use <IC>sk_test_</IC> keys during development. Paystack test cards will work but no real money moves. Switch to <IC>sk_live_</IC> keys in production.
      </Callout>

      <h2>3. Django settings</h2>
      <CodeBlock lang="python" filename="settings.py">
        {`import os\nfrom dotenv import load_dotenv\n\nload_dotenv()\n\nINSTALLED_APPS = [\n    ...\n    "rest_framework",\n    "payments",  # your payments app\n]\n\n# Paystack configuration\nPAYSTACK_SECRET_KEY    = os.getenv("PAYSTACK_SECRET_KEY")\nPAYSTACK_PUBLIC_KEY    = os.getenv("PAYSTACK_PUBLIC_KEY")\nPAYSTACK_CALLBACK_URL  = os.getenv("PAYSTACK_CALLBACK_URL")\nPAYSTACK_WEBHOOK_SECRET = os.getenv("PAYSTACK_WEBHOOK_SECRET")\n\nREST_FRAMEWORK = {\n    "DEFAULT_AUTHENTICATION_CLASSES": [\n        "rest_framework.authentication.SessionAuthentication",\n        "rest_framework.authentication.TokenAuthentication",\n    ],\n    "DEFAULT_PERMISSION_CLASSES": [\n        "rest_framework.permissions.IsAuthenticated",\n    ],\n}`}
      </CodeBlock>

      <h2>4. Create a payments app</h2>
      <CodeBlock lang="bash">
        {`python manage.py startapp payments`}
      </CodeBlock>

      <h2>5. Payment model</h2>
      <CodeBlock lang="python" filename="payments/models.py">
        {`import uuid\nfrom django.db import models\nfrom django.contrib.auth import get_user_model\n\nUser = get_user_model()\n\nclass Payment(models.Model):\n    STATUS_CHOICES = [\n        ("pending",   "Pending"),\n        ("success",   "Success"),\n        ("failed",    "Failed"),\n        ("abandoned", "Abandoned"),\n    ]\n\n    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payments")\n    reference  = models.CharField(max_length=100, unique=True, default=uuid.uuid4)\n    email      = models.EmailField()\n    amount     = models.PositiveIntegerField(help_text="Amount in kobo")\n    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")\n    channel    = models.CharField(max_length=50, blank=True)\n    currency   = models.CharField(max_length=10, default="NGN")\n    paid_at    = models.DateTimeField(null=True, blank=True)\n    metadata   = models.JSONField(default=dict, blank=True)\n    created_at = models.DateTimeField(auto_now_add=True)\n    updated_at = models.DateTimeField(auto_now=True)\n\n    class Meta:\n        ordering = ["-created_at"]\n\n    def __str__(self):\n        return f"{self.reference} — {self.status}"\n\n    @property\n    def amount_naira(self):\n        return self.amount / 100`}
      </CodeBlock>

      <h2>6. First payment view</h2>
      <CodeBlock lang="python" filename="payments/views.py">
        {`import requests\nfrom django.conf import settings\nfrom rest_framework.views import APIView\nfrom rest_framework.response import Response\nfrom rest_framework import status\nfrom .models import Payment\n\nPAYSTACK_BASE = "https://api.paystack.co"\n\ndef paystack_headers():\n    return {\n        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",\n        "Content-Type": "application/json",\n    }\n\nclass InitiatePaymentView(APIView):\n    def post(self, request):\n        email  = request.data.get("email")\n        amount = request.data.get("amount")  # in naira\n\n        if not email or not amount:\n            return Response(\n                {"error": "email and amount are required"},\n                status=status.HTTP_400_BAD_REQUEST\n            )\n\n        payment = Payment.objects.create(\n            user=request.user,\n            email=email,\n            amount=int(amount) * 100,\n        )\n\n        payload = {\n            "email":        email,\n            "amount":       payment.amount,\n            "reference":    str(payment.reference),\n            "callback_url": settings.PAYSTACK_CALLBACK_URL,\n            "metadata": {\n                "payment_id": payment.id,\n                "user_id":    request.user.id,\n            }\n        }\n\n        res = requests.post(\n            f"{PAYSTACK_BASE}/transaction/initialize",\n            json=payload,\n            headers=paystack_headers(),\n            timeout=10,\n        )\n        data = res.json()\n\n        if data.get("status"):\n            return Response({\n                "authorization_url": data["data"]["authorization_url"],\n                "reference":         str(payment.reference),\n                "access_code":       data["data"]["access_code"],\n            })\n\n        payment.delete()\n        return Response(\n            {"error": data.get("message", "Initialization failed")},\n            status=status.HTTP_502_BAD_GATEWAY\n        )`}
      </CodeBlock>

      <h2>7. Wire up URLs</h2>
      <CodeBlock lang="python" filename="payments/urls.py">
        {`from django.urls import path\nfrom . import views\n\nurlpatterns = [\n    path("initiate/", views.InitiatePaymentView.as_view(),  name="payment-initiate"),\n    path("verify/",   views.VerifyPaymentView.as_view(),    name="payment-verify"),\n    path("webhook/",  views.WebhookView.as_view(),          name="payment-webhook"),\n]`}
      </CodeBlock>
      <CodeBlock lang="python" filename="core/urls.py">
        {`from django.urls import path, include\n\nurlpatterns = [\n    path("api/payments/", include("payments.urls")),\n]`}
      </CodeBlock>
      <Callout type="success" title="You're ready">
        Run <IC>python manage.py makemigrations && python manage.py migrate</IC> and start your dev server. POST to <IC>/api/payments/initiate/</IC> to begin.
      </Callout>
    </div>
  )
}
