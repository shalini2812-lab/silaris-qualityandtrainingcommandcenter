import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import { Shell, Card, SectionTitle, Kpi, Badge } from "@/components/silaris/Shell";
import { TRAINING_PIPELINE, TRAINING_AGENTS, TRAIN_EFFECTIVENESS } from "@/lib/silaris-data";

export const Route = createFileRoute("/training-lead")({
  head: () => ({ meta: [{ title: "Training Lead · Silaris" }] }),
  component: TrainingLead,
});

const TNA_GAPS = [
  { name: "Competition handling", count: 14, type: "Group" },
  { name: "T&C disclosure timing", count: 9,  type: "Group" },
  { name: "Closing technique",    count: 7,  type: "Group" },
  { name: "Product knowledge",    count: 5,  type: "Individual" },
  { name: "Active listening",     count: 4,  type: "Individual" },
];

function TrainingLead() {
  const [tab, setTab] = useState<"all" | "active" | "complete" | "escalated">("all");
  const rows = TRAINING_AGENTS.filter((r) => {
    if (tab === "all") return true;
    if (tab === "active") return r.status === "Active";
    if (tab === "complete") return r.status === "Complete";
    if (tab === "escalated") return r.status === "Escalated";
    return true;
  });

  return (
    <Shell
      copilot={{
        summary: "8 new TNA requests this week. Top need: competition handling (14 agents). 5 agents escalated to classroom — AI coaching exhausted.",
        working: ["72% of trained agents improved in 5 days", "+5 pp avg score gain (T&C cohort)", "Sneha Joshi: Cat C → Cat B"],
        attention: ["Manish Verma — no improvement after 5 days", "Deepak Tiwari — fatal during training window", "8 TNAs awaiting plan creation"],
        suggestions: [
          { title: "Auto-create group module: HDFC counter", detail: "14 agents · est. 5-day cycle" },
          { title: "Escalate Manish to classroom", detail: "2-week intensive · shadowing with Anita" },
        ],
      }}
    >
      <SectionTitle kicker="Training">Training Lead</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <Kpi label="Plans Active" value="23" sub="across 6 TLs" />
        <Kpi label="Completed (Month)" value="34" sub="+8 WoW" badge={{ text: "On Track", tone: "green" }} />
        <Kpi label="TNA Pending" value="8" sub="auto-generated from STT" badge={{ text: "Plan", tone: "amber" }} />
        <Kpi label="Effectiveness" value="72%" sub="improved in 5 days" badge={{ text: "On Track", tone: "green" }} />
      </div>

      <Card title="Training Pipeline" className="mb-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {TRAINING_PIPELINE.map((s, i) => (
            <div key={s.stage} className="flex items-center gap-2 shrink-0">
              <div className="rounded-md border border-acc-green/30 bg-acc-green/5 px-4 py-3 min-w-[150px]">
                <div className="text-[10.5px] uppercase tracking-wider text-acc-green">Stage {i + 1}</div>
                <div className="text-[14px] font-medium mt-0.5">{s.stage}</div>
                <div className="font-mono text-[22px] mt-1">{s.count}</div>
              </div>
              {i < TRAINING_PIPELINE.length - 1 && <div className="text-acc-green text-[18px]">→</div>}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
        <Card title="Agent Training Status" className="xl:col-span-2">
          <div className="flex gap-1.5 mb-3">
            {(["all", "active", "complete", "escalated"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-[12px] px-3 py-1.5 rounded border capitalize ${
                  tab === t ? "border-acc-green/40 bg-acc-green/10 text-acc-green" : "border-border bg-surface-2 text-text-secondary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <table className="w-full text-[13px]">
            <thead className="text-dim text-[11px] uppercase tracking-wider">
              <tr>
                <th className="text-left py-2 font-medium">Agent</th>
                <th className="text-left py-2 font-medium">TL</th>
                <th className="text-left py-2 font-medium">Gap</th>
                <th className="text-left py-2 font-medium">Type</th>
                <th className="text-left py-2 font-medium">Status</th>
                <th className="text-right py-2 font-medium">Pre</th>
                <th className="text-right py-2 font-medium">Post</th>
                <th className="text-right py-2 font-medium">Δ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-t border-border">
                  <td className="py-2.5">{r.name}</td>
                  <td className="py-2.5 text-text-secondary">{r.tl}</td>
                  <td className="py-2.5 text-text-secondary">{r.gap}</td>
                  <td className="py-2.5"><Badge tone="blue">{r.type}</Badge></td>
                  <td className="py-2.5"><Badge tone={r.status === "Complete" ? "green" : r.status === "Escalated" ? "mauve" : "amber"}>{r.status}</Badge></td>
                  <td className="py-2.5 text-right font-mono">{r.pre}</td>
                  <td className="py-2.5 text-right font-mono">{r.post}</td>
                  <td className={`py-2.5 text-right font-mono ${r.change >= 0 ? "text-acc-green" : "text-acc-mauve"}`}>
                    {r.change >= 0 ? "+" : ""}{r.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="TNA Analysis — Top Skill Gaps">
          <ul className="space-y-2">
            {TNA_GAPS.map((g) => (
              <li key={g.name} className="rounded-md border border-border bg-surface-2 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-medium">{g.name}</div>
                  <Badge tone={g.type === "Group" ? "blue" : "sand"}>{g.type}</Badge>
                </div>
                <div className="mt-1 text-[12px] text-text-secondary">{g.count} agents · recommend {g.type.toLowerCase()} training</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Training Effectiveness — Before vs After">
          <div className="h-[260px]">
            <ResponsiveContainer>
              <LineChart data={TRAIN_EFFECTIVENESS}>
                <CartesianGrid stroke="#1c2940" vertical={false} />
                <XAxis dataKey="week" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[60, 90]} unit="%" />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="before" stroke="#a78baf" strokeWidth={2} strokeDasharray="4 4" name="Before" />
                <Line type="monotone" dataKey="after"  stroke="#34d399" strokeWidth={2} name="After" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[12px] text-text-secondary">+10 pp average improvement in 5 weeks</div>
        </Card>

        <Card title="Improved vs Not-Improved (Last 30 Days)">
          <div className="h-[260px]">
            <ResponsiveContainer>
              <BarChart data={[
                { name: "Improved",      count: 34, color: "#34d399" },
                { name: "Maintained",    count: 9,  color: "#7ba4cc" },
                { name: "Declined",      count: 5,  color: "#d4a574" },
                { name: "Escalated",     count: 5,  color: "#a78baf" },
              ]}>
                <CartesianGrid stroke="#1c2940" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {[ "#34d399", "#7ba4cc", "#d4a574", "#a78baf" ].map((c, i) => <Cell key={i} fill={c} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
