import { createFileRoute } from "@tanstack/react-router";
import { Shell, ProcessOverviewView } from "@/components/silaris/Shell";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Process Overview · Silaris" }] }),
  component: ProcessOverview,
});

function ProcessOverview() {
  return (
    <Shell
      copilot={{
        summary:
          "Objection handling is the #1 defect (28%). AI has auto-deployed competition scripts to 34 agents. T&C disclosure improving — down 5pp after AI pre-call prompts.",
        working: [
          "Fatal rate down to 0.21% (from 0.4%)",
          "72% of trained agents improved in 5 days",
          "Pooja S. team CQI up 3pp week-over-week",
        ],
        attention: [
          "Suresh B. team CQI down 3pp — drill required",
          "Competition objection handling stuck at 28% defect share",
          "1 agent on CAP-2 (Deepak Tiwari) — review pending",
        ],
        suggestions: [
          { title: "Deploy refreshed HDFC counter-script", detail: "Pushes new FMC + admin refund pivots to 34 Cat-B agents." },
          { title: "Schedule calibration session", detail: "Variance > 4pp between TL Pooja S. and Suresh B." },
        ],
      }}
    >
      <ProcessOverviewView kicker="Home" />
    </Shell>
  );
}
