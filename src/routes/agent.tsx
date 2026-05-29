import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell,
} from "recharts";
import { X, FileText, GraduationCap, TrendingUp, Search, ChevronDown } from "lucide-react";
import { Shell, Card, SectionTitle, Badge, CatBadge } from "@/components/silaris/Shell";
import { useExecutionPanel } from "@/components/silaris/ExecutionPanel";
import { AGENTS, AGENT_ROSTER, type Agent, type RosterAgent, type TrainingStatus, type CapStatus, type AgentStatus } from "@/lib/silaris-data";

export const Route = createFileRoute("/agent")({
  head: () => ({ meta: [{ title: "Agent · My Dashboard · Silaris" }] }),
  component: AgentView,
});

type FilterKey = "all" | "A" | "B" | "C" | "training" | "cap";
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "A", label: "Category A" },
  { key: "B", label: "Category B" },
  { key: "C", label: "Category C" },
  { key: "training", label: "Under Training" },
  { key: "cap", label: "Under CAP" },
];

function AgentView() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showAll, setShowAll] = useState(false);
  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const [modal, setModal] = useState<null | "feedback" | "training">(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AGENT_ROSTER
      .filter((a) => {
        if (q && !a.name.toLowerCase().includes(q) && !a.empId.toLowerCase().includes(q)) return false;
        if (filter === "A" || filter === "B" || filter === "C") return a.cat === filter;
        if (filter === "training") return a.training === "Active" || a.training === "Escalated" || a.training === "Assessment Due";
        if (filter === "cap") return a.cap !== "None";
        return true;
      })
      .sort((a, b) => a.rank - b.rank);
  }, [query, filter]);

  const visible = showAll ? filtered : filtered.slice(0, 20);
  const selected = selectedRank != null ? AGENT_ROSTER.find((a) => a.rank === selectedRank) ?? null : null;
  const keyAgent: Agent | null = selected?.keyId ? AGENTS.find((a) => a.id === selected.keyId) ?? null : null;

  return (
    <Shell
      copilot={{
        summary: "Roster live — 20 agents · 6 in training · 3 under CAP. Click any agent to inspect.",
        working: [
          "9 agents in Category A (45% of roster)",
          "Anita Sharma — 94% reference-quality coach",
          "Sneha Joshi closing module +5 pts in 3 wks",
        ],
        attention: [
          "Deepak Tiwari — CAP-2 fatal flagged",
          "Manish Verma — escalated to classroom",
          "2 assessments due today (Rahul, Aarti)",
        ],
        suggestions: [
          { title: "Deploy competition cheat sheet to 8 agents", detail: "HDFC pivot script — auto-deliver pre-shift to all Cat B handling Savings." },
          { title: "Reassign 120 leads off Deepak Tiwari", detail: "Protect lead quality while CAP-2 is active — route to 3 Cat A agents." },
          { title: "Schedule classroom for Manish Verma", detail: "AI coaching exhausted — escalate to Trainer + TL shadowing for 2 weeks." },
        ],
      }}
    >
      <SectionTitle kicker="Operations · Agent">My Dashboard — Agent Roster</SectionTitle>

      {/* Search + filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 min-w-[280px] flex-1 max-w-[420px]">
          <Search className="size-4 text-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agent name or ID..."
            className="bg-transparent text-[13.5px] flex-1 outline-none placeholder:text-dim"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-[12.5px] px-3 py-1.5 rounded border transition-colors ${
                  active
                    ? "border-acc-green text-acc-green bg-acc-green/10"
                    : "border-border text-text-secondary hover:border-acc-blue/40 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <div className="ml-auto text-[12px] text-dim">
          Showing <span className="font-mono text-foreground">{visible.length}</span> of {filtered.length}
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-[13px]">
            <thead className="text-dim text-[10.5px] uppercase tracking-wider">
              <tr className="border-b border-border">
                <th className="text-left py-2.5 px-2 font-medium">#</th>
                <th className="text-left py-2.5 px-2 font-medium">Agent Name</th>
                <th className="text-left py-2.5 px-2 font-medium">Employee ID</th>
                <th className="text-left py-2.5 px-2 font-medium">Team Leader</th>
                <th className="text-right py-2.5 px-2 font-medium">CQI Score</th>
                <th className="text-left py-2.5 px-2 font-medium">Category</th>
                <th className="text-right py-2.5 px-2 font-medium">SPD</th>
                <th className="text-right py-2.5 px-2 font-medium">Quality</th>
                <th className="text-right py-2.5 px-2 font-medium">Complaints</th>
                <th className="text-left py-2.5 px-2 font-medium">Training</th>
                <th className="text-left py-2.5 px-2 font-medium">CAP</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((a, idx) => (
                <RosterRow
                  key={a.rank}
                  a={a}
                  displayIdx={idx + 1}
                  onPick={() => setSelectedRank(a.rank)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 20 && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowAll((s) => !s)}
              className="inline-flex items-center gap-1.5 text-[12.5px] px-4 py-2 rounded border border-border text-text-secondary hover:border-acc-green/40 hover:text-acc-green"
            >
              <ChevronDown className={`size-4 transition-transform ${showAll ? "rotate-180" : ""}`} />
              {showAll ? "Show Less" : `Show More (${filtered.length - 20})`}
            </button>
          </div>
        )}
      </Card>

      {/* Slide-in agent detail */}
      {selected && (
        <AgentDetailPanel
          roster={selected}
          keyAgent={keyAgent}
          onClose={() => setSelectedRank(null)}
          onOpenFeedback={() => setModal("feedback")}
          onOpenTraining={() => setModal("training")}
        />
      )}

      {modal && selected && (
        <Modal onClose={() => setModal(null)} title={modal === "feedback" ? "CQI Feedback Sheet" : "Personalized Training Plan"}>
          {modal === "feedback"
            ? (keyAgent ? <FeedbackSheet a={keyAgent} /> : <GenericFeedback r={selected} />)
            : (keyAgent ? <TrainingPlan a={keyAgent} /> : <GenericTraining r={selected} />)}
        </Modal>
      )}
    </Shell>
  );
}

