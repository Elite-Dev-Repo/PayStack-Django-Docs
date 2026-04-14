import { LANDING_TOPICS } from "../data/docs";

import {
  Zap,
  RefreshCcw,
  Link,
  Blocks,
  ShieldCheck,
  TestTubeDiagonal,
} from "lucide-react";

const HERO_CODE = `<span class="kw">import</span> hmac, hashlib, requests
<span class="kw">from</span> rest_framework.views <span class="kw">import</span> <span class="cl">APIView</span>
<span class="kw">from</span> rest_framework.response <span class="kw">import</span> <span class="cl">Response</span>
<span class="kw">from</span> django.conf <span class="kw">import</span> settings

<span class="kw">class</span> <span class="cl">InitiatePaymentView</span>(<span class="cl">APIView</span>):
    <span class="kw">def</span> <span class="fn">post</span>(<span class="kw">self</span>, request):
        payload = {
            <span class="st">"email"</span>:  request.data[<span class="st">"email"</span>],
            <span class="st">"amount"</span>: request.data[<span class="st">"amount"</span>] * <span class="nu">100</span>,
            <span class="st">"callback_url"</span>: settings.<span class="cl">PAYSTACK_CALLBACK_URL</span>,
        }
        res = requests.<span class="fn">post</span>(
            <span class="st">"https://api.paystack.co/transaction/initialize"</span>,
            json=payload,
            headers={<span class="st">"Authorization"</span>: <span class="fn">f</span><span class="st">"Bearer {settings.PAYSTACK_SECRET_KEY}"</span>}
        )
        <span class="kw">return</span> <span class="cl">Response</span>(res.<span class="fn">json</span>())`;

const FEATURES = [
  {
    icon: <Zap />,
    title: "Quick Setup",
    desc: "Environment config, secret key management, Django settings, and your first transaction in minutes.",
  },
  {
    icon: <RefreshCcw />,
    title: "Recurring Billing",
    desc: "Plans, subscriptions, authorization codes, and automated renewals with full Django model support.",
  },
  {
    icon: <Link />,
    title: "Webhooks + WebSockets",
    desc: "HMAC-verified webhook handlers and Django Channels real-time payment status broadcasting.",
  },
  {
    icon: <Blocks />,
    title: "DRF Integration",
    desc: "Serializers, ViewSets, permissions, throttling, and full OpenAPI-compatible routing.",
  },
  {
    icon: <ShieldCheck />,
    title: "Security First",
    desc: "CSRF exemption patterns, HMAC verification, idempotency keys, and replay attack prevention.",
  },
  {
    icon: <TestTubeDiagonal />,
    title: "Testing Guide",
    desc: "pytest-django patterns, mock strategies, test cards, and webhook simulation helpers.",
  },
];

const badgeStyle = {
  core: { bg: "rgba(121,192,255,0.12)", color: "#79C0FF", label: "Core" },
  advanced: {
    bg: "rgba(207,141,251,0.12)",
    color: "#CF8DFB",
    label: "Advanced",
  },
  new: { bg: "rgba(0,212,106,0.12)", color: "#00D46A", label: "New" },
};

export default function LandingPage({ setPage, setActiveDoc }) {
  const goDoc = (id) => {
    setActiveDoc(id);
    setPage("docs");
  };

  return (
    <div className="pt-14">
      {/* HERO */}
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
        <div
          className="inline-flex items-center gap-2 text-[12px] font-medium text-[#00D46A] px-3.5 py-1.5 rounded-full mb-7 border"
          style={{
            background: "rgba(0,212,106,0.06)",
            borderColor: "rgba(0,212,106,0.2)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D46A] pulse-dot" />
          Python-first · DRF ready · Production grade
        </div>

        <h1
          className="text-[clamp(40px,6vw,68px)] font-semibold leading-[1.1] tracking-tight mb-5 text-[#E8EDF5]"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Accept payments in
          <br />
          Django. <em className="text-[#00D46A]">The right way.</em>
        </h1>

        <p className="text-[17px] text-[#A0ABBE] max-w-[540px] mx-auto mb-10 leading-relaxed">
          The only comprehensive guide for integrating Paystack into Django &
          DRF — from a single charge to full recurring billing.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => goDoc("quickstart")}
            className="bg-[#00D46A] text-black font-semibold text-[14px] px-7 py-3 rounded-lg border-none cursor-pointer hover:opacity-88 transition-all hover:-translate-y-px"
          >
            Read the Docs
          </button>
          <button
            onClick={() => goDoc("introduction")}
            className="bg-transparent text-[#E8EDF5] font-medium text-[14px] px-7 py-3 rounded-lg cursor-pointer transition-all hover:-translate-y-px hover:text-[#00D46A]"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Browse topics
          </button>
        </div>

        {/* Code preview */}
        <div
          className="mt-16 rounded-xl overflow-hidden text-left"
          style={{
            border: "1px solid rgba(255,255,255,0.06)",
            background: "#111622",
          }}
        >
          <div
            className="flex items-center gap-1.5 px-4 py-2.5"
            style={{
              background: "#161D2E",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            <span className="ml-2 text-[12px] text-[#5A6478] font-mono">
              payments/views.py
            </span>
          </div>
          <pre className="p-5 overflow-x-auto m-0 text-[12.5px] leading-[1.8]">
            <code dangerouslySetInnerHTML={{ __html: HERO_CODE }} />
          </pre>
        </div>
      </div>

      {/* FEATURES */}
      <div className="max-w-[1100px] mx-auto px-6 pb-20">
        <div className="text-[12px] font-medium text-[#00D46A] tracking-widest uppercase mb-3">
          Everything covered
        </div>
        <h2
          className="text-[clamp(28px,4vw,40px)] font-semibold mb-10 text-[#E8EDF5]"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Built for serious Django developers
        </h2>
        <div
          className="grid rounded-xl overflow-hidden"
          style={{
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "1px",
            background: "rgba(255,255,255,0.06)",
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-7 transition-colors"
              style={{ background: "#111622" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#161D2E")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#111622")
              }
            >
              <div className="text-[22px] mb-3.5 p-2 w-fit rounded-lg  text-white">
                {f.icon}
              </div>
              <div className="text-[15px] font-semibold mb-2 text-[#E8EDF5]">
                {f.title}
              </div>
              <div className="text-[13px] text-[#A0ABBE] leading-relaxed">
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOPICS */}
      <div className="max-w-[1100px] mx-auto px-6 pb-24">
        <div className="text-[12px] font-medium text-[#00D46A] tracking-widest uppercase mb-3">
          Documentation
        </div>
        <h2
          className="text-[clamp(28px,4vw,40px)] font-semibold mb-10 text-[#E8EDF5]"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          All topics
        </h2>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}
        >
          {LANDING_TOPICS.map((t) => {
            const b = badgeStyle[t.badge];
            return (
              <button
                key={t.id}
                onClick={() => goDoc(t.id)}
                className="text-left p-5 rounded-xl cursor-pointer bg-transparent transition-all relative overflow-hidden group"
                style={{
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "#111622",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0,212,106,0.25)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#00D46A] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-[11px] font-mono text-[#5A6478] mb-2">
                  {t.num}
                </div>
                <div className="text-[14px] font-semibold text-[#E8EDF5] mb-1">
                  {t.name}
                </div>
                <div className="text-[12px] text-[#A0ABBE] mb-2">{t.desc}</div>
                <span
                  className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded tracking-wider"
                  style={{ background: b.bg, color: b.color }}
                >
                  {b.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
