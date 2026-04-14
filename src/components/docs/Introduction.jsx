import CodeBlock from "../CodeBlock";
import Callout from "../Callout";
import DocTable from "../DocTable";
import IC from "../InlineCode";
import { Steps, Step } from "../Step";

export default function Introduction() {
  return (
    <div className="doc-prose">
      <h1
        className="font-serif text-4xl font-semibold mb-2 tracking-tight text-[#E8EDF5]"
        style={{ fontFamily: "Fraunces,serif" }}
      >
        Introduction
      </h1>
      <p className="text-lg text-[#A0ABBE] mb-8 leading-relaxed">
        Paystack is Africa's leading payment gateway. This documentation covers
        everything you need to integrate Paystack into{" "}
        <strong className="text-[#E8EDF5]">Django</strong> and{" "}
        <strong className="text-[#E8EDF5]">Django REST Framework</strong> — from
        a simple one-time charge to a full subscription billing system.
      </p>
      <div className="flex flex-wrap gap-2 mb-8">
        {["Python 3.10+", "Django 4.2+", "DRF 3.15+", "Paystack API v2"].map(
          (t) => (
            <span
              key={t}
              className="bg-[#161D2E] border border-white/[0.06] text-[#5A6478] text-xs font-mono px-2.5 py-1 rounded"
            >
              {t}
            </span>
          ),
        )}
      </div>

      <h2>How it works</h2>
      <p>Paystack uses a two-step model for most transactions:</p>
      <Steps>
        <Step num="1" title="Initialize">
          Your server calls <IC>POST /transaction/initialize</IC> with the
          customer email and amount. Paystack returns an{" "}
          <IC>authorization_url</IC> and a unique <IC>reference</IC>.
        </Step>
        <Step num="2" title="Customer pays">
          Redirect the customer to the <IC>authorization_url</IC>. They enter
          card details on Paystack's hosted, PCI-compliant page.
        </Step>
        <Step num="3" title="Verify">
          Paystack redirects back to your <IC>callback_url</IC> with the
          reference in the query string. Your server calls{" "}
          <IC>GET /transaction/verify/:reference</IC>.
        </Step>
        <Step num="4" title="Webhook (recommended)">
          Paystack also POSTs a <IC>charge.success</IC> event to your webhook
          URL. This is the authoritative confirmation — your business logic
          should live here.
        </Step>
      </Steps>

      <h2>Authentication</h2>
      <p>All API calls use Bearer token authentication with your Secret Key:</p>
      <CodeBlock lang="HTTP" filename="Authorization header">
        {`Authorization: Bearer YOUR_SECRET_KEY_xxxxxxxxxxxxxxxxxx`}
      </CodeBlock>
      <Callout type="warn" title="Never expose your Secret Key">
        Your secret key goes only in server-side environment variables. Never
        commit it to source control or return it from any API endpoint.
      </Callout>

      <h2>Base URL</h2>
      <CodeBlock lang="HTTP">{`https://api.paystack.co`}</CodeBlock>

      <h2>Amount format</h2>
      <p>
        All amounts must be in the{" "}
        <strong className="text-[#E8EDF5]">smallest currency unit</strong>. For
        Nigerian Naira (NGN) that is <em>kobo</em> — multiply your naira amount
        by 100.
      </p>
      <DocTable
        headers={["Currency", "Unit", "Example: ₦1,500"]}
        rows={[
          ["NGN", "Kobo", "150000"],
          ["GHS", "Pesewa", "150000"],
          ["ZAR", "Cent", "150000"],
          ["USD", "Cent", "150000"],
        ]}
      />
    </div>
  );
}
