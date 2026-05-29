import { createFileRoute } from "@tanstack/react-router";
import { Shell, SectionTitle, Kpi } from "@/components/silaris/Shell";
import {
  TrainingPipeline,
  AgentTrainingTable,
  TrainingEffectivenessCard,
  TnaAnalysisCard,
  TRAINING_COPILOT,
} from "@/components/silaris/TrainingShared";

export const Route = createFileRoute("/training-lead")({
  head: () => ({ meta: [{ title: "Training Lead · Silaris" }] }),
  component: TrainingLead,
});

function TrainingLead() {
  return (
    <Shell copilot={TRAINING_COPILOT}>
      <SectionTitle kicker="Training">Training Lead</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <Kpi label="Plans Active" value="23" sub="across 6 TLs" />
        <Kpi label="Completed (Month)" value="34" sub="+8 WoW" badge={{ text: "On Track", tone: "green" }} />
        <Kpi label="TNA Pending" value="8" sub="auto-generated from STT" badge={{ text: "Plan", tone: "amber" }} />
        <Kpi label="Effectiveness" value="72%" sub="improved in 5 days" badge={{ text: "On Track", tone: "green" }} />
      </div>

      <TrainingPipeline />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
        <div className="xl:col-span-2">
          <AgentTrainingTable />
        </div>
        <TnaAnalysisCard />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <TrainingEffectivenessCard />
      </div>
    </Shell>
  );
}
