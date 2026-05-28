import { createFileRoute } from "@tanstack/react-router";
import { Shell, Card, SectionTitle, Badge } from "@/components/silaris/Shell";
import { Download, FileText } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports · Silaris" }] }),
  component: Reports,
});

const REPORTS = [
  { name: "Weekly Quality Pack", desc: "CQI summary, top defects, fatals — PDF + CSV", cadence: "Weekly · Mon 8am", tone: "green" as const },
  { name: "TL Performance Digest", desc: "All TLs, deltas, agent leaderboards", cadence: "Weekly · Mon 8am", tone: "blue" as const },
  { name: "Training Effectiveness", desc: "Cohort lift, ROI, escalations", cadence: "Monthly · 1st", tone: "blue" as const },
  { name: "Compliance Audit Trail", desc: "All fatals, CAP actions, sign-offs", cadence: "Monthly · 1st", tone: "amber" as const },
  { name: "VoC + Competition Brief", desc: "For AMLI marketing team", cadence: "Bi-weekly", tone: "mauve" as const },
  { name: "Executive Snapshot", desc: "AVP & above · single page", cadence: "Weekly · Mon 7am", tone: "green" as const },
];

function Reports() {
  return (
    <Shell copilot={{
      summary: "6 scheduled reports active. All current period reports generated successfully.",
      working: ["All weekly reports delivered on time", "Auto-distribution to 14 stakeholders"],
      attention: ["Compliance audit trail awaits manager sign-off"],
      suggestions: [
        { title: "Add Hindi-language exec brief", detail: "Region-language for ZSMs" },
        { title: "Pin VoC brief to AMLI mktg Slack", detail: "Bi-weekly digest" },
      ],
    }}>
      <SectionTitle kicker="Views">Reports</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {REPORTS.map((r) => (
          <Card key={r.name}>
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-md bg-acc-green/10 text-acc-green border border-acc-green/30 grid place-items-center shrink-0">
                <FileText className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="text-[14.5px] font-semibold truncate">{r.name}</div>
                  <Badge tone={r.tone}>Live</Badge>
                </div>
                <div className="text-[12.5px] text-text-secondary mt-0.5 leading-snug">{r.desc}</div>
                <div className="text-[11.5px] text-dim mt-2">{r.cadence}</div>
                <div className="mt-3 flex gap-2">
                  <button className="inline-flex items-center gap-1.5 text-[11.5px] px-2.5 py-1 rounded bg-acc-green/15 text-acc-green border border-acc-green/30">
                    <Download className="size-3.5" /> Download
                  </button>
                  <button className="text-[11.5px] px-2.5 py-1 rounded bg-secondary border border-border">Configure</button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
