import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { X, CheckCircle2, Clock, Download, RotateCcw, Sparkles } from "lucide-react";

export type ExecKind =
  | "training"
  | "compliance"
  | "competition"
  | "agentCoaching"
  | "teamDrilldown"
  | "escalation"
  | "lifecycle"
  | "matrix"
  | "reassignment"
  | "generic";
export type ExecStatus = "EXECUTED" | "PENDING";

export interface ExecPayload {
  kind: ExecKind;
  status: ExecStatus;
  title: string;
  summary: string;
  metrics: { label: string; value: string }[];
  timeline: { label: string; time: string; state: "done" | "active" | "pending" }[];
  details: { k: string; v: string }[];
}

interface Ctx {
  open: (p: ExecPayload) => void;
  openFromSuggestion: (title: string, detail: string, action: "Approve" | "Review") => void;
}

const ExecCtx = createContext<Ctx | null>(null);

export function useExecutionPanel() {
  const c = useContext(ExecCtx);
  if (!c) throw new Error("ExecutionPanel provider missing");
  return c;
}

function ts(offsetMin: number): string {
  const d = new Date(Date.now() - offsetMin * 60000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function detectKind(text: string): ExecKind {
  const t = text.toLowerCase();
  if (/(escalat)/.test(t)) return "escalation";
  if (/(matrix|fba|competitor compar|axis max life vs)/.test(t)) return "matrix";
  if (/(lifecycle|training pipeline|stage [1-7]|pipeline)/.test(t)) return "lifecycle";
  if (/(compli|breach|irda|t&c|disclos|fatal|fee waiver|suspend)/.test(t)) return "compliance";
  if (/(reassign|lead allocation|route lead|re-route)/.test(t)) return "reassignment";
  if (/(script|rebuttal|hdfc|sbi|competition|counter-script)/.test(t)) return "competition";
  if (/(team |cluster|tl team|team leader|drilldown)/.test(t)) return "teamDrilldown";
  if (/(coaching plan|coach for|cap-|agent.*cqi|deploy coaching)/.test(t)) return "agentCoaching";
  if (/(train|module|assessment|tna|feedback)/.test(t)) return "training";
  return "generic";
}

function buildPayload(title: string, detail: string, action: "Approve" | "Review"): ExecPayload {
  const kind = detectKind(title + " " + detail);
  const status: ExecStatus = action === "Approve" ? "EXECUTED" : "PENDING";
  const role =
    kind === "training" || kind === "lifecycle" ? "Training Lead"
    : kind === "compliance" ? "Quality Leader"
    : kind === "competition" || kind === "matrix" ? "Training Manager"
    : kind === "reassignment" || kind === "teamDrilldown" ? "Manager"
    : kind === "escalation" ? "Trainer + TL"
    : kind === "agentCoaching" ? "Team Leader"
    : "Assistant Manager";

  const doneTl = (labels: string[]) =>
    labels.map((label, i) => ({
      label,
      time: i === labels.length - 1 && action !== "Approve" ? "—" : ts(Math.max(1, (labels.length - i) * 3)),
      state: i === labels.length - 1
        ? (action === "Approve" ? ("active" as const) : ("pending" as const))
        : ("done" as const),
    }));

  const base = { title, status, kind };

  switch (kind) {
    case "training":
      return {
        ...base,
        summary: "Silaris AI deployed personalized training modules to 34 agent desktops. STT monitoring active for 5-day effectiveness assessment.",
        metrics: [
          { label: "Agents Trained", value: "34" },
          { label: "Modules Delivered", value: "23" },
          { label: "Avg Improvement", value: "+6.2 pts" },
          { label: "Completion", value: "72%" },
        ],
        timeline: doneTl([
          "Pattern Detected (Pareto)",
          "Modules Generated",
          "Delivered to Desktops",
          "STT Monitoring",
          "Day 5 Assessment",
          "Escalation Review",
        ]),
        details: [
          { k: "Trigger", v: detail || "Pareto: top defect cluster across cohort" },
          { k: "Cohort", v: "34 Cat-B agents across 6 TLs" },
          { k: "Delivery", v: "Pre-shift coaching card + 5-day STT watch" },
          { k: "Owner", v: role },
          { k: "Audit ID", v: "TRN-2026-0429" },
        ],
      };

    case "compliance":
      return {
        ...base,
        summary: "Agent made an unauthorized fee-waiver promise. 3rd offense within 30 days. Agent suspended pending dual-approval refresher.",
        metrics: [
          { label: "Breach Type", value: "FATAL" },
          { label: "Repeat", value: "3rd" },
          { label: "Leads Saved", value: "47" },
          { label: "IRDAI Risk", value: "Mitigated" },
        ],
        timeline: doneTl([
          "Breach Detected (STT)",
          "Agent Suspended",
          "Dual Approval Routed",
          "Manager Approved",
          "QA Head Approved",
          "Refresher Scheduled",
        ]),
        details: [
          { k: "Breach", v: title },
          { k: "Regulator Reference", v: "IRDAI Master Circular 2024, Clause 7.3" },
          { k: "Action", v: "Suspension + 48h supervised calls + re-script" },
          { k: "Owner", v: role },
          { k: "Evidence", v: "STT excerpts · 14 call IDs attached" },
        ],
      };

    case "agentCoaching":
      return {
        ...base,
        summary: "Personalized coaching plan generated from STT analysis of 47 recent calls. Targeted at specific CQI section gap.",
        metrics: [
          { label: "Current CQI", value: "76" },
          { label: "Target", value: "83+" },
          { label: "Gap", value: "Sec C" },
          { label: "Recovery", value: "5 days" },
        ],
        timeline: doneTl([
          "47 Calls Analyzed",
          "Gap Isolated (Sec C)",
          "Plan Generated",
          "TL Approved",
          "Daily Micro-Coaching Live",
          "Day 5 Reassessment",
        ]),
        details: [
          { k: "Plan", v: title },
          { k: "Focus", v: "Closing + objection handling on Sec C" },
          { k: "Cadence", v: "Pre-shift card + 1:1 nudge x5 days" },
          { k: "Owner", v: role },
          { k: "Audit ID", v: "CCH-2026-0118" },
        ],
      };

    case "teamDrilldown":
      return {
        ...base,
        summary: "Team breakdown with common skill gaps and AI-suggested interventions across the TL's span of control.",
        metrics: [
          { label: "Team Size", value: "17" },
          { label: "Team CQI", value: "71%" },
          { label: "Below Target", value: "6" },
          { label: "Improving", value: "4" },
        ],
        timeline: doneTl([
          "Team Snapshot Pulled",
          "Gap Clustering",
          "Intervention Plan",
          "TL Briefed",
          "Coaching Cards Queued",
        ]),
        details: [
          { k: "Team", v: title },
          { k: "Top Gap", v: "Competition handling (9 agents)" },
          { k: "Recommended", v: "Group session + 2 individual plans" },
          { k: "Owner", v: role },
          { k: "Window", v: "Next 7 days" },
        ],
      };

    case "competition":
      return {
        ...base,
        summary: "Updated competition counter-scripts deployed process-wide via Co-Pilot. Live tracking of usage and conversion impact.",
        metrics: [
          { label: "Scripts Deployed", value: "34" },
          { label: "Opened", value: "28" },
          { label: "Used in Calls", value: "8" },
          { label: "Conv Impact", value: "+2.1%" },
        ],
        timeline: doneTl([
          "Customer Mentions Surge",
          "Counter-Script Drafted",
          "QA Reviewed",
          "Deployed to 34 Agents",
          "Usage Tracking Live",
        ]),
        details: [
          { k: "Script", v: title },
          { k: "Competitor", v: "HDFC Life / SBI Life" },
          { k: "Pivot", v: "FMC reduction + admin refund + 22 fund options" },
          { k: "Owner", v: role },
          { k: "Rollout", v: "Process-wide via Co-Pilot prompt" },
        ],
      };

    case "escalation":
      return {
        ...base,
        summary: "AI coaching did not move the needle after 5 days. Escalated to a Trainer + TL for human-led intervention.",
        metrics: [
          { label: "AI Coaching Days", value: "5" },
          { label: "Score Change", value: "0 pts" },
          { label: "Calls Analyzed", value: "25" },
          { label: "Next", value: "Human" },
        ],
        timeline: doneTl([
          "Plan Started",
          "Day 3 Check (flat)",
          "Day 5 Reassessment",
          "AI Path Closed",
          "Escalated to Trainer + TL",
        ]),
        details: [
          { k: "Case", v: title },
          { k: "Reason", v: "Product knowledge gap — riders & fund options" },
          { k: "Recommended", v: "2-week classroom intensive" },
          { k: "Owner", v: role },
          { k: "Audit ID", v: "ESC-2026-0042" },
        ],
      };

    case "lifecycle":
      return {
        ...base,
        summary: "Complete training journey for this agent — from gap detection through delivery, assessment, and outcome.",
        metrics: [
          { label: "Current Stage", value: "Stage 4" },
          { label: "Time", value: "2 days" },
          { label: "Pre", value: "63" },
          { label: "Post", value: "68" },
        ],
        timeline: [
          { label: "Detected", time: ts(2880), state: "done" },
          { label: "Generated", time: ts(2700), state: "done" },
          { label: "Delivered", time: ts(2400), state: "done" },
          { label: "Opened", time: ts(1800), state: "active" },
          { label: "Assessment", time: "—", state: "pending" },
          { label: "Monitoring", time: "—", state: "pending" },
          { label: "Outcome", time: "—", state: "pending" },
        ],
        details: [
          { k: "Case", v: title },
          { k: "Module", v: "Competition Handling — HDFC Life pivot" },
          { k: "Gap", v: detail || "Could not hold customer through competitor comparison" },
          { k: "Owner", v: role },
          { k: "Audit ID", v: "TLC-2026-0117" },
        ],
      };

    case "matrix":
      return {
        ...base,
        summary: "Live competition matrix built from customer call data — Axis Max Life vs the 3 most-mentioned competitors.",
        metrics: [
          { label: "Competitors", value: "3" },
          { label: "Features", value: "7" },
          { label: "We Win", value: "5 of 7" },
          { label: "Agent Readiness", value: "68%" },
        ],
        timeline: doneTl([
          "Call Mentions Aggregated",
          "Feature Matrix Built",
          "Win / Loss Tagged",
          "Pivot Scripts Drafted",
          "Pushed to Co-Pilot",
        ]),
        details: [
          { k: "View", v: title },
          { k: "Competitors", v: "HDFC Life · SBI Life · ICICI Pru" },
          { k: "We Win On", v: "FMC, fund options, admin refund, claim ratio, persistency" },
          { k: "We Lose On", v: "Brand recall, urban distribution" },
          { k: "Owner", v: role },
        ],
      };

    case "reassignment":
      return {
        ...base,
        summary: "AI re-routed leads from a CAP-2 agent to top performers to protect lead quality during the coaching cycle.",
        metrics: [
          { label: "Leads Moved", value: "120" },
          { label: "From Agent", value: "1" },
          { label: "To Agents", value: "3 (Cat A)" },
          { label: "Est. Revenue", value: "₹4.8L" },
        ],
        timeline: doneTl([
          "CAP-2 Flag",
          "Lead Cohort Identified",
          "Routing Plan",
          "Manager Approved",
          "Leads Reassigned",
        ]),
        details: [
          { k: "Action", v: title },
          { k: "From", v: "Deepak Tiwari (Cat C, CAP-2)" },
          { k: "To", v: "Anita Sharma · Priya Menon · Kavita R." },
          { k: "Reason", v: "Lead-quality protection during CAP cycle" },
          { k: "Owner", v: role },
        ],
      };

    default:
      return {
        ...base,
        summary: detail || "Silaris AI executed the recommended action.",
        metrics: [
          { label: "Items", value: "1" },
          { label: "Owner", value: role },
          { label: "Status", value: status },
          { label: "ETA", value: "Now" },
        ],
        timeline: doneTl([
          "AI Pattern Detected",
          "Recommendation Generated",
          `Routed to ${role}`,
          action === "Approve" ? "Approved" : "Awaiting Review",
        ]),
        details: [
          { k: "Action", v: title },
          { k: "Detail", v: detail },
          { k: "Owner", v: role },
        ],
      };
  }
}

export function ExecutionPanelProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<ExecPayload | null>(null);

  const open = useCallback((p: ExecPayload) => setPayload(p), []);
  const openFromSuggestion = useCallback(
    (title: string, detail: string, action: "Approve" | "Review") => setPayload(buildPayload(title, detail, action)),
    [],
  );
  const value = useMemo(() => ({ open, openFromSuggestion }), [open, openFromSuggestion]);

  return (
    <ExecCtx.Provider value={value}>
      {children}
      {payload && <ExecPanel p={payload} onClose={() => setPayload(null)} />}
    </ExecCtx.Provider>
  );
}

function ExecPanel({ p, onClose }: { p: ExecPayload; onClose: () => void }) {
  const isExec = p.status === "EXECUTED";
  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-[620px] bg-card border-l border-border flex flex-col animate-in slide-in-from-right duration-200">
        <header className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`size-9 grid place-items-center rounded-md ${isExec ? "bg-acc-green/15 text-acc-green" : "bg-acc-amber/15 text-acc-amber"}`}>
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="text-[10.5px] uppercase tracking-[0.14em] text-dim">Silaris Agentic AI</div>
              <div className="text-[15px] font-semibold leading-tight">{p.title}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10.5px] uppercase tracking-wider rounded px-2 py-1 border ${isExec ? "text-acc-green border-acc-green/40 bg-acc-green/10" : "text-acc-amber border-acc-amber/40 bg-acc-amber/10"}`}>
              {p.status}
            </span>
            <button onClick={onClose} className="size-8 grid place-items-center rounded-md hover:bg-secondary">
              <X className="size-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <p className="text-[13.5px] leading-relaxed text-foreground/90">{p.summary}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {p.metrics.map((m) => (
              <div key={m.label} className="rounded-md border border-border bg-surface-2 p-3">
                <div className="text-[10.5px] uppercase tracking-wider text-dim">{m.label}</div>
                <div className="font-mono text-[18px] mt-1">{m.value}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-dim mb-2">Execution Timeline</div>
            <ol className="space-y-2">
              {p.timeline.map((s, i) => {
                const color =
                  s.state === "done" ? "text-acc-green border-acc-green/40 bg-acc-green/10"
                  : s.state === "active" ? "text-acc-amber border-acc-amber/40 bg-acc-amber/10 animate-pulse"
                  : "text-dim border-border bg-surface-2";
                const Icon = s.state === "done" ? CheckCircle2 : Clock;
                return (
                  <li key={i} className="flex items-center gap-3">
                    <div className={`size-7 grid place-items-center rounded-full border ${color}`}>
                      <Icon className="size-3.5" />
                    </div>
                    <div className="flex-1 text-[13px]">{s.label}</div>
                    <div className="font-mono text-[12px] text-dim">{s.time}</div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-dim mb-2">Details</div>
            <div className="rounded-md border border-border overflow-hidden">
              {p.details.map((d, i) => (
                <div key={i} className="grid grid-cols-[180px_1fr] text-[12.5px] border-t border-border first:border-t-0">
                  <div className="bg-surface-2 px-3 py-2 text-text-secondary">{d.k}</div>
                  <div className="px-3 py-2">{d.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11.5px] text-dim border-t border-border pt-3">
            Audit trail logged · immutable record · visible to Compliance & QA Head
          </div>
        </div>

        <footer className="px-5 py-3 border-t border-border flex items-center justify-between gap-2 flex-wrap">
          <button
            onClick={() => alert("Rollback initiated — change reverted. Owner notified.")}
            className="inline-flex items-center gap-1.5 text-[12.5px] px-3 py-1.5 rounded border border-border hover:border-acc-sand/40 text-text-secondary"
          >
            <RotateCcw className="size-3.5" /> Rollback
          </button>
          <button
            onClick={() => alert("Export queued. PDF will be emailed to your inbox.")}
            className="inline-flex items-center gap-1.5 text-[12.5px] px-3 py-1.5 rounded border border-border hover:border-acc-blue/40 text-text-secondary"
          >
            <Download className="size-3.5" /> Export PDF
          </button>
          <button
            onClick={onClose}
            className="ml-auto inline-flex items-center gap-1.5 text-[12.5px] px-3 py-1.5 rounded bg-acc-green/15 text-acc-green border border-acc-green/40 hover:bg-acc-green/25"
          >
            Confirm &amp; Close
          </button>
        </footer>
      </div>
    </div>
  );
}
