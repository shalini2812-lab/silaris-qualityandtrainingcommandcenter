import { createFileRoute } from "@tanstack/react-router";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Shell, Card, SectionTitle, Kpi, Badge, CatBadge } from "@/components/silaris/Shell";
import { TL_AGENTS, CRITICAL_PENDING } from "@/lib/silaris-data";

export const Route = createFileRoute("/team-leader")({
  head: () => ({ meta: [{ title: "Team Leader · Silaris" }] }),
  component: TLView,
});

const trend4w = [
  { w: "W1", v: 81.4 }, { w: "W2", v: 82.7 }, { w: "W3", v: 83.6 }, { w: "W4", v: 84.9 },
];

function TLView() {
  return (
    <Shell
      copilot={{
        summary: "Deepak Tiwari on CAP-2 — 3rd fatal error. Review required. Manish Verma training escalated — needs human intervention.",
        working: [
          "Anita Sharma — peer-coach approved for Cat B agents",
          "Sneha Joshi — moved from Cat C to Cat B (+5 pp)",
          "Team WoW trend +1.3 pp",
        ],
        attention: [
          "Deepak Tiwari — CAP-2 active, fatal review pending",
          "Manish Verma — AI coaching exhausted, classroom needed",
          "3 critical feedbacks awaiting TL acceptance",
        ],
        suggestions: [
          { title: "Accept feedback FB-9412", detail: "Deepak Tiwari · unauthorized fee waiver · zero-tolerance" },
          { title: "Schedule shadowing with Manish", detail: "2-day shadow + listen-along plan ready" },
        ],
      }}
    >
      <SectionTitle kicker="Operations · Team Leader">My Team</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <Kpi label="Team CQI Average" value="84.9%" sub="+1.3 pp WoW" badge={{ text: "On Track", tone: "green" }} />
        <Kpi label="Fatal (Trailing 30d)" value="3" sub="All on Deepak Tiwari" badge={{ text: "Review", tone: "amber" }} />
        <Kpi label="Agents Under CAP" value="2" sub="1 CAP-1 · 1 CAP-2" badge={{ text: "Monitoring", tone: "amber" }} />
        <Kpi label="Audited (Week)" value="475" sub="100% via STT" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
        <Card title="Team Roster" className="xl:col-span-2">
          <table className="w-full text-[13px]">
            <thead className="text-dim text-[11px] uppercase tracking-wider">
              <tr>
                <th className="text-left py-2 font-medium">Agent</th>
                <th className="text-right py-2 font-medium">CQI</th>
                <th className="text-left py-2 font-medium">Cat</th>
                <th className="text-center py-2 font-medium">Trend</th>
                <th className="text-right py-2 font-medium">Audited</th>
                <th className="text-right py-2 font-medium">Fatal</th>
                <th className="text-right py-2 font-medium">Non-Fatal</th>
                <th className="text-left py-2 font-medium">Training</th>
                <th className="text-left py-2 font-medium">CAP</th>
              </tr>
            </thead>
            <tbody>
              {TL_AGENTS.map((a, i) => {
                const isBottom = i >= TL_AGENTS.length - 2;
                return (
                  <tr key={a.name} className={`border-t border-border ${isBottom ? "bg-acc-sand/5" : ""}`}>
                    <td className="py-2.5">{a.name}</td>
                    <td className="py-2.5 text-right font-mono">{a.cqi.toFixed(1)}</td>
                    <td className="py-2.5"><CatBadge cat={a.cat as any} /></td>
                    <td className="py-2.5 text-center">
                      {a.trend === "up" ? <ArrowUp className="size-3.5 text-acc-green inline" />
                        : a.trend === "down" ? <ArrowDown className="size-3.5 text-acc-mauve inline" />
                        : <Minus className="size-3.5 text-dim inline" />}
                    </td>
                    <td className="py-2.5 text-right font-mono text-text-secondary">{a.audited}</td>
                    <td className={`py-2.5 text-right font-mono ${a.fatal ? "text-acc-mauve" : "text-text-secondary"}`}>{a.fatal}</td>
                    <td className="py-2.5 text-right font-mono text-text-secondary">{a.nonFatal}</td>
                    <td className="py-2.5 text-[12px] text-text-secondary">{a.train}</td>
                    <td className="py-2.5">{a.cap !== "—" ? <Badge tone="amber">{a.cap}</Badge> : <span className="text-dim">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card title="4-Week Team Trend">
          <div className="h-[260px]">
            <ResponsiveContainer>
              <LineChart data={trend4w}>
                <CartesianGrid stroke="#1c2940" vertical={false} />
                <XAxis dataKey="w" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[78, 90]} stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="v" stroke="#34d399" strokeWidth={2} dot={{ r: 4, fill: "#34d399" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Critical Feedback Pending (TL Accept / Dispute · 12h window)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CRITICAL_PENDING.map((p) => (
            <div key={p.id} className="rounded-md border border-acc-sand/30 bg-acc-sand/5 p-3">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[12px] text-dim">{p.id}</div>
                <Badge tone={p.risk === "Zero Tolerance" ? "mauve" : "sand"}>{p.risk}</Badge>
              </div>
              <div className="mt-1.5 font-medium text-[14px]">{p.agent}</div>
              <div className="text-[12.5px] text-text-secondary">Call {p.call}</div>
              <div className="text-[13px] mt-1.5">{p.issue}</div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-[11px] text-acc-sand">Deadline: {p.deadline}</div>
                <div className="flex gap-2">
                  <button className="text-[11px] px-2.5 py-1 rounded bg-acc-green/15 text-acc-green border border-acc-green/30">Accept</button>
                  <button className="text-[11px] px-2.5 py-1 rounded bg-secondary border border-border">Dispute</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Shell>
  );
}
