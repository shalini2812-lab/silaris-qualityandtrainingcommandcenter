import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Quote } from "lucide-react";
import { Card, SectionTitle, Badge } from "@/components/silaris/Shell";
import { VOC_PAIN, VOC_SCENARIOS, NI_ATTRIBUTION } from "@/lib/silaris-data";

export function VocView({ kicker = "Analytics" }: { kicker?: string }) {
  let cum = 0;
  const total = VOC_PAIN.reduce((s, d) => s + d.pct, 0);
  const pareto = VOC_PAIN.map((d) => {
    cum += d.pct;
    return { ...d, cumulative: Math.round((cum / total) * 100) };
  });

  return (
    <>
      <SectionTitle kicker={kicker}>Voice of Customer</SectionTitle>

      <Card title="Customer Pain Points — Pareto" className="mb-5">
        <div className="h-[300px]">
          <ResponsiveContainer>
            <ComposedChart data={pareto} margin={{ bottom: 60 }}>
              <CartesianGrid stroke="#1c2940" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} angle={-18} textAnchor="end" interval={0} height={70} />
              <YAxis yAxisId="L" stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
              <YAxis yAxisId="R" orientation="right" stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
              <Bar yAxisId="L" dataKey="pct" radius={[4, 4, 0, 0]} fill="#d4a574" />
              <Line yAxisId="R" type="monotone" dataKey="cumulative" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
        <Card title="Customer Scenarios (verbatim)" className="xl:col-span-2">
          <div className="grid md:grid-cols-2 gap-3">
            {VOC_SCENARIOS.map((s, i) => (
              <div key={i} className="rounded-md border border-border bg-surface-2 p-3">
                <div className="flex gap-2">
                  <Quote className="size-4 text-acc-sand mt-0.5 shrink-0" />
                  <div className="text-[13.5px] italic text-foreground/90">"{s.quote}"</div>
                </div>
                <div className="mt-2 text-[12.5px] text-acc-green">→ {s.insight}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="NI Attribution">
          <div className="h-[200px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={NI_ATTRIBUTION} innerRadius={50} outerRadius={80} dataKey="value" stroke="none" paddingAngle={2}>
                  {NI_ATTRIBUTION.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1 text-[12.5px]">
            {NI_ATTRIBUTION.map((d) => (
              <li key={d.name} className="flex items-center gap-2">
                <span className="size-2 rounded-sm" style={{ background: d.color }} />
                <span className="text-text-secondary">{d.name}</span>
                <span className="ml-auto font-mono">{d.value}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Marketing Recommendations (for AMLI)">
        <div className="grid md:grid-cols-3 gap-3 text-[13px]">
          <Rec title="Charges explainer" badge="High impact">
            45% of pain is expectation vs offering. Publish a 60-second charges video on landing pages — explicitly show admin refund + FMC reduction.
          </Rec>
          <Rec title="Competition microsite" badge="Quick win">
            Build "Compare us with HDFC / SBI / ICICI" page — neutral table format. Equip agents to refer customers directly during calls.
          </Rec>
          <Rec title="Pre-call SMS" badge="Pilot">
            Send 30-second expectation-setter SMS before agent calls — reduces objections by ~12% in pilot regions.
          </Rec>
        </div>
      </Card>
    </>
  );
}

function Rec({ title, badge, children }: { title: string; badge: string; children: any }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 p-3">
      <div className="flex items-center justify-between">
        <div className="text-[14px] font-semibold">{title}</div>
        <Badge tone="green">{badge}</Badge>
      </div>
      <div className="mt-1.5 text-[12.5px] text-text-secondary leading-snug">{children}</div>
    </div>
  );
}
