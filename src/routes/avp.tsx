import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import { Shell, Card, SectionTitle, Kpi } from "@/components/silaris/Shell";
import { useExecutionPanel } from "@/components/silaris/ExecutionPanel";
import { PROCESS_COMPARE, PROCESS_TREND } from "@/lib/silaris-data";

export const Route = createFileRoute("/avp")({
  head: () => ({ meta: [{ title: "AVP & Above · Silaris" }] }),
  component: AVP,
});

function AVP() {
  return (
    <Shell
      copilot={{
        summary: "Process CQI 87.1%, forecast 88.7% by W6. Training ROI ~7x — every ₹1 in AI coaching returns ₹7 in retained revenue.",
        working: ["Fatal rate at record low 0.21%", "Term & RM processes leading at 89.4 / 90.7", "Forecast bullish to W6"],
        attention: ["Savings process trails Term by 2.3 pp", "CAP-2 active for 1 agent — Compliance review needed"],
        suggestions: [
          { title: "Cross-pollinate Term best practices to Savings", detail: "Top 5 Term agents as peer coaches" },
          { title: "Approve Q2 training budget uplift", detail: "+12% — ROI justified at 7x" },
        ],
      }}
    >
      <SectionTitle kicker="Leadership">AVP &amp; Above</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <Kpi label="Process CQI" value="87.1%" sub="WoW +1.8 pp" badge={{ text: "On Track", tone: "green" }} />
        <Kpi label="Fatal Rate" value="0.21%" sub="▼ from 0.40%" badge={{ text: "Improving", tone: "green" }} />
        <Kpi label="Training ROI" value="7.0×" sub="₹1 in → ₹7 retained" badge={{ text: "Strong", tone: "green" }} />
        <Kpi label="CAP Status" value="4" sub="3 · CAP-1   1 · CAP-2" badge={{ text: "Monitor", tone: "amber" }} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
        <Card title="Process Comparison — CQI">
          <div className="h-[260px]">
            <ResponsiveContainer>
              <BarChart data={PROCESS_COMPARE}>
                <CartesianGrid stroke="#1c2940" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[80, 95]} unit="%" />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="cqi" radius={[4, 4, 0, 0]}>
                  {PROCESS_COMPARE.map((p, i) => (
                    <Cell key={i} fill={p.cqi >= 89 ? "#34d399" : p.cqi >= 86 ? "#7ba4cc" : "#d4a574"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="4-Week Trend + Forecast">
          <div className="h-[260px]">
            <ResponsiveContainer>
              <LineChart data={PROCESS_TREND}>
                <CartesianGrid stroke="#1c2940" vertical={false} />
                <XAxis dataKey="week" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[82, 91]} unit="%" />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="cqi" stroke="#34d399" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                <Line type="monotone" dataKey="forecast" stroke="#7ba4cc" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[12px] text-text-secondary">Solid = actual, dashed = forecast</div>
        </Card>
      </div>

      <Card title="Top AI Recommendations">
        <div className="grid md:grid-cols-2 gap-3">
          <Rec n={1} title="Approve refreshed HDFC counter-script process-wide">
            34 Cat-B agents to receive auto pre-call. Expected lift: +2.4 pp on Savings CQI within 3 weeks.
          </Rec>
          <Rec n={2} title="Calibration cycle — Suresh B. cluster">
            Variance to process average is 4.2 pp. Joint calibration + shadowing will normalize within 2 weeks.
          </Rec>
        </div>
      </Card>
    </Shell>
  );
}

function Rec({ n, title, children }: { n: number; title: string; children: any }) {
  return (
    <div className="rounded-md border border-acc-green/30 bg-acc-green/5 p-3">
      <div className="flex items-center gap-2">
        <span className="font-mono text-acc-green text-[18px]">#{n}</span>
        <div className="text-[14px] font-semibold">{title}</div>
      </div>
      <div className="text-[12.5px] text-foreground/85 mt-1 leading-snug">{children}</div>
      <div className="mt-2 flex gap-2">
        <button className="text-[11px] px-2.5 py-1 rounded bg-acc-green/15 text-acc-green border border-acc-green/30">Approve</button>
        <button className="text-[11px] px-2.5 py-1 rounded bg-secondary border border-border">Review</button>
      </div>
    </div>
  );
}
