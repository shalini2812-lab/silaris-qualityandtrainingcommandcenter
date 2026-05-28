import { createFileRoute } from "@tanstack/react-router";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Shell, Card, SectionTitle, Badge } from "@/components/silaris/Shell";
import { COMPETITOR_SHARE, FEATURE_TABLE } from "@/lib/silaris-data";

export const Route = createFileRoute("/competition")({
  head: () => ({ meta: [{ title: "Competition Analysis · Silaris" }] }),
  component: Competition,
});

const TREND = [
  { w: "W1", HDFC: 34, SBI: 30, ICICI: 19 },
  { w: "W2", HDFC: 37, SBI: 29, ICICI: 18 },
  { w: "W3", HDFC: 40, SBI: 28, ICICI: 18 },
  { w: "W4", HDFC: 42, SBI: 28, ICICI: 18 },
];

const CUSTOMER_Qs = [
  { q: "HDFC zero allocation hai, aapke yahaan kya hai?", a: "Hamare yahaan bhi Zero Allocation Charge hai — aur extra FMC reduction (1.35% → 0.90%)." },
  { q: "SBI mein 26 fund options hain, aapke paas?",      a: "Hamare paas 22 funds — sabhi mein free unlimited switching, SBI mein switching nahi." },
  { q: "Admin charge ₹500/month bahut zyada nahi?",       a: "Maturity par poora admin charge wapas mil jaata hai — net cost zero." },
  { q: "Claim settlement ratio kya hai?",                  a: "98.7% — industry mein top tier (HDFC 98.3%, SBI 97.1%)." },
  { q: "ICICI fund switching free hai?",                   a: "ICICI mein sirf 4 free switches per year. Hamare yahaan unlimited free." },
];

function Competition() {
  return (
    <Shell
      copilot={{
        summary: "HDFC mentions up 8% this month. Primary claim: zero allocation. Our counter: we ALSO have zero + reducing FMC. Script updated and deployed.",
        working: ["7 of 7 feature comparisons either win or parity", "Claim settlement 98.7% — best in cohort", "Free unlimited switching unique to us"],
        attention: ["HDFC mention share trending +8% MoM", "32 agents still weak on competition pivot"],
        suggestions: [
          { title: "Deploy refreshed HDFC battle card", detail: "Auto-attach to pre-call for 32 weak agents" },
          { title: "Launch SBI feature-counter", detail: "Switching cost + admin charge angle" },
        ],
      }}
    >
      <SectionTitle kicker="Analytics">Competition Analysis</SectionTitle>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
        <Card title="Competitor Mention Frequency">
          <div className="h-[200px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={COMPETITOR_SHARE} innerRadius={50} outerRadius={80} dataKey="value" stroke="none" paddingAngle={2}>
                  {COMPETITOR_SHARE.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1 text-[12.5px]">
            {COMPETITOR_SHARE.map((d) => (
              <li key={d.name} className="flex items-center gap-2">
                <span className="size-2 rounded-sm" style={{ background: d.color }} />
                <span className="text-text-secondary">{d.name}</span>
                <span className="ml-auto font-mono">{d.value}%</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="4-Week Mention Trend" className="xl:col-span-2">
          <div className="h-[240px]">
            <ResponsiveContainer>
              <LineChart data={TREND}>
                <CartesianGrid stroke="#1c2940" vertical={false} />
                <XAxis dataKey="w" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="HDFC" stroke="#d4a574" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="SBI"  stroke="#7ba4cc" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="ICICI" stroke="#a78baf" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Feature-Benefit Comparison" className="mb-5">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="text-dim text-[11px] uppercase tracking-wider">
              <tr>
                <th className="text-left py-2 font-medium">Feature</th>
                <th className="text-left py-2 font-medium">Axis Max Life</th>
                <th className="text-left py-2 font-medium">HDFC Life</th>
                <th className="text-left py-2 font-medium">SBI Life</th>
                <th className="text-left py-2 font-medium">ICICI Pru</th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_TABLE.map((r) => (
                <tr key={r.feature} className="border-t border-border">
                  <td className="py-2.5 font-medium">{r.feature}</td>
                  <CellTone>{r.amli}{r.wins.includes("amli") && " ✓"}</CellTone>
                  <CellTone tone={r.wins.includes("hdfc") ? "win" : undefined}>{r.hdfc}</CellTone>
                  <CellTone tone={r.wins.includes("sbi") ? "win" : undefined}>{r.sbi}</CellTone>
                  <CellTone tone={r.wins.includes("icici") ? "win" : undefined}>{r.icici}</CellTone>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex gap-2">
          <Badge tone="green">Axis Max Life wins</Badge>
          <Badge tone="neutral">Parity</Badge>
          <Badge tone="mauve">Competitor wins</Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Top Customer Questions (verbatim)" className="xl:col-span-2">
          <ul className="space-y-2">
            {CUSTOMER_Qs.map((q, i) => (
              <li key={i} className="rounded-md border border-border bg-surface-2 p-3">
                <div className="text-[13px] italic text-foreground/90">"{q.q}"</div>
                <div className="text-[12.5px] text-acc-green mt-1">→ {q.a}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Agent Preparedness">
          <div className="grid grid-cols-2 gap-2">
            <Mini label="Handle well" value="68" sub="agents" tone="green" />
            <Mini label="Need training" value="32" sub="agents" tone="sand" />
          </div>
          <div className="mt-3 text-[12.5px] text-text-secondary leading-snug">
            Updated HDFC counter-script deployed to all 32 weak agents. Reassessment scheduled Day 5.
          </div>
        </Card>
      </div>
    </Shell>
  );
}

function CellTone({ children, tone }: { children: any; tone?: "win" }) {
  const cls = tone === "win"
    ? "bg-acc-mauve/10 text-acc-mauve"
    : "text-foreground";
  return <td className={`py-2.5 pr-3 ${cls}`}>{children}</td>;
}

function Mini({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "green" | "sand" }) {
  const cls = tone === "green" ? "border-acc-green/30 text-acc-green" : "border-acc-sand/30 text-acc-sand";
  return (
    <div className={`rounded-md border ${cls} bg-surface-2 p-3`}>
      <div className="text-[11px] uppercase tracking-wider text-dim">{label}</div>
      <div className="font-mono text-[24px] mt-0.5">{value}</div>
      <div className="text-[11px] text-text-secondary">{sub}</div>
    </div>
  );
}
