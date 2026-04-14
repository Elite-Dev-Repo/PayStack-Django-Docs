import CodeBlock from '../CodeBlock'
import Endpoint from '../Endpoint'
import Callout from '../Callout'

export default function Splits() {
  return (
    <div className="doc-prose">
      <h1 className="font-serif text-4xl font-semibold mb-2 tracking-tight text-[#E8EDF5]" style={{fontFamily:'Fraunces,serif'}}>Split Payments</h1>
      <p className="text-lg text-[#A0ABBE] mb-8 leading-relaxed">
        Split a single transaction across multiple subaccounts — ideal for marketplaces, SaaS platforms, and multi-vendor applications.
      </p>

      <h2>Create a subaccount</h2>
      <Endpoint method="POST" path="/subaccount" />
      <CodeBlock lang="python" filename="payments/views.py">
        {`class CreateSubaccountView(APIView):\n    permission_classes = [IsAdminUser]\n\n    def post(self, request):\n        res = paystack.post("/subaccount", json={\n            "business_name":     request.data["business_name"],\n            "settlement_bank":   request.data["bank_code"],   # e.g. "057" for Zenith\n            "account_number":    request.data["account_number"],\n            "percentage_charge": request.data.get("percentage_charge", 0),\n            "description":       request.data.get("description", ""),\n        })\n        body = res.json()\n        if body["status"]:\n            return Response(body["data"], status=201)\n        return Response({"error": body["message"]}, status=400)`}
      </CodeBlock>

      <h2>Subaccount model</h2>
      <CodeBlock lang="python" filename="payments/models.py">
        {`class Subaccount(models.Model):\n    vendor               = models.OneToOneField(\n        User, on_delete=models.CASCADE, related_name="subaccount"\n    )\n    paystack_subaccount_code = models.CharField(max_length=100, unique=True)\n    business_name        = models.CharField(max_length=200)\n    bank_code            = models.CharField(max_length=10)\n    account_number       = models.CharField(max_length=20)\n    percentage_charge    = models.DecimalField(\n        max_digits=5, decimal_places=2, default=0\n    )\n    is_active            = models.BooleanField(default=True)\n    created_at           = models.DateTimeField(auto_now_add=True)\n\n    def __str__(self):\n        return f"{self.business_name} ({self.paystack_subaccount_code})"`}
      </CodeBlock>

      <h2>Inline split on initialize</h2>
      <p>Pass a <code style={{color:'#79C0FF',fontFamily:'monospace',fontSize:'13px'}}>split</code> object directly in the transaction initialize payload:</p>
      <CodeBlock lang="python" filename="payments/views.py">
        {`res = paystack.post("/transaction/initialize", json={\n    "email":  email,\n    "amount": total_amount_kobo,\n    "split": {\n        "type":         "percentage",   # or "flat"\n        "bearer_type":  "account",      # main account bears Paystack fees\n        "subaccounts": [\n            {"subaccount": "ACCT_vendor1xxx", "share": 60},   # 60%\n            {"subaccount": "ACCT_vendor2xxx", "share": 30},   # 30%\n            # remaining 10% stays on your main account\n        ],\n    }\n})`}
      </CodeBlock>

      <h2>Reusable split groups</h2>
      <p>For recurring splits on the same accounts, create a split group once and reference its code:</p>
      <Endpoint method="POST" path="/split" />
      <CodeBlock lang="python" filename="payments/views.py">
        {`class CreateSplitView(APIView):\n    permission_classes = [IsAdminUser]\n\n    def post(self, request):\n        res = paystack.post("/split", json={\n            "name":         request.data["name"],\n            "type":         request.data.get("type", "percentage"),\n            "currency":     request.data.get("currency", "NGN"),\n            "bearer_type":  request.data.get("bearer_type", "account"),\n            "subaccounts":  request.data["subaccounts"],\n        })\n        body = res.json()\n        if body["status"]:\n            split_code = body["data"]["split_code"]\n            return Response({"split_code": split_code}, status=201)\n        return Response({"error": body["message"]}, status=400)\n\n\n# Use split_code on any future transaction\ndef initiate_with_split(email, amount_kobo, split_code):\n    return paystack.post("/transaction/initialize", json={\n        "email":      email,\n        "amount":     amount_kobo,\n        "split_code": split_code,  # e.g. "SPL_xxx"\n    })`}
      </CodeBlock>

      <h2>Get list of banks</h2>
      <p>Fetch supported banks for subaccount creation:</p>
      <Endpoint method="GET" path="/bank" />
      <CodeBlock lang="python" filename="payments/views.py">
        {`class BankListView(APIView):\n    permission_classes = []\n\n    def get(self, request):\n        country = request.query_params.get("country", "nigeria")\n        res  = paystack.get("/bank", params={"country": country})\n        data = res.json().get("data", [])\n        return Response([\n            {"name": b["name"], "code": b["code"]} for b in data\n        ])`}
      </CodeBlock>

      <Callout type="info" title="bearer_type options">
        <ul style={{paddingLeft:'18px',color:'#A0ABBE',fontSize:'13px'}}>
          <li><code style={{color:'#79C0FF',fontFamily:'monospace'}}>account</code> — your main account bears all Paystack fees</li>
          <li><code style={{color:'#79C0FF',fontFamily:'monospace'}}>subaccount</code> — the specified subaccount bears all fees</li>
          <li><code style={{color:'#79C0FF',fontFamily:'monospace'}}>all-proportional</code> — fees split proportionally by share</li>
          <li><code style={{color:'#79C0FF',fontFamily:'monospace'}}>all</code> — all subaccounts bear fees equally</li>
        </ul>
      </Callout>
    </div>
  )
}
