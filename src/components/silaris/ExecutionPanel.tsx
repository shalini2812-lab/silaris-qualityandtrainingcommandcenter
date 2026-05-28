import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { X, CheckCircle2, Clock, Download, RotateCcw, Sparkles } from "lucide-react";

export type ExecKind = "training" | "compliance" | "competition" | "reassignment" | "generic";
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

function buildPayload(title: string, detail: string, action: "Approve" | "Review"): ExecPayload {
  const t = (title + " " + detail).toLowerCase();
  let kind: ExecKind = "generic";
  if (/(compli|breach|irda|t&c|disclos|fatal)/.test(t)) kind = "compliance";
  else if (/(competition|hdfc|sbi|script|rebuttal|comparison)/.test(t)) kind = "competition";
  else if (/(reassign|lead|allocation|route)/.test(t)) kind = "reassignment";
  else if (/(train|coach|module|cap|assessment|feedback)/.test(t)) kind = "training";

  const status: ExecStatus = action === "Approve" ? "EXECUTED" : "PENDING";
  const role =
    kind === "training" ? "Training Lead"
    : kind === "compliance" ? "Quality Leader"
    : kind === "competition" ? "Training Manager"
    : kind === "reassignment" ? "Manager"
    : "Assistant Manager";

  const base = {
    title,
    summary: detail,
    status,
    kind,
    timeline: [
      { label: "AI Pattern Detected", time: ts(12), state: "done" as const },
      { label: "Recommendation Generated", time: ts(9), state: "done" as const },
      { label: `Routed to ${role}`, time: ts(4), state: "done" as const },
      { label: "Approved", time: action === "Approve" ? ts(1) : "—", state: action === "Approve" ? ("done" as const) : ("pending" as const) },
      { label: "Executing", time: action === "Approve" ? "now" : "—", state: action === "Approve" ? ("active" as const) : ("pending" as const) },
    ],
  };

  if (kind === "training") {
    return {
      ...base,
      metrics: [
        { label: "Agents Affected", value: "8" },
        { label: "Est. CQI Uplift", value: "+4.2 pts" },
        { label: "Module Length", value: "12 min" },
        { label: "Reassess Day", value: "Day 5" },
      ],
      details: [
        { k: "Module", v: title },
        { k: "Cohort", v: "Cat B agents · Pooja S., Ramesh K. teams" },
        { k: "Delivery", v: "Pre-shift AI coaching card + 5-day STT watch" },
        { k: "Owner", v: role },
        { k: "Trigger", v: "Pareto: 28% defect on this dimension" },
      ],
    };
  }
  if (kind === "compliance") {
    return {
      ...base,
      metrics: [
        { label: "Calls Flagged", value: "14" },
        { label: "Agents Involved", value: "5" },
        { label: "Risk Tier", value: "High" },
        { label: "SLA to Fix", value: "24h" },
      ],
      details: [
        { k: "Breach Type", v: title },
        { k: "Regulator Reference", v: "IRDA Master Circular 2024, Clause 7.3" },
        { k: "Corrective Action", v: "Mandatory re-script + supervised calls for 48h" },
        { k: "Owner", v: role },
        { k: "Evidence", v: "STT excerpts attached · 14 call IDs" },
      ],
    };
  }
  if (kind === "competition") {
    return {
      ...base,
      metrics: [
        { label: "Agents Affected", value: "23" },
        { label: "Est. Conv. Uplift", value: "+6.1%" },
        { label: "Scripts Updated", value: "3" },
        { label: "Go-Live", value: "Tomorrow 09:00" },
      ],
      details: [
        { k: "Script", v: title },
        { k: "Competitor", v: "HDFC Life / SBI Life" },
        { k: "Key Pivot", v: "FMC reduction + admin refund + 22 fund options" },
        { k: "Owner", v: role },
        { k: "Rollout", v: "Process-wide via Co-Pilot prompt" },
      ],
    };
  }
  if (kind === "reassignment") {
    return {
      ...base,
      metrics: [
        { label: "Leads Moved", value: "120" },
        { label: "From Agent", value: "1" },
        { label: "To Agents", value: "3 (Cat A)" },
        { label: "Est. Revenue", value: "₹4.8L" },
      ],
      details: [
        { k: "Action", v: title },
        { k: "From", v: "Deepak Tiwari (Cat C, CAP-2)" },
        { k: "To", v: "Anita Sharma · Priya Menon · Kavita R." },
        { k: "Reason", v: "Lead-quality protection during CAP cycle" },
        { k: "Owner", v: role },
      ],
    };
  }
  return {
    ...base,
    metrics: [
      { label: "Items", value: "1" },
      { label: "Owner", value: role },
      { label: "Status", value: status },
      { label: "ETA", value: "Now" },
    ],
    details: [
      { k: "Action", v: title },
      { k: "Detail", v: detail },
      { k: "Owner", v: role },
    ],
  };
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
      <div className="w-full max-w-[640px] bg-card border-l border-border flex flex-col animate-in slide-in-from-right duration-200">
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
                  : s.state === "active" ? "text-acc-amber border-acc-amber/40 bg-acc-amber/10"
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