function RosterRow({ a, displayIdx, onPick }: { a: RosterAgent; displayIdx: number; onPick: () => void }) {
  const cqiColor =
    a.cat === "A" ? "text-acc-green"
    : a.cat === "B" ? "text-acc-sand"
    : "text-acc-mauve";
  const rowBg =
    a.training === "Active" ? "bg-acc-green/[0.04]"
    : a.training === "Escalated" ? "bg-acc-mauve/[0.06]"
    : "";
  return (
    <tr className={`border-b border-border/60 hover:bg-secondary/40 transition-colors ${rowBg}`}>
      <td className="py-2.5 px-2 font-mono text-dim text-[12px]">{displayIdx}</td>
      <td className="py-2.5 px-2">
        <button
          onClick={onPick}
          className="text-left text-[13.5px] font-medium text-foreground hover:text-acc-green transition-colors"
        >
          {a.name}
        </button>
      </td>
      <td className="py-2.5 px-2 font-mono text-[12px] text-text-secondary">{a.empId}</td>
      <td className="py-2.5 px-2 text-[12.5px] text-text-secondary">{a.tl}</td>
      <td className={`py-2.5 px-2 text-right font-mono text-[13.5px] ${cqiColor}`}>{a.cqi.toFixed(1)}%</td>
      <td className="py-2.5 px-2"><CatBadge cat={a.cat} /></td>
      <td className="py-2.5 px-2 text-right font-mono text-[12.5px]">{a.spd.toFixed(1)}</td>
      <td className="py-2.5 px-2 text-right font-mono text-[12.5px]">{a.quality}</td>
      <td className={`py-2.5 px-2 text-right font-mono text-[12.5px] ${a.complaints >= 2 ? "text-acc-mauve" : a.complaints === 1 ? "text-acc-sand" : "text-dim"}`}>
        {a.complaints}
      </td>
      <td className="py-2.5 px-2"><TrainingPill s={a.training} /></td>
      <td className="py-2.5 px-2"><CapPill s={a.cap} /></td>
    </tr>
  );
}

function TrainingPill({ s }: { s: TrainingStatus }) {
  if (s === "None") return <span className="text-dim text-[12px]">None</span>;
  const tone =
    s === "Active" ? "green"
    : s === "Completed" ? "blue"
    : s === "Assessment Due" ? "amber"
    : "mauve";
  return <Badge tone={tone as any}>{s}</Badge>;
}

function CapPill({ s }: { s: CapStatus }) {
  if (s === "None") return <span className="text-dim text-[12px]">None</span>;
  const tone = s === "CAP-1" ? "amber" : "mauve";
  return <Badge tone={tone as any}>{s}</Badge>;
}

