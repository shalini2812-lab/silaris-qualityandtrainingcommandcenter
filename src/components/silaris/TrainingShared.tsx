import { Card, Badge } from "./Shell";
import { useExecutionPanel } from "./ExecutionPanel";
import { TRAINING_PIPELINE, TRAINING_AGENTS } from "@/lib/silaris-data";

const toneClasses: Record<string, string> = {
  blue:  "border-acc-blue/40 bg-acc-blue/5",
  green: "border-acc-green/40 bg-acc-green/5",
  amber: "border-acc-amber/40 bg-acc-amber/5",
  mixed: "border-acc-green/40 bg-acc-green/5",
};
const toneKicker: Record<string, string> = {
  blue: "text-acc-blue",
  green: "text-acc-green",
  amber: "text-acc-amber",
  mixed: "text-acc-green",
};

export function TrainingPipeline() {
  return (
    <Card title="Training Pipeline" className="mb-5">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {TRAINING_PIPELINE.map((s, i) => (
          <div key={s.stage} className="flex items-center gap-1.5 shrink-0">
            <div className={`rounded-md border px-3 py-2.5 min-w-[130px] ${toneClasses[s.tone]}`}>
              <div className={`text-[10px] uppercase tracking-wider ${toneKicker[s.tone]}`}>Stage {i + 1}</div>
              <div className="text-[13px] font-medium mt-0.5">{s.stage}</div>
              <div className="font-mono text-[20px] mt-1 leading-none">{s.count}</div>
            </div>
            {i < TRAINING_PIPELINE.length - 1 && (
              <div className="text-text-secondary text-[20px] leading-none">›</div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function AgentTrainingTable() {
  const exec = useExecutionPanel();
  return (
    <Card title="Agents Currently in Training">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-dim text-[11px] uppercase tracking-wider">
            <tr>
              <th className="text-left py-2 font-medium">Agent</th>
              <th className="text-left py-2 font-medium">TL</th>
              <th className="text-left py-2 font-medium">Gap Identified</th>
              <th className="text-left py-2 font-medium">Module</th>
              <th className="text-left py-2 font-medium">Status</th>
              <th className="text-right py-2 font-medium">Pre</th>
              <th className="text-right py-2 font-medium">Post</th>
              <th className="text-right py-2 font-medium">Δ</th>
              <th className="text-left py-2 font-medium pl-3">Overdue?</th>
            </tr>
          </thead>
          <tbody>
            {TRAINING_AGENTS.map((r) => {
              const overdue = r.hoursInStage > 48 && r.status !== "Complete";
              return (
                <tr
                  key={r.name}
                  className="border-t border-border hover:bg-surface-2 cursor-pointer"
                  onClick={() => exec.openFromSuggestion(
                    `Training lifecycle · ${r.name}`,
                    `Module: ${r.module} · Gap: ${r.gap} · ${r.hoursInStage}h in current stage`,
                    "Approve",
                  )}
                >
                  <td className="py-2.5 font-medium">{r.name}</td>
                  <td className="py-2.5 text-text-secondary">{r.tl}</td>
                  <td className="py-2.5 text-text-secondary">{r.gap}</td>
                  <td className="py-2.5 text-text-secondary">{r.module}</td>
                  <td className="py-2.5">
                    <Badge tone={r.status === "Complete" ? "green" : r.status === "Escalated" ? "mauve" : "amber"}>{r.status}</Badge>
                  </td>
                  <td className="py-2.5 text-right font-mono">{r.pre}</td>
                  <td className="py-2.5 text-right font-mono">{r.post}</td>
                  <td className={`py-2.5 text-right font-mono ${r.change >= 0 ? "text-acc-green" : "text-acc-mauve"}`}>
                    {r.change >= 0 ? "+" : ""}{r.change}
                  </td>
                  <td className="py-2.5 pl-3">
                    {overdue ? <Badge tone="amber">48h+</Badge> : <span className="text-dim text-[12px]">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function TrainingEffectivenessCard() {
  return (
    <Card title="Training Effectiveness">
      <div className="text-[14px] text-foreground/90 mb-4">
        <span className="font-mono text-acc-green text-[22px]">72%</span>{" "}
        of trained agents improved within 5 days.
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-md border border-acc-green/40 bg-acc-green/5 p-3">
          <div className="text-[10.5px] uppercase tracking-wider text-acc-green">Improved</div>
          <div className="font-mono text-[28px] text-acc-green mt-1">12</div>
          <div className="text-[12px] text-text-secondary mt-1">avg +6.2 pp</div>
        </div>
        <div className="rounded-md border border-acc-mauve/40 bg-acc-mauve/5 p-3">
          <div className="text-[10.5px] uppercase tracking-wider text-acc-mauve">Escalated</div>
          <div className="font-mono text-[28px] text-acc-mauve mt-1">5</div>
          <div className="text-[12px] text-text-secondary mt-1">human-led required</div>
        </div>
      </div>
      <div className="text-[12.5px] text-text-secondary leading-relaxed border-t border-border pt-3">
        Agents who improved: avg <span className="text-acc-green font-mono">+6.2</span> points.
        Agents who didn't: product knowledge gaps — need human-led sessions.
      </div>
    </Card>
  );
}

const TNA_ROWS: { name: string; count: number; rec: string; tone: "blue" | "sand" | "mauve" | "amber" }[] = [
  { name: "Competition handling", count: 14, rec: "GROUP SESSION",       tone: "blue"  },
  { name: "Closing technique",    count: 8,  rec: "INDIVIDUAL",          tone: "sand"  },
  { name: "Product knowledge",    count: 6,  rec: "HUMAN-LED",           tone: "mauve" },
  { name: "Compliance",           count: 5,  rec: "MANDATORY REFRESHER", tone: "amber" },
];

export function TnaAnalysisCard() {
  return (
    <Card title="Training Need Analysis">
      <div className="text-[12px] text-text-secondary mb-3">Top skill gaps across all agents</div>
      <ul className="space-y-2">
        {TNA_ROWS.map((g) => (
          <li key={g.name} className="rounded-md border border-border bg-surface-2 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[13px] font-medium">{g.name}</div>
                <div className="text-[12px] text-text-secondary mt-0.5">{g.count} agents</div>
              </div>
              <Badge tone={g.tone}>{g.rec}</Badge>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export const TRAINING_COPILOT = {
  summary:
    "8 new TNA requests this week. 5 agents escalated — AI coaching didn't work. Schedule human-led sessions for product knowledge gaps.",
  working: [
    "72% of trained agents improved within 5 days",
    "Avg lift +6.2 pp across AI cohorts",
    "Sneha Joshi promoted Cat C → Cat B",
  ],
  attention: [
    "5 agents escalated — AI coaching exhausted",
    "Product knowledge cohort regressed −1 pp",
    "Vikas Reddy stuck in Assessment >48h",
  ],
  suggestions: [
    { title: "Schedule human-led product knowledge clinic", detail: "6 agents · 2-week intensive with Anita as peer coach" },
    { title: "Auto-deploy HDFC group module", detail: "14 agents · est. 5-day cycle" },
  ],
};
