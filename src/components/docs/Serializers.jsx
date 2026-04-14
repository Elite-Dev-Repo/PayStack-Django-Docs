import CodeBlock from '../CodeBlock'

export default function Serializers() {
  return (
    <div className="doc-prose">
      <h1 className="font-serif text-4xl font-semibold mb-2 tracking-tight text-[#E8EDF5]" style={{fontFamily:'Fraunces,serif'}}>Serializers</h1>
      <p className="text-lg text-[#A0ABBE] mb-8 leading-relaxed">
        Production-grade serializers for every Paystack operation — with field validation, nested objects, and read-only projections.
      </p>

      <h2>Transaction serializers</h2>
      <CodeBlock lang="python" filename="payments/serializers.py">
        {`from rest_framework import serializers\nfrom .models import Payment\n\n\nclass InitiatePaymentSerializer(serializers.Serializer):\n    email    = serializers.EmailField()\n    amount   = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=10)\n    metadata = serializers.DictField(required=False, default=dict)\n\n    def validate_amount(self, value):\n        if value < 10:\n            raise serializers.ValidationError("Minimum amount is ₦10")\n        return value\n\n\nclass PaymentSerializer(serializers.ModelSerializer):\n    amount_naira = serializers.SerializerMethodField()\n\n    class Meta:\n        model  = Payment\n        fields = [\n            "id", "reference", "email", "amount", "amount_naira",\n            "status", "channel", "currency", "paid_at", "created_at",\n        ]\n        read_only_fields = fields\n\n    def get_amount_naira(self, obj):\n        return obj.amount / 100\n\n\nclass VerifySerializer(serializers.Serializer):\n    reference = serializers.CharField(max_length=100)\n\n\nclass ChargeAuthSerializer(serializers.Serializer):\n    authorization_code = serializers.CharField()\n    email              = serializers.EmailField()\n    amount             = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=10)`}
      </CodeBlock>

      <h2>Customer serializer</h2>
      <CodeBlock lang="python" filename="payments/serializers.py">
        {`class CustomerSerializer(serializers.Serializer):\n    email      = serializers.EmailField()\n    first_name = serializers.CharField(max_length=100, required=False)\n    last_name  = serializers.CharField(max_length=100, required=False)\n    phone      = serializers.CharField(max_length=20, required=False)\n    metadata   = serializers.DictField(required=False, default=dict)`}
      </CodeBlock>

      <h2>Plan & subscription serializers</h2>
      <CodeBlock lang="python" filename="payments/serializers.py">
        {`class PlanSerializer(serializers.Serializer):\n    name          = serializers.CharField(max_length=200)\n    interval      = serializers.ChoiceField(\n        choices=["hourly","daily","weekly","monthly","annually"]\n    )\n    amount        = serializers.IntegerField(min_value=1)  # in kobo\n    description   = serializers.CharField(required=False)\n    send_invoices = serializers.BooleanField(default=True)\n    send_sms      = serializers.BooleanField(default=False)\n    currency      = serializers.ChoiceField(\n        choices=["NGN","GHS","ZAR","USD"], default="NGN"\n    )\n\n\nclass SubscribeSerializer(serializers.Serializer):\n    customer      = serializers.EmailField()\n    plan          = serializers.CharField(help_text="Plan code e.g. PLN_xxx")\n    authorization = serializers.CharField(\n        required=False,\n        help_text="Authorization code for recurring charge"\n    )\n    start_date    = serializers.DateTimeField(required=False)`}
      </CodeBlock>

      <h2>Webhook event serializer</h2>
      <CodeBlock lang="python" filename="payments/serializers.py">
        {`class WebhookEventSerializer(serializers.Serializer):\n    event = serializers.CharField()\n    data  = serializers.DictField()\n\n    SUPPORTED_EVENTS = {\n        "charge.success",\n        "transfer.success",\n        "transfer.failed",\n        "subscription.create",\n        "subscription.disable",\n        "invoice.create",\n        "invoice.update",\n        "invoice.payment_failed",\n        "customeridentification.success",\n        "customeridentification.failed",\n    }\n\n    def validate_event(self, value):\n        if value not in self.SUPPORTED_EVENTS:\n            # Don't error — silently ignore unknown events\n            pass\n        return value`}
      </CodeBlock>

      <h2>Refund serializer</h2>
      <CodeBlock lang="python" filename="payments/serializers.py">
        {`class RefundSerializer(serializers.Serializer):\n    reference     = serializers.CharField(help_text="Transaction reference to refund")\n    amount        = serializers.DecimalField(\n        max_digits=12, decimal_places=2,\n        required=False,\n        help_text="Partial refund amount in naira. Omit for full refund."\n    )\n    merchant_note = serializers.CharField(max_length=255, required=False)\n\n    def validate(self, data):\n        from .models import Payment\n        try:\n            payment = Payment.objects.get(\n                reference=data["reference"], status="success"\n            )\n        except Payment.DoesNotExist:\n            raise serializers.ValidationError(\n                {"reference": "No successful payment found with this reference."}\n            )\n        if data.get("amount") and data["amount"] * 100 > payment.amount:\n            raise serializers.ValidationError(\n                {"amount": "Refund amount cannot exceed original payment."}\n            )\n        return data`}
      </CodeBlock>
    </div>
  )
}
