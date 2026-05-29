import { useState } from "react";
import { ChevronDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, SectionTitle, Badge } from "@/components/silaris/Shell";

type Trend = "rising" | "declining" | "stable";
type Attr = "PRODUCT" | "CUSTOMER";

const SCENARIOS: { text: string; calls: number; trend: Trend; attr: Attr }[] = [
  { text: "Premium too high / Pricing concern", calls: 467, trend: "stable", attr: "PRODUCT" },
  { text: "Competition comparison (HDFC / SBI / ICICI)", calls: 392, trend: "rising", attr: "PRODUCT" },
  { text: "Need time to think / Discuss with family", calls: 274, trend: "stable", attr: "CUSTOMER" },
  { text: "Don't need high cover", calls: 198, trend: "stable", attr: "CUSTOMER" },
  { text: "Money issue / Can't afford", calls: 156, trend: "declining", attr: "CUSTOMER" },
  { text: "Was just browsing / Not serious", calls: 132, trend: "stable", attr: "CUSTOMER" },
  { text: "Send details on WhatsApp", calls: 98, trend: "rising", attr: "CUSTOMER" },
  { text: "Too many medical tests required", calls: 76, trend: "stable", attr: "PRODUCT" },
  { text: "Documentation concern", calls: 58, trend: "declining", attr: "PRODUCT" },
  { text: "Already have coverage", calls: 44, trend: "stable", attr: "CUSTOMER" },
];

const QUESTIONS: { badge: string; tone: "mauve" | "amber" | "blue"; q: string; a: string }[] = [
  {
    badge: "COMPETITION", tone: "mauve",
    q: "Customer says HDFC charges are lower — how do you respond?",
    a: "Acknowledge, compare claim settlement (98.7% vs 98.3%), highlight reducing FMC (1.35% to 0.90%), mention zero allocation charge. Never say 'I'll check'.",
  },
  {
    badge: "COMPLIANCE", tone: "amber",
    q: "Customer asks for fee waiver like last year — what do you do?",
    a: "NEVER promise. Say: 'I'll check with my manager and confirm within 2 hours.' Offer early renewal discount (7%) as alternative.",
  },
  {
    badge: "COMPETITION", tone: "mauve",
    q: "Customer says premium is too high compared to SBI — how do you handle?",
    a: "Agree premium matters, then pivot to value: claim settlement 98.7%, reducing FMC, admin charges returned at maturity. Calculate total cost of ownership over 20 years.",
  },
  {
    badge: "RETENTION", tone: "blue",
    q: "Customer says 'send details on WhatsApp, I'll read later' — what do you do?",
    a: "Send details BUT also set a specific callback: 'Main details bhej rahi hoon aur kal shaam 6 baje call karungi.' Don't let the customer go without a confirmed next step.",
  },
];

export function ScenariosObjectionsView({ kicker = "Views" }: { kicker?: string }) {
  return (
    <>
      <SectionTitle kicker={kicker}>Scenarios &amp; Objections</SectionTitle>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Frequent Scenarios">
          <div className="text-[12px] text-text-secondary mb-4">
            Updated as calls are analyzed · counts are live
          </div>
          <div className="space-y-1.5">
            {SCENARIOS.map((s, i) => {
              const rank = i + 1;
              const top = rank <= 3;
              return (
                <div
                  key={s.text}
                  className={`flex items-center gap-3 rounded-md border px-3 py-2.5 ${
                    top
                      ? "border-acc-green/25 bg-acc-green/[0.05]"
                      : "border-border bg-surface-2/40"
                  }`}
                >
                  <div className="font-mono text-[12px] text-dim w-5 text-right">{rank}</div>
                  <div className="flex-1 text-[13px] text-foreground/90">{s.text}</div>
                  <div className="font-mono text-[12.5px] text-text-secondary w-14 text-right">{s.calls}</div>
                  <TrendIcon t={s.trend} />
                  <div className="w-[88px] flex justify-end">
                    <Badge tone={s.attr === "PRODUCT" ? "sand" : "blue"}>{s.attr}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-[11.5px] text-dim italic">
            AI adds new scenarios automatically as they are detected from calls.
          </div>
        </Card>

        <Card title="Objection Handling Assessment">
          <div className="text-[12px] text-text-secondary mb-4">
            Test your agents on these scenarios
          </div>
          <div className="space-y-2">
            {QUESTIONS.map((q, i) => (
              <QuestionRow key={i} q={q} />
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function TrendIcon({ t }: { t: Trend }) {
  if (t === "rising") return <TrendingUp className="size-4 text-acc-sand" />;
  if (t === "declining") return <TrendingDown className="size-4 text-acc-green" />;
  return <Minus className="size-4 text-dim" />;
}

function QuestionRow({ q }: { q: typeof QUESTIONS[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-border bg-surface-2/40 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 text-left px-3 py-3 hover:bg-secondary/40 transition-colors"
      >
        <Badge tone={q.tone}>{q.badge}</Badge>
        <div className="flex-1 text-[13px] text-foreground/90">{q.q}</div>
        <ChevronDown className={`size-4 text-dim transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-acc-green/25 bg-acc-green/[0.06] px-3 py-3">
          <div className="text-[10.5px] uppercase tracking-wider text-acc-green font-medium mb-1.5">
            Correct Approach
          </div>
          <div className="text-[12.5px] text-foreground/90 leading-relaxed">{q.a}</div>
        </div>
      )}
    </div>
  );
}
