import CodeBlock from '../CodeBlock'
import Callout from '../Callout'
import DocTable from '../DocTable'
import IC from '../InlineCode'

export default function Testing() {
  return (
    <div className="doc-prose">
      <h1 className="font-serif text-4xl font-semibold mb-2 tracking-tight text-[#E8EDF5]" style={{fontFamily:'Fraunces,serif'}}>Testing</h1>
      <p className="text-lg text-[#A0ABBE] mb-8 leading-relaxed">
        Write reliable, fast tests using pytest-django. Mock all external HTTP calls so tests run offline and in CI without hitting the real Paystack API.
      </p>

      <h2>Install test dependencies</h2>
      <CodeBlock lang="bash">
        {`pip install pytest pytest-django pytest-mock responses factory-boy`}
      </CodeBlock>
      <CodeBlock lang="ini" filename="pytest.ini">
        {`[pytest]\nDJANGO_SETTINGS_MODULE = core.settings\npython_files = tests.py test_*.py *_tests.py\naddopts = -v --tb=short`}
      </CodeBlock>

      <h2>Test settings override</h2>
      <CodeBlock lang="python" filename="core/settings_test.py">
        {`from .settings import *  # noqa\n\n# Use fast password hasher in tests\nPASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]\n\n# Fake keys so the client doesn't fail on import\nPAYSTACK_SECRET_KEY    = "sk_test_fake_key_for_testing"\nPAYSTACK_PUBLIC_KEY    = "pk_test_fake_key_for_testing"\nPAYSTACK_WEBHOOK_SECRET = "test_webhook_secret"\nPAYSTACK_CALLBACK_URL  = "https://testserver/payments/callback/"\n\nDATABASES = {\n    "default": {\n        "ENGINE": "django.db.backends.sqlite3",\n        "NAME": ":memory:",\n    }\n}`}
      </CodeBlock>

      <h2>Factories</h2>
      <CodeBlock lang="python" filename="payments/tests/factories.py">
        {`import factory\nfrom django.contrib.auth import get_user_model\nfrom payments.models import Payment, Plan, Subscription\n\n\nclass UserFactory(factory.django.DjangoModelFactory):\n    class Meta:\n        model = get_user_model()\n\n    username = factory.Sequence(lambda n: f"user{n}")\n    email    = factory.LazyAttribute(lambda o: f"{o.username}@example.com")\n    password = factory.PostGenerationMethodCall("set_password", "testpass123")\n\n\nclass PaymentFactory(factory.django.DjangoModelFactory):\n    class Meta:\n        model = Payment\n\n    user      = factory.SubFactory(UserFactory)\n    email     = factory.LazyAttribute(lambda o: o.user.email)\n    amount    = 500000  # ₦5,000 in kobo\n    status    = "pending"\n    reference = factory.Sequence(lambda n: f"test_ref_{n:04d}")\n\n\nclass PlanFactory(factory.django.DjangoModelFactory):\n    class Meta:\n        model = Plan\n\n    paystack_plan_code = factory.Sequence(lambda n: f"PLN_test{n}")\n    name               = "Pro Monthly"\n    interval           = "monthly"\n    amount             = 500000\n\n\nclass SubscriptionFactory(factory.django.DjangoModelFactory):\n    class Meta:\n        model = Subscription\n\n    user              = factory.SubFactory(UserFactory)\n    plan              = factory.SubFactory(PlanFactory)\n    paystack_sub_code = factory.Sequence(lambda n: f"SUB_test{n}")\n    email_token       = factory.Sequence(lambda n: f"tok_{n}")\n    status            = "active"`}
      </CodeBlock>

      <h2>Testing transaction views</h2>
      <CodeBlock lang="python" filename="payments/tests/test_transactions.py">
        {`import pytest\nimport responses as resp_mock\nfrom rest_framework.test import APIClient\nfrom .factories import UserFactory, PaymentFactory\n\n\n@pytest.mark.django_db\nclass TestInitiatePayment:\n\n    @resp_mock.activate\n    def test_initiate_success(self):\n        user   = UserFactory()\n        client = APIClient()\n        client.force_authenticate(user=user)\n\n        resp_mock.add(\n            resp_mock.POST,\n            "https://api.paystack.co/transaction/initialize",\n            json={\n                "status": True,\n                "message": "Authorization URL created",\n                "data": {\n                    "authorization_url": "https://checkout.paystack.com/abc",\n                    "access_code":       "abc123",\n                    "reference":         "test_ref_001",\n                }\n            },\n            status=200,\n        )\n\n        res = client.post("/api/payments/initiate/", {\n            "email": user.email, "amount": 5000\n        }, format="json")\n\n        assert res.status_code == 201\n        assert "authorization_url" in res.data\n        assert "reference" in res.data\n\n    @resp_mock.activate\n    def test_initiate_creates_pending_payment(self):\n        from payments.models import Payment\n        user   = UserFactory()\n        client = APIClient()\n        client.force_authenticate(user=user)\n\n        resp_mock.add(\n            resp_mock.POST,\n            "https://api.paystack.co/transaction/initialize",\n            json={"status": True, "data": {\n                "authorization_url": "https://checkout.paystack.com/x",\n                "access_code": "x", "reference": "ref"\n            }}\n        )\n\n        client.post("/api/payments/initiate/",\n            {"email": user.email, "amount": 1000}, format="json")\n\n        assert Payment.objects.filter(user=user, status="pending").exists()\n\n    @resp_mock.activate\n    def test_initiate_paystack_error_rolls_back(self):\n        from payments.models import Payment\n        user   = UserFactory()\n        client = APIClient()\n        client.force_authenticate(user=user)\n\n        resp_mock.add(\n            resp_mock.POST,\n            "https://api.paystack.co/transaction/initialize",\n            json={"status": False, "message": "Invalid key"},\n            status=401,\n        )\n\n        res = client.post("/api/payments/initiate/",\n            {"email": user.email, "amount": 5000}, format="json")\n\n        assert res.status_code == 502\n        assert not Payment.objects.filter(user=user).exists()`}
      </CodeBlock>

      <h2>Testing webhook handler</h2>
      <CodeBlock lang="python" filename="payments/tests/test_webhooks.py">
        {`import hmac\nimport hashlib\nimport json\nimport pytest\nfrom django.test import Client\nfrom django.conf import settings\nfrom payments.models import Payment\nfrom .factories import PaymentFactory\n\n\ndef sign_payload(payload: dict) -> str:\n    body = json.dumps(payload, separators=(",", ":")).encode()\n    return hmac.new(\n        settings.PAYSTACK_WEBHOOK_SECRET.encode(),\n        msg=body,\n        digestmod=hashlib.sha512,\n    ).hexdigest()\n\n\n@pytest.mark.django_db\ndef test_valid_charge_success_updates_payment():\n    payment = PaymentFactory(reference="ref_webhook_001")\n    payload = {\n        "event": "charge.success",\n        "data": {\n            "id":        "evt_001",\n            "reference": "ref_webhook_001",\n            "amount":    500000,\n            "status":    "success",\n            "channel":   "card",\n            "customer":  {"email": payment.email},\n            "authorization": {"reusable": False},\n        }\n    }\n    sig    = sign_payload(payload)\n    client = Client()\n    res = client.post(\n        "/api/payments/webhook/",\n        data=json.dumps(payload),\n        content_type="application/json",\n        HTTP_X_PAYSTACK_SIGNATURE=sig,\n    )\n    assert res.status_code == 200\n    payment.refresh_from_db()\n    assert payment.status == "success"\n\n\n@pytest.mark.django_db\ndef test_invalid_signature_rejected():\n    client = Client()\n    res = client.post(\n        "/api/payments/webhook/",\n        data=json.dumps({"event": "charge.success", "data": {}}),\n        content_type="application/json",\n        HTTP_X_PAYSTACK_SIGNATURE="definitely_wrong",\n    )\n    assert res.status_code == 400\n\n\n@pytest.mark.django_db\ndef test_duplicate_webhook_ignored():\n    """Same event_id processed twice — second call should be a no-op."""\n    payment = PaymentFactory(reference="ref_dup_001")\n    payload = {\n        "event": "charge.success",\n        "data": {"id": "evt_dup", "reference": "ref_dup_001",\n                 "amount": 500000, "status": "success",\n                 "channel": "card",\n                 "customer": {"email": payment.email},\n                 "authorization": {"reusable": False}},\n    }\n    sig    = sign_payload(payload)\n    client = Client()\n    # First call\n    client.post("/api/payments/webhook/",\n        data=json.dumps(payload), content_type="application/json",\n        HTTP_X_PAYSTACK_SIGNATURE=sig)\n    # Second call — should return 200 but not re-process\n    res = client.post("/api/payments/webhook/",\n        data=json.dumps(payload), content_type="application/json",\n        HTTP_X_PAYSTACK_SIGNATURE=sig)\n    assert res.status_code == 200`}
      </CodeBlock>

      <h2>Paystack test cards</h2>
      <DocTable
        headers={['Card Number','Outcome','CVV','Expiry']}
        rows={[
          ['<code class="text-[#79C0FF] font-mono text-[12px]">4084 0840 8408 4081</code>','Successful charge','408','Any future date'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">4084 0840 8408 4081</code>','Insufficient funds (use pin 0000)','408','Any future date'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">5060 6666 6666 6666 666</code>','Success (Verve)','123','Any future date'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">5078 5078 5078 5078 12</code>','Success (Verve)','000','Any future date'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">3569 9900 1009 5841</code>','Success (Mastercard)','399','Any future date'],
        ]}
      />
      <Callout type="info" title="Test PIN">
        Use PIN <IC>0000</IC> for any test card that prompts for a PIN. OTP is <IC>123456</IC>.
      </Callout>
    </div>
  )
}