// ============================================================
// Slide-in agent detail panel
// ============================================================
function AgentDetailPanel({
  roster, keyAgent, onClose, onOpenFeedback, onOpenTraining,
}: {
  roster: RosterAgent;
  keyAgent: Agent | null;
  onClose: () => void;
  onOpenFeedback: () => void;
  onOpenTraining: () => void;
}) {
  // Synthesize 4-week trend
  const trend = keyAgent?.trend ?? [
    Math.max(50, roster.cqi - 4),
    Math.max(50, roster.cqi - 2),
    Math.max(50, roster.cqi - 1),
    roster.cqi,
  ];
  // Synthesize dimensions when not a key agent
  const dims = keyAgent?.dimensions ?? synthDims(roster.cqi);
  const calls = keyAgent?.todaysCalls ?? synthCalls(roster);

  const cqiColor =
    roster.cat === "A" ? "text-acc-green"
    : roster.cat === "B" ? "text-acc-sand"
    : "text-acc-mauve";

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-[760px] bg-card border-l border-border flex flex-col animate-in slide-in-from-right duration-200">
        <header className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-[10.5px] uppercase tracking-[0.14em] text-dim">Agent Detail</div>
              <div className="text-[17px] font-semibold leading-tight">{roster.name}</div>
              <div className="text-[12px] text-text-secondary mt-0.5">
                {roster.empId} · TL {roster.tl} · <CatBadge cat={roster.cat} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10.5px] uppercase tracking-wider text-dim">CQI</div>
              <div className={`font-mono text-[26px] leading-none ${cqiColor}`}>{roster.cqi.toFixed(1)}%</div>
            </div>
            <button onClick={onClose} className="size-8 grid place-items-center rounded-md hover:bg-secondary">
              <X className="size-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Trend + dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="4-Week CQI Trend">
              <div className="h-[160px]">
                <ResponsiveContainer>
                  <LineChart data={trend.map((v, i) => ({ w: `W${i + 1}`, v }))}>
                    <CartesianGrid stroke="#1c2940" vertical={false} />
                    <XAxis dataKey="w" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis domain={["dataMin-3", "dataMax+3"]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="v" stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: "#34d399" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="CQI by Dimension">
              <div className="h-[160px]">
                <ResponsiveContainer>
                  <BarChart
                    data={dims.map((d) => ({ ...d, pct: Math.round((d.score / d.max) * 100) }))}
                    layout="vertical"
                    margin={{ left: 30 }}
                  >
                    <CartesianGrid stroke="#1c2940" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 10 }} unit="%" />
                    <YAxis type="category" dataKey="code" stroke="#94a3b8" tick={{ fontSize: 11 }} width={32} />
                    <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: any, _n, p: any) => [`${v}% (${p.payload.score}/${p.payload.max})`, p.payload.name]} />
                    <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                      {dims.map((d, i) => {
                        const p = (d.score / d.max) * 100;
                        const fill = p >= 85 ? "#34d399" : p >= 70 ? "#7ba4cc" : "#d4a574";
                        return <Cell key={i} fill={fill} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Calls today */}
          <Card title="My Calls Today">
            <table className="w-full text-[12.5px]">
              <thead className="text-dim text-[10.5px] uppercase tracking-wider">
                <tr>
                  <th className="text-left py-2 font-medium">Call ID</th>
                  <th className="text-left py-2 font-medium">Duration</th>
                  <th className="text-left py-2 font-medium">CQI</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Observation</th>
                </tr>
              </thead>
              <tbody>
                {calls.slice(0, 4).map((c) => {
                  const tone = c.tag === "Clean" ? "green" : c.tag === "Non-Fatal" ? "sand" : "mauve";
                  return (
                    <tr key={c.id} className="border-t border-border">
                      <td className="py-2 font-mono">{c.id}</td>
                      <td className="py-2 font-mono">{c.duration}</td>
                      <td className="py-2 font-mono">{c.cqi}</td>
                      <td className="py-2"><Badge tone={tone as any}>{c.tag}</Badge></td>
                      <td className="py-2 text-text-secondary">{c.obs}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Training history */}
          <Card title="Training History">
            <ul className="text-[13px] space-y-2">
              {synthHistory(roster).map((h, i) => (
                <li key={i} className="flex items-center justify-between gap-3 border-b border-border/60 last:border-0 pb-2 last:pb-0">
                  <div>
                    <div className="font-medium">{h.title}</div>
                    <div className="text-[12px] text-dim">{h.date} · {h.status}</div>
                  </div>
                  <div className="font-mono text-[13px] text-acc-green">{h.score}</div>
                </li>
              ))}
            </ul>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onOpenFeedback}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3.5 py-2 text-[13px] hover:border-acc-blue/40"
            >
              <FileText className="size-4 text-acc-blue" /> View Full Feedback Sheet
            </button>
            <button
              onClick={onOpenTraining}
              className="inline-flex items-center gap-2 rounded-md border border-acc-green/40 bg-acc-green/10 px-3.5 py-2 text-[13px] text-acc-green hover:bg-acc-green/20"
            >
              <GraduationCap className="size-4" />
              {roster.keyId === "anita" ? "No Training Plan — STAR Performer" : "View Training Plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Synthesizers for non-key agents
// ============================================================
function synthDims(cqi: number): Agent["dimensions"] {
  const ratio = cqi / 100;
  const r = (max: number, jitter: number) => Math.max(1, Math.min(max, Math.round(max * ratio + jitter)));
  return [
    { code: "D1", name: "Communication",      score: r(15, 1),  max: 15 },
    { code: "D2", name: "Product Knowledge",  score: r(15, 0),  max: 15 },
    { code: "D3", name: "Objection Handling", score: r(15, -1), max: 15 },
    { code: "D4", name: "Customer Handling",  score: r(12, 0),  max: 12 },
    { code: "D5", name: "Closing",            score: r(13, -1), max: 13 },
    { code: "D6", name: "Compliance",         score: r(13, 1),  max: 13 },
  ];
}

function synthCalls(r: RosterAgent): Agent["todaysCalls"] {
  const base = 88000 + r.rank * 13;
  const tags: Agent["todaysCalls"][number]["tag"][] = r.cat === "C"
    ? ["Non-Fatal", "Non-Fatal", "Clean", "Non-Fatal"]
    : r.cat === "B"
      ? ["Clean", "Non-Fatal", "Clean", "Clean"]
      : ["Clean", "Clean", "Clean", "Clean"];
  return tags.map((tag, i) => ({
    id: `C-${base + i}`,
    duration: `0${4 + (i % 4)}:${10 + i * 7}`.slice(0, 5),
    cqi: Math.round(r.cqi) + (i - 1),
    tag,
    obs: tag === "Clean" ? "Clean handling per script" : tag === "Non-Fatal" ? "Coachable: charges clarity" : "Compliance issue flagged",
  }));
}

function synthHistory(r: RosterAgent): { title: string; date: string; status: string; score: string }[] {
  const items = [
    { title: "Onboarding Module", date: "12 Feb 2026", status: "Completed", score: "92%" },
    { title: "T&C Disclosure Drill", date: "03 Mar 2026", status: "Completed", score: "88%" },
  ];
  if (r.training !== "None") {
    items.push({
      title: r.trainingNote ?? "Skill Refresh",
      date: "26 Apr 2026",
      status: r.training,
      score: r.training === "Active" ? "in-flight" : r.training === "Completed" ? "84%" : "pending",
    });
  }
  return items;
}

// ============================================================
// Modal + per-agent content (reuses existing rich data)
// ============================================================
function Modal({ children, onClose, title }: { children: any; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-[55] flex">
      <div className="flex-1 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-[720px] bg-card border-l border-border flex flex-col">
        <header className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-dim">Silaris</div>
            <div className="text-[16px] font-semibold">{title}</div>
          </div>
          <button onClick={onClose} className="size-8 grid place-items-center rounded-md hover:bg-secondary">
            <X className="size-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        <footer className="px-5 py-3 border-t border-border text-[11px] text-dim flex items-center justify-between">
          <span>◉ Human-in-the-loop · April 2026</span>
          <button onClick={onClose} className="text-[12px] px-3 py-1.5 rounded border border-border hover:border-acc-green/40">Close</button>
        </footer>
      </div>
    </div>
  );
}

function GenericFeedback({ r }: { r: RosterAgent }) {
  const exec = useExecutionPanel();
  return (
    <div className="space-y-4 text-[13px]">
      <div className="rounded-md border border-acc-blue/30 bg-acc-blue/5 p-3">
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-acc-blue font-medium mb-1">AI Pattern Detection</div>
        <div>{r.name} sits at CQI {r.cqi.toFixed(1)}% (Cat {r.cat}). Trend is stable. {r.training !== "None" ? `Currently in ${r.training} on "${r.trainingNote ?? "skill refresh"}".` : "No active training need."}</div>
      </div>
      <div className="rounded-md border border-border bg-surface-2 p-3">
        <div className="text-[11px] uppercase tracking-wider text-dim mb-1.5">AI Action Plan</div>
        <div>Continue STT monitoring. Auto-deploy targeted micro-coaching if CQI drops below category threshold for 2 consecutive days.</div>
      </div>
      <button
        onClick={() => exec.openFromSuggestion(`Deploy coaching for ${r.name}`, `Pattern detected on ${r.name} (CQI ${r.cqi}%). Recommend a focused 3-day STT watch with daily micro-coaching.`, "Approve")}
        className="text-[12px] px-3 py-1.5 rounded bg-acc-green/15 text-acc-green border border-acc-green/40 hover:bg-acc-green/25"
      >
        Approve Coaching Plan
      </button>
    </div>
  );
}

function GenericTraining({ r }: { r: RosterAgent }) {
  const exec = useExecutionPanel();
  return (
    <div className="space-y-4 text-[13px]">
      <div>
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-dim mb-1">Module</div>
        <div className="text-[16px] font-semibold">{r.trainingNote ?? "Skill Refresh — Foundational"}</div>
      </div>
      <div className="rounded-md border border-border bg-surface-2 p-3">
        Auto-generated by Silaris AI based on {r.name}'s 30-day call sample. Standard 5-day plan: AI module on Day 1, STT supervision Day 2–4, assessment Day 5.
      </div>
      <button
        onClick={() => exec.openFromSuggestion(`Deploy ${r.trainingNote ?? "training"} for ${r.name}`, `5-day plan with Day 5 assessment. Owner: ${r.tl}.`, "Approve")}
        className="text-[12px] px-3 py-1.5 rounded bg-acc-green/15 text-acc-green border border-acc-green/40 hover:bg-acc-green/25"
      >
        Approve & Deploy
      </button>
    </div>
  );
}

function FeedbackSheet({ a }: { a: Agent }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[12.5px]">
        <Meta label="Agent" value={a.name} />
        <Meta label="Emp ID" value={a.empId} />
        <Meta label="TL" value={a.tl} />
        <Meta label="Date" value="29 Apr 2026" />
      </div>

      <div className="rounded-md border border-acc-blue/30 bg-acc-blue/5 p-3">
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-acc-blue font-medium mb-1">AI Pattern Detection</div>
        <div className="text-[13px] text-foreground/90 leading-snug">{a.feedback.aiPattern}</div>
      </div>

      <div>
        <div className="text-[13px] font-medium mb-2">CQI Scoring by Dimension</div>
        <table className="w-full text-[12.5px] border border-border rounded-md overflow-hidden">
          <thead className="bg-surface-2 text-dim text-[11px] uppercase tracking-wider">
            <tr>
              <th className="text-left py-2 px-3">Dim</th>
              <th className="text-left py-2 px-3">Parameter</th>
              <th className="text-right py-2 px-3">Score</th>
              <th className="text-left py-2 px-3">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {a.dimensions.map((d, i) => (
              <tr key={d.code} className="border-t border-border">
                <td className="py-2 px-3 font-mono text-dim">{d.code}</td>
                <td className="py-2 px-3">{d.name}</td>
                <td className="py-2 px-3 text-right font-mono">{d.score}/{d.max}</td>
                <td className="py-2 px-3 text-text-secondary">{a.feedback.remarks[i]}</td>
              </tr>
            ))}
            <tr className="bg-surface-2 border-t border-border">
              <td className="py-2 px-3" />
              <td className="py-2 px-3 font-medium">Grand Total</td>
              <td className="py-2 px-3 text-right font-mono text-acc-green">{a.score}/{a.out} ({a.pct}%)</td>
              <td className="py-2 px-3"><CatBadge cat={a.category} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-md border border-acc-green/30 bg-acc-green/5 p-3">
          <div className="text-[11px] uppercase tracking-wider text-acc-green mb-1.5">Strengths</div>
          <ul className="text-[13px] space-y-1">
            {a.feedback.strengths.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>
        <div className="rounded-md border border-acc-sand/30 bg-acc-sand/5 p-3">
          <div className="text-[11px] uppercase tracking-wider text-acc-sand mb-1.5">Areas for Improvement</div>
          <ul className="text-[13px] space-y-1">
            {a.feedback.improvements.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface-2 p-3">
        <div className="text-[11px] uppercase tracking-wider text-dim mb-1.5">AI Action Plan</div>
        <div className="text-[13px] leading-snug">{a.feedback.actionPlan}</div>
      </div>
    </div>
  );
}

function TrainingPlan({ a }: { a: Agent }) {
  if (a.id === "anita") {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-acc-green/30 bg-acc-green/5 p-4">
          <div className="text-[14px] font-semibold text-acc-green flex items-center gap-2">
            <TrendingUp className="size-4" /> {a.training.title}
          </div>
          <div className="text-[13px] text-foreground/85 mt-2 leading-relaxed">{a.training.correctResponse}</div>
        </div>
        <CheatSheet sheet={a.training.cheatSheet} />
        <div className="rounded-md border border-border bg-surface-2 p-3 text-[13px]">{a.training.closingNote}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-dim mb-1">Module</div>
        <div className="text-[16px] font-semibold">{a.training.title}</div>
      </div>

      <div className="rounded-md border border-border bg-surface-2 p-3 text-[13px] leading-relaxed">
        Hi {a.name.split(" ")[0]} — let's work on this together. Here's what I picked up from your recent calls, and exactly how to handle it next time.
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-wider text-dim mb-2">From a recent call</div>
        <div className="space-y-2">
          <Bubble who="Customer" tone="neutral">{a.training.excerptCustomer}</Bubble>
          <Bubble who="You said" tone="sand">{a.training.excerptAgentWrong}</Bubble>
          <Bubble who="Try this instead" tone="green">{a.training.correctResponse}</Bubble>
        </div>
      </div>

      <CheatSheet sheet={a.training.cheatSheet} />

      <div>
        <div className="text-[11px] uppercase tracking-wider text-dim mb-2">Training Schedule</div>
        <div className="grid grid-cols-3 gap-2 text-[12.5px]">
          <Step n="Day 1" t="Module delivered (AI)" />
          <Step n="Day 2–4" t="STT live monitoring" />
          <Step n="Day 5" t="Assessment + reassess" />
        </div>
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-wider text-dim mb-2">Self-Assessment</div>
        <div className="space-y-2">
          {a.training.qa.map((qa, i) => (
            <div key={i} className="rounded-md border border-border bg-surface-2 p-3">
              <div className="text-[13px] font-medium">Q{i + 1}. {qa.q}</div>
              <div className="text-[12.5px] text-acc-green mt-1">→ {qa.a}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-acc-green/30 bg-acc-green/5 p-3 text-[13px]">
        {a.training.closingNote}
      </div>
    </div>
  );
}

function CheatSheet({ sheet }: { sheet: Agent["training"]["cheatSheet"] }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-dim mb-2">Cheat Sheet — {sheet.title}</div>
      <div className="rounded-md border border-border overflow-hidden">
        {sheet.rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[180px_1fr] text-[12.5px] border-t border-border first:border-t-0">
            <div className="bg-surface-2 px-3 py-2 text-text-secondary">{r.k}</div>
            <div className="px-3 py-2">{r.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bubble({ who, tone, children }: { who: string; tone: "neutral" | "sand" | "green"; children: any }) {
  const border = tone === "green" ? "border-acc-green/40 bg-acc-green/5"
    : tone === "sand" ? "border-acc-sand/40 bg-acc-sand/5"
    : "border-border bg-surface-2";
  const color = tone === "green" ? "text-acc-green" : tone === "sand" ? "text-acc-sand" : "text-dim";
  return (
    <div className={`rounded-md border ${border} p-3`}>
      <div className={`text-[10.5px] uppercase tracking-wider mb-1 ${color}`}>{who}</div>
      <div className="text-[13px] leading-snug">{children}</div>
    </div>
  );
}

function Step({ n, t }: { n: string; t: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 p-3">
      <div className="text-[10.5px] uppercase tracking-wider text-acc-green">{n}</div>
      <div className="text-[12.5px] mt-1">{t}</div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 px-3 py-2">
      <div className="text-[10.5px] uppercase tracking-wider text-dim">{label}</div>
      <div className="text-[13px] font-medium mt-0.5">{value}</div>
    </div>
  );
}
