import { createFileRoute } from "@tanstack/react-router";
import { Shell, Card, SectionTitle, Kpi, Badge } from "@/components/silaris/Shell";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TRAIN_EFFECTIVENESS } from "@/lib/silaris-data";
import {
  TrainingPipeline,
  AgentTrainingTable,
  TrainingEffectivenessCard,
  TnaAnalysisCard,
  TRAINING_COPILOT,
} from "@/components/silaris/TrainingShared";

export const Route = createFileRoute("/training-manager")({
  head: () => ({ meta: [{ title: "Training Manager · Silaris" }] }),
  component: TM,
});

const COHORTS = [
  { name: "Competition handling (Apr-W1)", agents: 14, lift: "+4.1 pp", status: "On Track" },
  { name: "T&C timing (Mar-W4)",           agents: 9,  lift: "+3.2 pp", status: "Complete" },
  { name: "Closing technique (Mar-W2)",    agents: 7,  lift: "+5.0 pp", status: "Complete" },
  { name: "Product knowledge (Apr-W2)",    agents: 5,  lift: "−1.0 pp", status: "Escalated" },
];

function TM() {
  return (
    <Shell copilot={TRAINING_COPILOT}>
      <SectionTitle kicker="Training · Manager">Training Effectiveness</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <Kpi label="Effectiveness" value="72%" sub="improved in 5 days" badge={{ text: "On Track", tone: "green" }} />
        <Kpi label="ROI" value="7.0×" sub="₹ retained / ₹ spent" badge={{ text: "Strong", tone: "green" }} />
        <Kpi label="Cohorts Active" value="4" sub="35 agents in flight" />
        <Kpi label="Escalations" value="5" sub="to classroom" badge={{ text: "Action", tone: "amber" }} />
      </div>

      <TrainingPipeline />

      <AiVsHumanTraining />


      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
        <div className="xl:col-span-2">
          <AgentTrainingTable />
        </div>
        <TnaAnalysisCard />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <TrainingEffectivenessCard />

        <Card title="Cohort Performance" className="xl:col-span-1">
          <table className="w-full text-[13px]">
            <thead className="text-dim text-[11px] uppercase tracking-wider">
              <tr>
                <th className="text-left py-2 font-medium">Cohort</th>
                <th className="text-right py-2 font-medium">Agents</th>
                <th className="text-right py-2 font-medium">Lift</th>
                <th className="text-left py-2 font-medium pl-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {COHORTS.map((c) => (
                <tr key={c.name} className="border-t border-border">
                  <td className="py-2.5">{c.name}</td>
                  <td className="py-2.5 text-right font-mono">{c.agents}</td>
                  <td className={`py-2.5 text-right font-mono ${c.lift.startsWith("+") ? "text-acc-green" : "text-acc-mauve"}`}>{c.lift}</td>
                  <td className="py-2.5 pl-3">
                    <Badge tone={c.status === "Complete" ? "green" : c.status === "Escalated" ? "mauve" : "blue"}>{c.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Before vs After">
          <div className="h-[240px]">
            <ResponsiveContainer>
              <LineChart data={TRAIN_EFFECTIVENESS}>
                <CartesianGrid stroke="#1c2940" vertical={false} />
                <XAxis dataKey="week" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[60, 90]} unit="%" />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="before" stroke="#a78baf" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="after"  stroke="#34d399" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </Shell>
  );
}

function AiVsHumanTraining() {
  const aiPct = 85;
  const humanPct = 15;
  const reasons = [
    { label: "Product knowledge gaps (conceptual, not scriptable)", count: 3 },
    { label: "Behavioral / attitude issues", count: 1 },
    { label: "Compliance re-certification (mandatory human audit)", count: 1 },
  ];
  return (
    <div className="my-5">
      <Card title="AI vs Human Training">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* LEFT — Delivery breakdown */}
          <div>
            <div className="text-[12px] uppercase tracking-wider text-dim mb-3">Training Delivery Breakdown</div>
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-surface-2 border border-border">
              <div className="h-full bg-acc-green" style={{ width: `${aiPct}%` }} />
              <div className="h-full bg-acc-sand" style={{ width: `${humanPct}%` }} />
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-md border border-acc-green/30 bg-acc-green/5 p-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-[13px] font-semibold text-acc-green">AI-Led Training</div>
                  <div className="font-mono text-[14px] text-acc-green">29 agents · 85%</div>
                </div>
                <div className="mt-1 text-[12px] text-text-secondary leading-snug">
                  Auto-generated modules delivered to desktop. No trainer time required.
                </div>
              </div>
              <div className="rounded-md border border-acc-sand/30 bg-acc-sand/5 p-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-[13px] font-semibold text-acc-sand">Human-Led Training</div>
                  <div className="font-mono text-[14px] text-acc-sand">5 agents · 15%</div>
                </div>
                <div className="mt-1 text-[12px] text-text-secondary leading-snug">
                  Escalated after AI coaching showed no improvement in 5 days.
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Why Human */}
          <div>
            <div className="text-[12px] uppercase tracking-wider text-dim mb-3">Why Human Intervention Was Needed</div>
            <ul className="space-y-2">
              {reasons.map((r) => (
                <li key={r.label} className="flex items-center justify-between rounded-md border border-border bg-surface-2/60 px-3 py-2.5 text-[13px]">
                  <span className="text-foreground/90">{r.label}</span>
                  <span className="font-mono text-acc-sand text-[12.5px] whitespace-nowrap ml-3">{r.count} {r.count === 1 ? "agent" : "agents"}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 rounded-md border border-acc-green/30 bg-acc-green/5 p-3.5 text-[12.5px] text-foreground/90 leading-snug">
          💡 AI autonomously trained <span className="text-acc-green font-semibold">85%</span> of agents who needed coaching. Human trainers were deployed only for the <span className="text-acc-sand font-semibold">5 cases</span> where AI coaching didn't move scores after 5 days. Estimated trainer time saved: <span className="font-mono text-acc-green">142 hours/month</span>.
        </div>
      </Card>
    </div>
  );
}

