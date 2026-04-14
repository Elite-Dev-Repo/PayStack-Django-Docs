import CodeBlock from '../CodeBlock'
import DocTable from '../DocTable'
import IC from '../InlineCode'

export default function Configuration() {
  return (
    <div className="doc-prose">
      <h1 className="font-serif text-4xl font-semibold mb-2 tracking-tight text-[#E8EDF5]" style={{fontFamily:'Fraunces,serif'}}>Configuration</h1>
      <p className="text-lg text-[#A0ABBE] mb-8 leading-relaxed">All Django settings and the reusable Paystack client available for your integration.</p>

      <h2>Settings reference</h2>
      <DocTable
        headers={['Setting','Type','Required','Description']}
        rows={[
          ['<code class="text-[#79C0FF] font-mono text-[12px]">PAYSTACK_SECRET_KEY</code>','str','Yes','Secret Key (sk_test_ or sk_live_)'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">PAYSTACK_PUBLIC_KEY</code>','str','Yes','Public Key (pk_test_ or pk_live_)'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">PAYSTACK_CALLBACK_URL</code>','str','Yes','Absolute URL Paystack redirects to after payment'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">PAYSTACK_WEBHOOK_SECRET</code>','str','Yes','Used to verify HMAC-SHA512 webhook signatures'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">PAYSTACK_BASE_URL</code>','str','No','Override API base URL (default: https://api.paystack.co)'],
          ['<code class="text-[#79C0FF] font-mono text-[12px]">PAYSTACK_TIMEOUT</code>','int','No','HTTP request timeout in seconds (default: 10)'],
        ]}
      />

      <h2>Reusable Paystack client</h2>
      <p>Create a singleton client module so you never repeat headers across views:</p>
      <CodeBlock lang="python" filename="payments/client.py">
        {`import requests\nfrom django.conf import settings\n\nBASE    = getattr(settings, "PAYSTACK_BASE_URL", "https://api.paystack.co")\nTIMEOUT = getattr(settings, "PAYSTACK_TIMEOUT", 10)\n\n\nclass PaystackClient:\n    def __init__(self):\n        self.session = requests.Session()\n        self.session.headers.update({\n            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",\n            "Content-Type":  "application/json",\n        })\n\n    def get(self, path, **kwargs):\n        return self.session.get(f"{BASE}{path}", timeout=TIMEOUT, **kwargs)\n\n    def post(self, path, **kwargs):\n        return self.session.post(f"{BASE}{path}", timeout=TIMEOUT, **kwargs)\n\n    def put(self, path, **kwargs):\n        return self.session.put(f"{BASE}{path}", timeout=TIMEOUT, **kwargs)\n\n    def delete(self, path, **kwargs):\n        return self.session.delete(f"{BASE}{path}", timeout=TIMEOUT, **kwargs)\n\n\n# Singleton — import this throughout your app\npaystack = PaystackClient()`}
      </CodeBlock>
      <p>Usage anywhere in your app:</p>
      <CodeBlock lang="python">
        {`from payments.client import paystack\n\nres  = paystack.post("/transaction/initialize", json=payload)\ndata = res.json()`}
      </CodeBlock>
    </div>
  )
}
