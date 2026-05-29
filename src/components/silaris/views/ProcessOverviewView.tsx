import {
  Bar, ComposedChart, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { Card, Kpi, SectionTitle, Badge } from "@/components/silaris/Shell";
import {
  TOP_DEFECTS, CUSTOMER_SENTIMENT, AGENT_SENTIMENT, HEATMAP_TEAMS,
} from "@/lib/silaris-data";

const RISK_COLOR: Record<string, string> = {
  High: "#d4a574",
  Medium: "#7ba4cc",
  "Zero Tolerance": "#a78baf",
};

export function ProcessOverviewView({ kicker = "Home" }: { kicker?: string }) {
  let cum = 0;
  const total = TOP_DEFECTS.reduce((s, d) => s + d.pct, 0);
  const pareto = TOP_DEFECTS.map((d) => {
    cum += d.pct;
    return { ...d, cumulative: Math.round((cum / total) * 100) };
  });

  return (
    <>
      <SectionTitle kicker={kicker}>Process Overview</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi label="Process CQI" value="87.1%" sub="Category B · ▲ 1.8pp WoW" badge={{ text: "On Track", tone: "green" }} />
        <Kpi label="Fatal Error Rate" value="0.21%" sub="4 of 1,895 calls · ▼ from 0.4%" badge={{ text: "Improving", tone: "green" }} />
        <Kpi label="Training Effectiveness" value="72%" sub="Trained agents improved in 5 days" badge={{ text: "On Track", tone: "green" }} />
        <Kpi label="CAP Status" value="4" sub="3 on CAP-1 · 1 on CAP-2 · 0 on CAP-3" badge={{ text: "Monitoring", tone: "amber" }} />
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Top Defects — Pareto Analysis" className="xl:col-span-2">
          <div className="text-[12px] text-text-secondary mb-3">
            Top 3 defects drive 61% of all errors · Top 5 drive 81%
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer>
              <ComposedChart data={pareto} margin={{ top: 10, right: 30, bottom: 60, left: 0 }}>
                <CartesianGrid stroke="#1c2940" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} interval={0} angle={-22} textAnchor="end" height={70} />
                <YAxis yAxisId="L" stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
                <YAxis yAxisId="R" orientation="right" stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#e8ecf4" }} />
                <Bar yAxisId="L" dataKey="pct" radius={[4, 4, 0, 0]}>
                  {pareto.map((d, i) => <Cell key={i} fill={RISK_COLOR[d.risk]} />)}
                </Bar>
                <Line yAxisId="R" type="monotone" dataKey="cumulative" stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: "#34d399" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="sand">High Risk</Badge>
            <Badge tone="blue">Medium Risk</Badge>
            <Badge tone="mauve">Zero Tolerance</Badge>
            <Badge tone="green">Cumulative %</Badge>
          </div>
        </Card>

        <Card title="Sentiment Overview">
          <div className="grid grid-cols-2 gap-2">
            <SentimentDonut data={CUSTOMER_SENTIMENT} label="Customer" />
            <SentimentDonut data={AGENT_SENTIMENT} label="Agent" />
          </div>
          <div className="mt-4 rounded-md border border-acc-green/30 bg-acc-green/5 p-3 text-[12.5px] text-foreground/85 leading-snug">
            💡 Negative customer sentiment correlates with competition objection mishandling in <span className="text-acc-green font-semibold">68%</span> of cases.
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Agent Category Distribution" className="xl:col-span-1">
          {[
            { cat: "A", desc: "≥ 90%", count: 28, color: "text-acc-green", border: "border-acc-green/30" },
            { cat: "B", desc: "85 – 90%", count: 37, color: "text-acc-blue", border: "border-acc-blue/30" },
            { cat: "C", desc: "< 85%", count: 35, color: "text-acc-sand", border: "border-acc-sand/30" },
          ].map((c) => (
            <div key={c.cat} className={`mb-3 last:mb-0 flex items-center justify-between rounded-md border ${c.border} bg-surface-2 px-4 py-3`}>
              <div>
                <div className={`text-[15px] font-semibold ${c.color}`}>Category {c.cat}</div>
                <div className="text-[12px] text-dim">{c.desc}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[22px]">{c.count}</div>
                <div className="text-[11px] text-text-secondary">{Math.round((c.count / 100) * 100)}% of agents</div>
              </div>
            </div>
          ))}
        </Card>

        <Card title="Team Performance Heatmap" className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-dim text-[11px] uppercase tracking-wider">
                  <th className="text-left py-2 font-medium">TL</th>
                  {["Week 1", "Week 2", "Week 3", "Week 4"].map((w) => (
                    <th key={w} className="text-center py-2 font-medium">{w}</th>
                  ))}
                  <th className="text-center py-2 font-medium">Δ</th>
                </tr>
              </thead>
              <tbody>
                {HEATMAP_TEAMS.map((row) => {
                  const delta = row.weeks[3] - row.weeks[0];
                  return (
                    <tr key={row.tl} className="border-t border-border">
                      <td className="py-2.5 pr-3">{row.tl}</td>
                      {row.weeks.map((v, i) => (
                        <td key={i} className="py-1.5 px-1">
                          <HeatCell v={v} />
                        </td>
                      ))}
                      <td className={`text-center font-mono ${delta >= 0 ? "text-acc-green" : "text-acc-sand"}`}>
                        {delta >= 0 ? "+" : ""}{delta}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

function HeatCell({ v }: { v: number }) {
  const tone = v >= 85 ? "green" : v >= 80 ? "blue" : "mauve";
  const bg =
    tone === "green" ? "bg-acc-green/15 text-acc-green border-acc-green/30"
      : tone === "blue" ? "bg-acc-blue/15 text-acc-blue border-acc-blue/30"
        : "bg-acc-mauve/15 text-acc-mauve border-acc-mauve/30";
  return (
    <div className={`mx-auto w-[58px] text-center font-mono text-[12px] py-1.5 rounded border ${bg}`}>
      {v}%
    </div>
  );
}

function SentimentDonut({ data, label }: { data: { name: string; value: number; color: string }[]; label: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 p-3">
      <div className="text-[11px] uppercase tracking-wider text-dim mb-1.5">{label}</div>
      <div className="h-[140px] relative">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} innerRadius={36} outerRadius={56} dataKey="value" stroke="none" paddingAngle={2}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center">
            <div className="font-mono text-[18px] text-acc-green">{data[0].value}%</div>
            <div className="text-[10px] text-dim uppercase tracking-wider">positive</div>
          </div>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm" style={{ background: d.color }} />
            <span className="text-text-secondary">{d.name}</span>
            <span className="ml-auto font-mono">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
