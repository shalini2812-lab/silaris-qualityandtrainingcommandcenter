import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell,
} from "recharts";
import { X, FileText, GraduationCap, TrendingUp, Search, ChevronDown, ClipboardList } from "lucide-react";
import { Shell, Card, SectionTitle, Badge, CatBadge } from "@/components/silaris/Shell";
import { useExecutionPanel } from "@/components/silaris/ExecutionPanel";
import type { CopilotProps } from "@/components/silaris/Copilot";
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


const DEFAULT_AGENT_COPILOT: CopilotProps = {
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
};

const AGENT_COPILOTS: Record<string, CopilotProps> = {
  priya: {
    summary: "Competition handling improved from 2/5 to 4/5 this week. She used claim settlement ratio for the first time — keep monitoring.",
    working: [
      "Competition handling 2/5 → 4/5 in one week",
      "First-ever use of claim-ratio pivot on Call #5821",
      "Engagement on AI coaching cards 100% past 5 days",
    ],
    attention: [
      "Still soft on HDFC FMC counter — 2 missed pivots",
      "Day 5 assessment due tomorrow",
    ],
    suggestions: [
      { title: "Push refreshed HDFC counter-script to Priya", detail: "FMC reduction + admin refund pivot — auto-deliver pre-shift tomorrow." },
      { title: "Continue STT monitoring 3 more days", detail: "Confirm pivots hold under live pressure before exit." },
    ],
  },
  deepak: {
    summary: "3rd fatal error. CAP-2 active. Suspend from outbound immediately. Compliance refresher mandatory.",
    working: ["Lead-quality cohort already protected — 120 leads rerouted"],
    attention: [
      "3rd fatal in 30 days — unauthorized fee waiver promise",
      "CAP-2 active · 5 days remaining",
      "IRDAI exposure if pattern repeats",
    ],
    suggestions: [
      { title: "Suspend Deepak from outbound immediately", detail: "Dual approval routed to Manager + QA Head. Reinstate only after refresher pass." },
      { title: "Mandatory compliance refresher", detail: "IRDAI Master Circular Clause 7.3 module + 48h supervised calls." },
    ],
  },
  sneha: {
    summary: "Success story! Improved C → B in 4 weeks. Consider for STAR nomination if she reaches 75+ next week.",
    working: [
      "Cat C → Cat B in 4 weeks",
      "Closing technique +5 pts (urgency-close drill)",
      "Zero fatals · zero complaints",
    ],
    attention: ["Watch for plateau — push to 75+ next week"],
    suggestions: [
      { title: "Nominate Sneha for STAR shortlist", detail: "If CQI ≥ 75 next week, queue her for the monthly STAR review." },
      { title: "Pair Sneha with Anita for peer coaching", detail: "Reinforces closing technique + builds bench strength." },
    ],
  },
  manish: {
    summary: "AI coaching failed after 5 days. Escalate to Trainer. Schedule human-led product knowledge session.",
    working: ["Tone & compliance discipline holding"],
    attention: [
      "AI coaching · 0 pt movement over 5 days",
      "Product knowledge — riders & fund options",
      "Customer frustration spikes on rider questions",
    ],
    suggestions: [
      { title: "Escalate Manish to classroom — 2-week intensive", detail: "Trainer + TL shadowing on product knowledge (riders, fund options)." },
      { title: "Pause AI coaching path", detail: "Close current AI plan and log escalation audit ESC-2026-0042." },
    ],
  },
  anita: {
    summary: "Anita is the reference coach (CQI 94%). Lean on her as peer-trainer for Priya and Sneha.",
    working: [
      "CQI 94% · STAR for 3 months running",
      "Zero fatals · 1 non-fatal in 30 days",
      "Advanced objection pack +3 pts even on a strong base",
    ],
    attention: ["Quietly approaching burnout — workload at top of band"],
    suggestions: [
      { title: "Assign Anita as peer-coach for Priya", detail: "1 session/week on competition pivots — counts toward L&D credits." },
      { title: "Protect Anita's lead mix", detail: "Cap her premium-lead allocation at current level for 2 weeks." },
    ],
  },
  rahul: {
    summary: "Rahul completed T&C timing module. Day 5 assessment due — last 5 calls show 3/5 disclosing on time.",
    working: ["T&C disclosure timing 60% → 80%", "Module completion on Day 4 (ahead of plan)"],
    attention: ["1 customer complaint last week", "Assessment due today"],
    suggestions: [
      { title: "Run Day 5 assessment now", detail: "Auto-score last 10 calls on T&C timing — exit if ≥ 4/5." },
      { title: "Push T&C timing nudge for 3 more days", detail: "Pre-call card · only on Term + ULIP product types." },
    ],
  },
};

function buildAgentCopilot(keyAgent: Agent | null, selected: RosterAgent | null): CopilotProps {
  if (keyAgent && AGENT_COPILOTS[keyAgent.id]) return AGENT_COPILOTS[keyAgent.id];
  if (selected) {
    return {
      summary: `${selected.name} · CQI ${selected.cqi}% · Cat ${selected.cat}. ${selected.trainingNote ?? "No active training plan."}`,
      working: [`Quality score ${selected.quality}`, `SPD ${selected.spd}`, `${selected.complaints} complaints (30d)`],
      attention: [
        selected.cap !== "None" ? `${selected.cap} active — review required` : "No CAP active",
        selected.training !== "None" ? `Training: ${selected.training}` : "No training assigned",
      ],
      suggestions: [
        { title: `Deploy coaching plan for ${selected.name}`, detail: `Targeted 3-day STT watch with daily micro-coaching · owner ${selected.tl}.` },
      ],
    };
  }
  return DEFAULT_AGENT_COPILOT;
}

function AgentView() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showAll, setShowAll] = useState(false);
  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const [modal, setModal] = useState<null | "feedback" | "training" | "eis">(null);

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
  const copilot = buildAgentCopilot(keyAgent, selected);

  return (
    <Shell copilot={copilot}>
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
                <th className="text-left py-2.5 px-2 font-medium">Status</th>
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
          onOpenEis={() => setModal("eis")}
        />
      )}

      {modal && selected && (
        <Modal
          onClose={() => setModal(null)}
          title={
            modal === "feedback" ? "CALL QUALITY MONITORING SHEET"
            : modal === "training" ? "Personalized Training Plan"
            : "Everyday Improvement Sheet (EIS)"
          }
          subtitle={
            modal === "feedback" ? "Outbound Insurance Sales · BPO Operations · AI-Enhanced Review"
            : modal === "eis" ? "Daily Coaching Report · 28 April 2026"
            : undefined
          }
          wide={modal === "feedback" || modal === "eis" || modal === "training"}
        >
          {modal === "feedback" && <FeedbackSheet roster={selected} keyAgent={keyAgent} />}
          {modal === "training" && (keyAgent ? <TrainingPlan a={keyAgent} /> : <RosterTrainingPlan r={selected} />)}
          {modal === "eis" && <EISReport roster={selected} keyAgent={keyAgent} />}
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
      <td className="py-2.5 px-2"><StatusPill s={a.status} /></td>
    </tr>
  );
}

function StatusPill({ s }: { s?: AgentStatus }) {
  if (!s) return <span className="text-dim text-[12px]">—</span>;
  const tone = s === "STAR" ? "green" : s === "COACH" ? "sand" : s === "WATCH" ? "amber" : "mauve";
  return <Badge tone={tone as any}>{s}</Badge>;
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
type DetailTab = "overview" | "rebuttals" | "training";

function AgentDetailPanel({
  roster, keyAgent, onClose, onOpenFeedback, onOpenTraining, onOpenEis,
}: {
  roster: RosterAgent;
  keyAgent: Agent | null;
  onClose: () => void;
  onOpenFeedback: () => void;
  onOpenTraining: () => void;
  onOpenEis: () => void;
}) {
  const [tab, setTab] = useState<DetailTab>("overview");

  // Synthesize 4-week trend
  const trend = keyAgent?.trend ?? [
    Math.max(50, roster.cqi - 4),
    Math.max(50, roster.cqi - 2),
    Math.max(50, roster.cqi - 1),
    roster.cqi,
  ];
  const dims = keyAgent?.dimensions ?? synthDims(roster.cqi);
  const calls = keyAgent?.todaysCalls ?? synthCalls(roster);

  const cqiColor =
    roster.cat === "A" ? "text-acc-green"
    : roster.cat === "B" ? "text-acc-sand"
    : "text-acc-mauve";

  const TABS: { key: DetailTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "rebuttals", label: "Suggested Rebuttals" },
    { key: "training", label: "Training Plan" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-[820px] bg-card border-l border-border flex flex-col animate-in slide-in-from-right duration-200">
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

        {/* Tabs */}
        <div className="px-5 pt-3 border-b border-border flex gap-1">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative text-[13px] px-3.5 py-2 rounded-t transition-colors ${
                  active
                    ? "text-acc-green border-b-2 border-acc-green -mb-px"
                    : "text-text-secondary hover:text-foreground border-b-2 border-transparent -mb-px"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {tab === "overview" && (
            <OverviewTab
              roster={roster}
              keyAgent={keyAgent}
              trend={trend}
              dims={dims}
              calls={calls}
              onOpenFeedback={onOpenFeedback}
              onOpenTraining={onOpenTraining}
              onOpenEis={onOpenEis}
            />
          )}
          {tab === "rebuttals" && <RebuttalsTab roster={roster} keyAgent={keyAgent} />}
          {tab === "training" && (
            keyAgent
              ? <TrainingPlan a={keyAgent} />
              : <RosterTrainingPlan r={roster} />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Overview tab ----------
function OverviewTab({
  roster, keyAgent, trend, dims, calls, onOpenFeedback, onOpenTraining, onOpenEis,
}: {
  roster: RosterAgent;
  keyAgent: Agent | null;
  trend: number[];
  dims: Agent["dimensions"];
  calls: Agent["todaysCalls"];
  onOpenFeedback: () => void;
  onOpenTraining: () => void;
  onOpenEis: () => void;
}) {
  const pattern = keyAgent?.feedback.aiPattern
    ?? `${roster.name} sits at CQI ${roster.cqi.toFixed(1)}% (Cat ${roster.cat}). Trend is stable. ${roster.training !== "None" ? `Currently in ${roster.training} on "${roster.trainingNote ?? "skill refresh"}".` : "No active training need."}`;
  const callsSampled = keyAgent ? (keyAgent.callsWeek ?? 47) : 32;
  const strengths = keyAgent?.feedback.strengths ?? ["Compliance discipline", "Polite, customer-first tone"];
  const improvements = keyAgent?.feedback.improvements ?? ["Tighten closing summary", "Confirm next-step on every call"];

  return (
    <>
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

      {/* Calls today — HIGH / LOW columns */}
      <Card title="My Calls Today">
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="text-dim text-[10.5px] uppercase tracking-wider">
              <tr>
                <th className="text-left py-2 font-medium">Call ID</th>
                <th className="text-left py-2 font-medium">Duration</th>
                <th className="text-left py-2 font-medium">CQI</th>
                <th className="text-left py-2 font-medium">Status</th>
                <th className="text-left py-2 font-medium">HIGH</th>
                <th className="text-left py-2 font-medium">LOW</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((c) => {
                const tone = c.tag === "Clean" ? "green" : c.tag === "Non-Fatal" ? "sand" : "mauve";
                const high = c.high ?? (c.tag === "Clean" ? c.obs : "—");
                const low = c.low ?? (c.tag !== "Clean" ? c.obs : "—");
                return (
                  <tr key={c.id} className="border-t border-border align-top">
                    <td className="py-2 font-mono">{c.id}</td>
                    <td className="py-2 font-mono">{c.duration}</td>
                    <td className="py-2 font-mono">{c.cqi}</td>
                    <td className="py-2"><Badge tone={tone as any}>{c.tag}</Badge></td>
                    <td className="py-2 text-acc-green leading-snug max-w-[220px]">{high}</td>
                    <td className="py-2 text-acc-sand leading-snug max-w-[220px]">{low}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Pattern Detection */}
      <div className="rounded-md border border-acc-green/40 bg-acc-green/5 p-4">
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-acc-green font-medium mb-1.5">
          🧠 AI Pattern Detection
        </div>
        <div className="text-[13.5px] text-foreground/90 leading-snug">
          AI has analyzed <span className="font-mono text-acc-green">{callsSampled}</span> calls and detected:{" "}
          <span className="text-foreground">{pattern}</span>
        </div>
      </div>

      {/* Strengths + Improvements */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-md border border-acc-green/30 bg-acc-green/5 p-3">
          <div className="text-[11px] uppercase tracking-wider text-acc-green mb-2">Strengths</div>
          <ul className="text-[13px] space-y-1.5">
            {strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-acc-green">●</span>{s}</li>)}
          </ul>
        </div>
        <div className="rounded-md border border-acc-sand/30 bg-acc-sand/5 p-3">
          <div className="text-[11px] uppercase tracking-wider text-acc-sand mb-2">Improvements</div>
          <ul className="text-[13px] space-y-1.5">
            {improvements.map((s, i) => <li key={i} className="flex gap-2"><span className="text-acc-sand">●</span>{s}</li>)}
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onOpenFeedback}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3.5 py-2 text-[13px] hover:border-acc-blue/40"
        >
          <FileText className="size-4 text-acc-blue" /> View Full Feedback Sheet
        </button>
        <button
          onClick={onOpenEis}
          className="inline-flex items-center gap-2 rounded-md border border-acc-blue/40 bg-acc-blue/10 px-3.5 py-2 text-[13px] text-acc-blue hover:bg-acc-blue/20"
        >
          <ClipboardList className="size-4" /> View EIS / Daily Report
        </button>
        <button
          onClick={onOpenTraining}
          className="inline-flex items-center gap-2 rounded-md border border-acc-green/40 bg-acc-green/10 px-3.5 py-2 text-[13px] text-acc-green hover:bg-acc-green/20"
        >
          <GraduationCap className="size-4" />
          {roster.keyId === "anita" ? "No Training Plan — STAR Performer" : "View Training Plan"}
        </button>
      </div>
    </>
  );
}

// ---------- Rebuttals tab ----------
function RebuttalsTab({ roster, keyAgent }: { roster: RosterAgent; keyAgent: Agent | null }) {
  const rebuttals = keyAgent?.rebuttals;
  const note = keyAgent?.rebuttalsNote;

  if (!rebuttals && !note) {
    return (
      <div className="rounded-md border border-border bg-surface-2 p-4 text-[13px] text-text-secondary">
        No personalized rebuttals queued for {roster.name}. The AI will surface scenario-specific scripts once a recurring gap is detected.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-acc-blue/30 bg-acc-blue/5 p-3">
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-acc-blue font-medium mb-1">Personalized for {roster.name}</div>
        <div className="text-[12.5px] text-foreground/85 leading-snug">
          Rebuttals below are generated from this agent's specific gap pattern, not generic library scripts.
        </div>
      </div>

      {note && (
        <div className="rounded-md border border-acc-green/30 bg-acc-green/5 p-4 text-[13.5px] leading-relaxed">
          {note}
        </div>
      )}

      {rebuttals?.map((r, i) => (
        <div key={i} className="rounded-md border border-border bg-surface-2 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border-b border-border">
            <Badge tone="blue">{r.badge}</Badge>
            <div className="text-[12.5px] text-text-secondary">{r.scenario}</div>
          </div>
          <div className="p-4 space-y-2.5">
            <div className="rounded-md border border-border bg-card p-3">
              <div className="text-[10.5px] uppercase tracking-wider text-dim mb-1">Customer says</div>
              <div className="text-[13px] italic">"{r.customer}"</div>
            </div>
            <div className="rounded-md border border-acc-green/30 bg-acc-green/5 p-3">
              <div className="text-[10.5px] uppercase tracking-wider text-acc-green mb-1">Say this instead</div>
              <div className="text-[13px] leading-snug">{r.response}</div>
            </div>
          </div>
        </div>
      ))}
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
function Modal({
  children, onClose, title, subtitle, wide = false,
}: { children: any; onClose: () => void; title: string; subtitle?: string; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[55] flex">
      <div className="flex-1 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`w-full ${wide ? "max-w-[1180px]" : "max-w-[720px]"} bg-card border-l border-border flex flex-col animate-in slide-in-from-right duration-200`}>
        <header className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-dim">Silaris</div>
            <div className="text-[16px] font-semibold tracking-tight">{title}</div>
            {subtitle && <div className="text-[11.5px] text-text-secondary mt-0.5">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="size-8 grid place-items-center rounded-md hover:bg-secondary">
            <X className="size-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        <footer className="px-5 py-3 border-t border-border text-[11px] text-dim flex items-center justify-between">
          <span>◉ Human-in-the-loop · April 2026</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="text-[12px] px-3 py-1.5 rounded border border-acc-green/40 bg-acc-green/10 text-acc-green hover:bg-acc-green/20"
            >
              Export PDF
            </button>
            <button onClick={onClose} className="text-[12px] px-3 py-1.5 rounded border border-border hover:border-acc-green/40">Close</button>
          </div>
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

// ============================================================
// Full Call Quality Monitoring Sheet
// Works for both rich keyAgent records and synthetic roster rows.
// ============================================================

type SheetSectionRow = { score: number; remark: string };
type SheetSection = { letter: string; title: string; max: number; score: number; remark: string };

const SECTION_TEMPLATE: { letter: string; title: string; max: number }[] = [
  { letter: "A", title: "Call Opening",         max: 10 },
  { letter: "B", title: "Product Presentation", max: 20 },
  { letter: "C", title: "Queries & Objections", max: 12 },
  { letter: "D", title: "Customer Busy",        max: 7  },
  { letter: "E", title: "Not Interested",       max: 9  },
  { letter: "F", title: "Call Closing",         max: 10 },
  { letter: "G", title: "Compliance",           max: 15 },
];

const SHEET_TOTAL_MAX = SECTION_TEMPLATE.reduce((s, x) => s + x.max, 0); // 83

type AgentSheet = {
  pattern: string;
  sections: SheetSectionRow[]; // length = 7, order A..G
  strengths: string[];
  improvements: string[];
  actionPlan: string[];
  action: string; // top-right amber box
};

const AGENT_SHEETS: Record<string, AgentSheet> = {
  priya: {
    pattern: "Competition comparison queries — unable to articulate Axis Max Life advantages vs HDFC / SBI. Occurred in 4 of 5 calls today and 31 of 47 calls this fortnight (66%).",
    sections: [
      { score: 9,  remark: "Warm and natural greeting. Clear intro. Purpose stated confidently." },
      { score: 13, remark: "⚠ Missed rider benefits. 🔴 Charges not explained clearly. T&C incomplete." },
      { score: 6,  remark: "🔴 PATTERN: Unable to handle competition comparison — 4 of 5 calls. Gets flustered with HDFC / SBI." },
      { score: 7,  remark: "Polite, immediate apology. Good callback scheduling." },
      { score: 8,  remark: "Graceful handling. Forgot to share callback number." },
      { score: 9,  remark: "Good closing tone. Brief summary — could be more thorough." },
      { score: 14, remark: "No DND breach. Minor overstatement on returns." },
    ],
    strengths: ["Excellent greeting", "Language clarity", "Callback handling", "Compliance instincts"],
    improvements: ["Competition comparison (Sec C) — critical gap", "Charges communication", "Proactive re-explanation"],
    actionPlan: [
      "Competition comparison module delivered to desktop / email",
      "Charges transparency training",
      "STT monitoring from Day 2",
      "Day 5 re-assessment — if no improvement, Trainer + TL notified",
    ],
    action: "Competition module deployed. Day 5 assessment due tomorrow — TL Pooja S. to validate live calls.",
  },
  rahul: {
    pattern: "T&C disclosure timing — mentions T&C at 1:42 on average instead of within first 30 seconds as mandated.",
    sections: [
      { score: 8,  remark: "Good but slightly rushed intro." },
      { score: 11, remark: "⚠ T&C at 1:42 instead of within 30 sec. Premium before compliance." },
      { score: 8,  remark: "Adequate — handles most queries but hesitates on technical questions." },
      { score: 7,  remark: "Good callback handling." },
      { score: 7,  remark: "Professional but could be warmer." },
      { score: 8,  remark: "Closing rushed — last 30 seconds feel hurried." },
      { score: 12, remark: "T&C timing is a compliance risk." },
    ],
    strengths: ["Professional tone", "Empathetic", "Product knowledge adequate"],
    improvements: ["T&C timing (compliance risk)", "Closing rushed", "Customer understanding check"],
    actionPlan: [
      "T&C timing module completed",
      "Assessment pending — 5 questions",
      "STT monitoring active",
    ],
    action: "Assessment due today. QA Manager to confirm 5/5 pass before exiting training.",
  },
  anita: {
    pattern: "STAR performer — consistent Category A across all 4 weeks. No gaps. Role model.",
    sections: [
      { score: 10, remark: "Perfect — warm, clear, permission asked with pause." },
      { score: 18, remark: "Thorough product explanation. Charges proactive. T&C within 15 seconds." },
      { score: 11, remark: "Handled HDFC objection with data. Used claim settlement and FMC." },
      { score: 7,  remark: "Empathetic and thorough." },
      { score: 9,  remark: "Graceful, shared callback, maintained tone." },
      { score: 10, remark: "Summarised all benefits. Created urgency. Customer committed." },
      { score: 14, remark: "Clean. Near-perfect compliance." },
    ],
    strengths: ["Everything — opening, knowledge, competition handling, compliance, closing"],
    improvements: ["None — maintain consistency"],
    actionPlan: [
      "No training needed",
      "Nominated for STAR recognition",
      "Available for peer coaching of Priya & Sneha",
    ],
    action: "No human intervention needed. Capture 3 calls as gold-standard training assets.",
  },
  deepak: {
    pattern: "FATAL compliance breaches — unauthorized fee waiver promise (3rd offense) + mis-selling language. Suspended.",
    sections: [
      { score: 7,  remark: "Adequate greeting but lacks energy." },
      { score: 9,  remark: "🔴 Cannot explain riders. Gave wrong fund count. Dead air 12 sec." },
      { score: 4,  remark: "🔴 Panics under questions. Says 'ek minute main check karta hoon.'" },
      { score: 5,  remark: "Forgot to confirm callback time." },
      { score: 6,  remark: "Abrupt — customer felt dismissed." },
      { score: 5,  remark: "No summary. No next steps. Just 'theek hai sir.'" },
      { score: 7,  remark: "🔴 FATAL: Unauthorized fee waiver promise. Pressure selling detected. 3rd offense." },
    ],
    strengths: ["Shows up consistently (that's about it)"],
    improvements: [
      "CRITICAL — unauthorized promises",
      "Mis-selling language",
      "Dead air",
      "Pressure selling",
      "Product knowledge",
    ],
    actionPlan: [
      "Suspended from outbound immediately",
      "Mandatory compliance refresher",
      "CAP-2 active — dual approval by Manager + QA Head",
      "Re-certification required before reinstatement (score 85%+)",
    ],
    action: "🚨 CAP-2 ACTIVE. Outbound suspended. Manager + QA Head must co-sign re-certification before reinstatement.",
  },
  sneha: {
    pattern: "Closing technique weak — doesn't summarize or create urgency. BUT improving — moved C → B in 4 weeks!",
    sections: [
      { score: 9,  remark: "Warm and confident opening." },
      { score: 14, remark: "Good product knowledge. Charges explained." },
      { score: 8,  remark: "Handles most objections. Competition handling improved." },
      { score: 7,  remark: "Empathetic callback handling." },
      { score: 7,  remark: "Professional. Could share more contact options." },
      { score: 7,  remark: "⚠ Customer said 'sochta hoon' — didn't attempt retention. No urgency." },
      { score: 13, remark: "Clean. No flags." },
    ],
    strengths: ["Strong improvement trajectory (+5 pts in 4 weeks)", "Product knowledge", "Empathetic"],
    improvements: ["Closing — no urgency created", "No benefit restatement", "No retention attempt"],
    actionPlan: [
      "Closing training completed",
      "Score improved 63 → 68",
      "Continue monitoring",
      "Target 75+ next week",
    ],
    action: "On track for Cat A. Maintain weekly STT review; queue for STAR shortlist if CQI ≥ 75 next week.",
  },
  manish: {
    pattern: "Product knowledge gap — cannot explain riders, fund options, plan variants. Stagnant at 58 – 60 for 4 weeks.",
    sections: [
      { score: 8,  remark: "Professional greeting." },
      { score: 8,  remark: "🔴 Cannot explain riders (customer asked 3 times). Wrong fund count. Dead air 9 sec." },
      { score: 5,  remark: "Panics when asked product questions. Long pauses." },
      { score: 6,  remark: "Adequate." },
      { score: 6,  remark: "Customer felt the agent didn't know the product." },
      { score: 6,  remark: "Weak closing. No confidence." },
      { score: 11, remark: "No fatal but lacks conviction in statements." },
    ],
    strengths: ["Professional greeting", "Empathetic tone"],
    improvements: ["CRITICAL — product knowledge", "Active listening", "Dead air", "Confidence"],
    actionPlan: [
      "AI coaching failed after 5 days",
      "Escalated to Trainer + TL",
      "Human-led product knowledge session scheduled",
      "CAP-1 initiated",
    ],
    action: "AI coaching exhausted. Schedule 2-week classroom + TL shadowing on product knowledge this week.",
  },
};

function buildSheet(roster: RosterAgent, keyAgent: Agent | null): { sections: SheetSection[]; override?: AgentSheet } {
  const override = roster.keyId ? AGENT_SHEETS[roster.keyId] : undefined;
  if (override) {
    const sections: SheetSection[] = SECTION_TEMPLATE.map((s, i) => ({
      letter: s.letter,
      title: s.title,
      max: s.max,
      score: override.sections[i].score,
      remark: override.sections[i].remark,
    }));
    return { sections, override };
  }

  // Synthesise from CQI + dimensions for the other 14 roster rows
  const baseRatio = Math.max(0.4, Math.min(1, roster.cqi / 100));
  const dimsByCode: Record<string, number> = {};
  if (keyAgent) for (const d of keyAgent.dimensions) dimsByCode[d.code] = d.score / d.max;
  const sectionToDim: Record<string, string> = { A: "D1", B: "D2", C: "D3", D: "D4", E: "D4", F: "D5", G: "D6" };
  const jitterMap: Record<string, number> = { A: 0.04, B: -0.03, C: -0.08, D: 0.05, E: -0.02, F: -0.04, G: 0.06 };

  const sections: SheetSection[] = SECTION_TEMPLATE.map((s) => {
    const ratio = Math.max(0.35, Math.min(1, (dimsByCode[sectionToDim[s.letter]] ?? baseRatio) + jitterMap[s.letter]));
    const score = Math.max(1, Math.min(s.max, Math.round(s.max * ratio)));
    return { letter: s.letter, title: s.title, max: s.max, score, remark: remarkFor(s.max, score) };
  });
  return { sections };
}

function remarkFor(max: number, score: number): string {
  const pct = score / max;
  if (pct >= 0.9) return "Consistent on this parameter.";
  if (pct >= 0.75) return "Mostly on script — minor coaching.";
  if (pct >= 0.6) return "Inconsistent — targeted drill recommended.";
  return "Gap — priority for AI coaching.";
}

function scoreClass(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.8) return "text-acc-green";
  if (pct >= 0.6) return "text-acc-sand";
  return "text-acc-mauve";
}

function ratingFor(pct: number): { label: string; tone: "green" | "blue" | "sand" | "mauve" } {
  if (pct >= 90) return { label: "EXCELLENT", tone: "green" };
  if (pct >= 75) return { label: "GOOD", tone: "blue" };
  if (pct >= 60) return { label: "NEEDS IMPROVEMENT", tone: "sand" };
  return { label: "CRITICAL", tone: "mauve" };
}

function FeedbackSheet({ roster, keyAgent }: { roster: RosterAgent; keyAgent: Agent | null }) {
  const { sections, override } = buildSheet(roster, keyAgent);
  const total = sections.reduce((a, s) => a + s.score, 0);
  const out = SHEET_TOTAL_MAX;
  const pct = Math.round((total / out) * 1000) / 10; // 1 decimal
  const rating = ratingFor(pct);

  const aiPattern = override?.pattern
    ?? keyAgent?.feedback.aiPattern
    ?? `AI analysed ${30 + roster.rank} calls over the last 14 days. ${roster.name} sits at CQI ${roster.cqi.toFixed(1)}% (Cat ${roster.cat}). Pattern: ${roster.cat === "C" ? "consistent gaps in objection handling and closing — AI coaching deployed." : roster.cat === "B" ? "on-track with isolated dips on competition pivots — targeted micro-coaching active." : "high consistency across all dimensions — maintain monitoring cadence."}`;

  const strengths = override?.strengths ?? keyAgent?.feedback.strengths ?? [
    "Compliance disclosure delivered on time",
    "Professional tone maintained throughout",
    "Customer rapport built within first 30 seconds",
  ];
  const improvements = override?.improvements ?? keyAgent?.feedback.improvements ?? [
    "Strengthen competition counter-pivots (HDFC / SBI)",
    "Summarize 3 benefits before closing",
    "Ask explicit commitment question at close",
  ];
  const actionPlan: string[] = override?.actionPlan ?? (keyAgent?.feedback.actionPlan ? [keyAgent.feedback.actionPlan] : [
    `AI micro-coaching scheduled over next 5 days. STT will re-score daily. Day 5 assessment with ${roster.tl}. Escalate to Trainer + TL if no movement.`,
  ]);

  const actionRequired = override?.action
    ?? (roster.cap !== "None"
      ? `${roster.cap} in effect — TL + QA Manager must co-sign weekly review until exit criteria are met.`
      : roster.training === "Escalated"
        ? "AI coaching exhausted — Trainer + TL classroom intervention required this week."
        : roster.cat === "C"
          ? "Enrol agent in next AI coaching cohort; QA Manager to review Day 5 assessment outcome."
          : "Continue STT live monitoring. No human escalation required at this stage.");

  return (
    <div className="space-y-5">
      {/* Agent info grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-[12.5px]">
        <Meta label="Agent" value={roster.name} />
        <Meta label="ID" value={roster.empId} />
        <Meta label="TL" value={roster.tl} />
        <Meta label="Process" value="Savings · Outbound" />
        <Meta label="Date" value="29 Apr 2026" />
        <Meta label="Reviewer" value="AI Quality Engine + Divya Krishnan (QA)" />
        <Meta label="Calls Reviewed" value={`${30 + roster.rank}`} />
      </div>

      {/* AI Pattern + Action Required */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-md border-l-4 border-l-acc-green border border-acc-green/30 bg-acc-green/[0.06] p-3">
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-acc-green font-medium mb-1">🧠 AI Pattern Detection</div>
          <div className="text-[13px] text-foreground/90 leading-snug">{aiPattern}</div>
        </div>
        <div className="rounded-md border border-acc-sand/30 bg-acc-sand/[0.06] p-3">
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-acc-sand font-medium mb-1">⚡ Action Required</div>
          <div className="text-[13px] text-foreground/90 leading-snug">{actionRequired}</div>
        </div>
      </div>

      {/* Sections A-G */}
      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead className="bg-surface-2 text-dim text-[10.5px] uppercase tracking-wider">
            <tr>
              <th className="text-left py-2 px-3 w-12 font-medium">#</th>
              <th className="text-left py-2 px-3 font-medium">Parameter</th>
              <th className="text-right py-2 px-3 w-14 font-medium">Max</th>
              <th className="text-right py-2 px-3 w-16 font-medium">Score</th>
              <th className="text-left py-2 px-3 font-medium">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((sec) => (
              <tr key={sec.letter} className="border-t border-border/60 align-top">
                <td className="py-2 px-3 font-mono text-acc-blue font-semibold">Sec {sec.letter}</td>
                <td className="py-2 px-3 font-medium">{sec.title}</td>
                <td className="py-2 px-3 text-right font-mono text-text-secondary">{sec.max}</td>
                <td className={`py-2 px-3 text-right font-mono font-semibold ${scoreClass(sec.score, sec.max)}`}>{sec.score}</td>
                <td className="py-2 px-3 text-text-secondary leading-snug">{sec.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grand Total */}
      <div className="rounded-md border border-acc-green/40 bg-acc-green/[0.06] p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-[10.5px] uppercase tracking-wider text-dim">Total</div>
            <div className="font-mono text-[22px] text-foreground">{total}</div>
          </div>
          <div>
            <div className="text-[10.5px] uppercase tracking-wider text-dim">Max</div>
            <div className="font-mono text-[22px] text-text-secondary">{out}</div>
          </div>
          <div>
            <div className="text-[10.5px] uppercase tracking-wider text-dim">Percentage</div>
            <div className={`font-mono text-[22px] ${scoreClass(total, out)}`}>{pct}%</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-[10.5px] uppercase tracking-wider text-dim mb-1">Rating</div>
            <Badge tone={rating.tone}>{rating.label}</Badge>
          </div>
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-md border border-acc-green/30 bg-acc-green/5 p-3">
          <div className="text-[11px] uppercase tracking-wider text-acc-green mb-2">Strengths</div>
          <ul className="text-[13px] space-y-1.5">
            {strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-acc-green">●</span>{s}</li>)}
          </ul>
        </div>
        <div className="rounded-md border border-acc-sand/30 bg-acc-sand/5 p-3">
          <div className="text-[11px] uppercase tracking-wider text-acc-sand mb-2">Areas for Improvement</div>
          <ul className="text-[13px] space-y-1.5">
            {improvements.map((s, i) => <li key={i} className="flex gap-2"><span className="text-acc-sand">●</span>{s}</li>)}
          </ul>
        </div>
      </div>

      {/* AI Action Plan */}
      <div className="rounded-md border border-acc-green/30 bg-acc-green/[0.06] p-4">
        <div className="text-[11px] uppercase tracking-wider text-acc-green mb-2">AI Action Plan</div>
        <ol className="text-[13px] space-y-1.5 list-decimal pl-5">
          {actionPlan.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </div>

      {/* Signature */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border text-[12px]">
        <SignBlock label="Agent" value={roster.name} />
        <SignBlock label="Reviewer" value="Divya Krishnan · QA" />
        <SignBlock label="Date" value="29 Apr 2026" />
      </div>
    </div>
  );
}

function SignBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="border-b border-border h-8" />
      <div className="text-[10.5px] uppercase tracking-wider text-dim mt-1">{label}</div>
      <div className="text-[12.5px]">{value}</div>
    </div>
  );
}

// ============================================================
// Per-agent rich training plans (PART C)
// ============================================================
type CallExcerpt = {
  scenario: string;
  customer: string;
  agent: string;
  analysis: string;
  correct: string;
};
type FbaRow = { feature: string; axis: string; hdfc: string; sbi: string; icici?: string };
type AltCheat = {
  title: string;
  intro?: string;
  rows: { k: string; v: string; tone?: "green" | "amber" | "mauve" | "neutral" }[];
};
type AgentPlan = {
  kind: "coaching" | "star" | "cap" | "escalated";
  targetCqi: number;
  gap: string;
  coachNote: string;
  excerpts?: CallExcerpt[];
  fba?: FbaRow[];
  altCheat?: AltCheat;
  quiz?: { q: string; a: string }[];
  schedule?: { day: string; what: string; tone: "green" | "amber" | "neutral" }[];
  closing: string;
  starStats?: { label: string; value: string }[];
};

const AGENT_PLANS: Record<string, AgentPlan> = {
  priya: {
    kind: "coaching",
    targetCqi: 90,
    gap: "Competition comparison — Axis Max Life vs HDFC / SBI / ICICI. Occurred in 31 of 47 calls this fortnight (66%).",
    coachNote:
      "Hi Priya — you're doing well. 84% CQI, your opening and compliance are floor-best. We're focusing on one thing: when a customer mentions HDFC or SBI, you need to respond with data, not 'main check karti hoon.'",
    excerpts: [
      {
        scenario: "HDFC charges comparison",
        customer: "HDFC ka online plan mein annual charges nahi hain. Aapke mein hain kya?",
        agent: "Sir, hamare mein charges hain thode se… main details bhej dungi… (8 sec pause)",
        analysis:
          "Deflected the question and went silent. Customer interpreted the pause as 'agent doesn't know.' Dead air >5s is a quality flag.",
        correct:
          "Amit ji, bahut achha sawaal! Bilkul transparent batati hoon — hamare plan mein admin charge ₹500/month hai, jo pehle 10 saal tak lagta hai. Lekin yeh maturity pe wapas mil jaata hai — matlab aapka actual loss zero. Aur HDFC se compare karein toh humara claim settlement 98.7% hai jo HDFC se higher hai, aur FMC time ke saath 1.35% se 0.90% tak reduce hota hai.",
      },
      {
        scenario: "SBI charges comparison",
        customer: "SBI mein charges kam hain.",
        agent: "Sir hamara FMC bhi kam hai, around 1% hi hoga… (wrong number)",
        analysis: "Gave an inaccurate FMC figure and missed the SBI allocation-charge counter entirely.",
        correct:
          "Actually SBI mein allocation charge 3–6% pehle 3 saal lagta hai. Hamare mein zero allocation. Aur FMC humara reduce hota hai 1.35% se 0.90% — SBI mein fixed rehta hai.",
      },
    ],
    fba: [
      { feature: "Claim settlement ratio", axis: "98.7% ✓", hdfc: "98.2%", sbi: "97.4%", icici: "97.9%" },
      { feature: "Allocation charge",      axis: "Zero ✓",  hdfc: "Zero",  sbi: "3–6% (Yr 1–3)", icici: "1.5–4%" },
      { feature: "FMC (Fund Mgmt Charge)", axis: "1.35% → 0.90% (reducing) ✓", hdfc: "1.35% fixed", sbi: "1.35% fixed", icici: "1.35% fixed" },
      { feature: "Admin charge",           axis: "₹500/mo, 10 yrs, refunded ✓", hdfc: "₹500/mo, non-refunded", sbi: "₹400/mo", icici: "₹500/mo" },
      { feature: "Fund options",           axis: "22 ✓",   hdfc: "11",    sbi: "9",     icici: "8" },
      { feature: "Free switching",         axis: "Unlimited ✓", hdfc: "12/yr free", sbi: "2/yr free", icici: "4/yr free" },
      { feature: "Loyalty additions",      axis: "From Yr 11 ✓", hdfc: "Yr 15", sbi: "Yr 15", icici: "Yr 11" },
    ],
    quiz: [
      { q: "Customer says 'HDFC mein charges nahi hain' — what 3 points do you make?", a: "(1) Both have zero allocation charge. (2) Axis admin charge is refundable at maturity — net loss zero. (3) Axis FMC reduces from 1.35% → 0.90% over time; HDFC stays at 1.35%." },
      { q: "What is Axis Max Life's claim settlement ratio and how does it compare to SBI?", a: "98.7% — higher than SBI's 97.4%. Always quote both numbers in the same sentence." },
      { q: "Customer says 'aapke plan mein admin charge bahut hai' — how do you turn this into an advantage?", a: "Acknowledge → reframe: charge is for 10 years only AND fully refunded at maturity → so true cost is zero, unlike HDFC where it is non-refundable." },
    ],
    schedule: [
      { day: "Day 1", what: "Module + FBA cheat sheet delivered (AI)", tone: "green" },
      { day: "Day 2–4", what: "STT live monitoring on every HDFC / SBI mention", tone: "green" },
      { day: "Day 5", what: "Assessment + reassess CQI", tone: "amber" },
      { day: "If <85%", what: "Escalate to Trainer + TL classroom", tone: "neutral" },
    ],
    closing:
      "You improved +2 points this week. Keep using claim settlement AND reducing FMC together. Top Quartile by next Friday!",
  },
  rahul: {
    kind: "coaching",
    targetCqi: 87,
    gap: "T&C disclosure timing — averaging 1:42 vs required <30 seconds. Compliance risk.",
    coachNote:
      "Hi Rahul — your product knowledge is solid and customers trust your voice. One fix: T&C must come within the first 30 seconds of your pitch. You're averaging 1:42 — that's a compliance risk we need to fix.",
    excerpts: [
      {
        scenario: "Late T&C disclosure",
        customer: "Haan boliye, kya plan hai aapke paas?",
        agent: "Sir premium ₹17,131 hai, 10 lakh cover… (T&C only at 1:42)",
        analysis:
          "Started premium discussion at 0:15. Recording disclosure and T&C framework came at 1:42 — customer was already anchored on price and confused about what 'charges' covered.",
        correct:
          "Within 10 seconds: 'Yeh call quality aur training purpose ke liye record ho rahi hai.' Within 30 seconds: T&C framework — life cover scope, charges structure, free-look period. THEN premium discussion.",
      },
      {
        scenario: "Charges objection that shouldn't have happened",
        customer: "Charges kab bataye? Aap toh premium hi bata rahe ho.",
        agent: "Sir bas batane hi wala tha — admin charge ₹500…",
        analysis:
          "Customer raised this at 3:00 because T&C came after the premium pitch. A proactive 30-second T&C eliminates this objection entirely.",
        correct:
          "Front-load it: 'Sir, premium discuss karne se pehle 30 second mein structure bata deti hoon — life cover, charges, aur free-look. Phir hum aapke liye plan customize karenge.'",
      },
    ],
    altCheat: {
      title: "T&C Compliance Sequence — First 30 Seconds",
      intro: "Disclosures must complete in this order BEFORE any premium discussion.",
      rows: [
        { k: "0–10 sec", v: "Call recording disclosure — 'Yeh call quality aur training purpose ke liye record ho rahi hai.'", tone: "green" },
        { k: "10–20 sec", v: "T&C framework — life cover scope, charges structure, free-look period.", tone: "green" },
        { k: "20–30 sec", v: "Confirm policy holder / decision maker identity.", tone: "green" },
        { k: "After 30 sec", v: "ONLY now begin premium and product discussion.", tone: "amber" },
        { k: "Never", v: "Discuss premium before T&C — IRDAI compliance breach.", tone: "mauve" },
      ],
    },
    quiz: [
      { q: "In the first 30 seconds of a call, what 3 things must you cover?", a: "(1) Call recording disclosure. (2) T&C framework — cover, charges, free-look. (3) Confirm customer is the policy holder / decision maker." },
      { q: "Why is it important to mention T&C BEFORE premium discussion?", a: "It is an IRDAI compliance requirement AND it pre-empts the 'aapne charges nahi bataye' objection. Trust is built before price is anchored." },
      { q: "Customer says 'aapne pehle charges kyun nahi bataye' — how do you recover?", a: "Acknowledge → re-disclose now → offer free-look period as safety net. Do not get defensive." },
    ],
    schedule: [
      { day: "Day 1", what: "30-second opening script + drill (AI)", tone: "green" },
      { day: "Day 2–4", what: "STT timing audit on every call opening", tone: "green" },
      { day: "Day 5", what: "Assessment due — 5 questions to confirm", tone: "amber" },
      { day: "If pass", what: "Promoted to Category A track", tone: "neutral" },
    ],
    closing:
      "Assessment is due — complete the 5 questions to confirm your improvement. You're close to Category A.",
  },
  anita: {
    kind: "star",
    targetCqi: 94,
    gap: "None — STAR performer.",
    coachNote: "Anita is a Category A STAR performer with 94% CQI. No training needed.",
    starStats: [
      { label: "Consistency", value: "4 weeks consistent Cat A" },
      { label: "Complaints", value: "0" },
      { label: "Fatal errors", value: "0" },
      { label: "Daily calls (avg)", value: "23" },
      { label: "Peer coaching", value: "Available" },
      { label: "Learners using her calls", value: "3 agents" },
    ],
    closing:
      "Available for peer coaching assignments. Recommended for recognition program. 3 agents are currently learning from Anita's call recordings as part of their training.",
  },
  deepak: {
    kind: "cap",
    targetCqi: 80,
    gap: "Unauthorized commitments and mis-selling. CAP-2 active — IRDAI exposure.",
    coachNote:
      "Deepak — this is serious. Unauthorized promises put the company at IRDAI risk. You are on CAP-2. Complete this compliance refresher and score 85%+ before you can return to calls.",
    excerpts: [
      {
        scenario: "Unauthorized fee waiver promise",
        customer: "Sir last year jaisa fee waiver de denge?",
        agent: "Agar aaj renewal kar dete hain to fee waive kar denge — guaranteed.",
        analysis:
          "Unauthorized commitment. Fee waiver requires manager approval. The word 'guaranteed' creates a binding promise the agent has no authority to make.",
        correct:
          "Sir, main samajh sakti hoon. Waiver ke liye manager approval chahiye — main check karke 2 ghante mein confirm karti hoon. Abhi ke liye, early renewal pe 7% loyalty discount already applicable hai.",
      },
      {
        scenario: "Mis-selling ULIP as guaranteed",
        customer: "Returns guaranteed hain kya?",
        agent: "Haan sir, returns guaranteed hain.",
        analysis:
          "ULIPs are market-linked. The word 'guaranteed' on a ULIP is mis-selling under IRDAI guidelines and a fatal compliance breach.",
        correct:
          "Expected returns based on historical performance. Market-linked products mein returns market conditions pe depend karte hain. Past performance is not indicative of future returns.",
      },
    ],
    altCheat: {
      title: "Compliance Rules — What You Cannot Say",
      intro: "These phrases trigger IRDAI exposure. Memorise the approved alternatives.",
      rows: [
        { k: "❌ 'Guaranteed returns'", v: "✓ 'Expected returns based on historical performance. Market-linked, past performance not indicative of future.'", tone: "mauve" },
        { k: "❌ 'Fee waiver guaranteed'", v: "✓ 'Needs manager approval — I'll confirm in 2 hours. Loyalty discount of 7% is already applicable.'", tone: "mauve" },
        { k: "❌ 'Tax-free returns guaranteed'", v: "✓ 'Subject to tax laws as applicable. Section 10(10D) benefits depend on conditions being met.'", tone: "mauve" },
        { k: "❌ 'Better than mutual funds'", v: "✓ 'Different product category — life cover + investment combined. Suitability depends on your goals.'", tone: "mauve" },
        { k: "❌ 'Cancel anytime, full refund'", v: "✓ 'Free-look period of 15 days from receipt. After that, surrender charges apply per policy terms.'", tone: "mauve" },
      ],
    },
    quiz: [
      { q: "A customer asks for a fee waiver. What do you do?", a: "Acknowledge → tell them it needs manager approval → commit a callback window → offer the existing approved loyalty discount as immediate value." },
      { q: "Can you say 'guaranteed returns' for a ULIP product? Why or why not?", a: "No. ULIPs are market-linked. Saying 'guaranteed' is mis-selling under IRDAI guidelines and a fatal compliance breach." },
      { q: "What is the difference between 'expected returns' and 'guaranteed returns'?", a: "'Expected' = projection based on historical performance, not promised. 'Guaranteed' = contractually binding — only allowed on traditional non-linked products." },
    ],
    schedule: [
      { day: "Today", what: "Compliance refresher module (mandatory)", tone: "amber" },
      { day: "Tomorrow", what: "Assessment — must score 85%+ to return to calls", tone: "amber" },
      { day: "Week 1", what: "TL + Compliance shadow on every call", tone: "neutral" },
      { day: "If fail", what: "CAP-3 — formal review", tone: "neutral" },
    ],
    closing:
      "Complete the refresher. Score 85%+. This is CAP-2. Next step is CAP-3.",
  },
  sneha: {
    kind: "coaching",
    targetCqi: 87,
    gap: "Closing technique — no urgency, no benefit restatement. Loses 'sochta hoon' customers.",
    coachNote:
      "Hi Sneha — congratulations! You moved from Category C to B in 4 weeks. That's real progress. Your closing technique is the last piece of the puzzle.",
    excerpts: [
      {
        scenario: "'Sochta hoon' surrender",
        customer: "Sochta hoon, baad mein batata hoon.",
        agent: "Okay sir, aap soch lijiye. (call ended)",
        analysis:
          "Accepted the deferral without creating urgency or scheduling a follow-up. Customer leaves with no commitment and no reason to return.",
        correct:
          "Bilkul sir, samajh sakti hoon. Bas ek baat — early renewal discount 7% sirf 25 April tak valid hai. Uske baad regular premium lagega. Main kal shaam 6 baje call karungi — tab tak aap decide kar sakte hain.",
      },
      {
        scenario: "No benefit restatement before close",
        customer: "Theek hai, dekh leta hoon.",
        agent: "Ji sir, thank you. Have a nice day.",
        analysis:
          "Closed without restating benefits. Customer leaves with no emotional anchor — only memory is the price tag.",
        correct:
          "Toh Sharma ji, aapko mil raha hai: 10 lakh life cover, 34 critical illness coverage, aur early renewal pe 7% discount. Yeh sab sirf ₹17,131 mein. Main payment link WhatsApp pe bhej rahi hoon.",
      },
    ],
    altCheat: {
      title: "Closing Technique Framework — The 3-S Close",
      intro: "Last 90 seconds of every call. Never skip a step.",
      rows: [
        { k: "Step 1 — Summarize benefits", v: "Restate the top 3 benefits in one sentence. 'Aapko mil raha hai: X lakh cover, Y illness rider, Z% discount.' Re-anchor on value, not price.", tone: "green" },
        { k: "Step 2 — Create urgency", v: "Use ONLY real deadlines: early-renewal discount cut-off, NAV cycle, age-band premium change. Never invent urgency.", tone: "green" },
        { k: "Step 3 — Set next step", v: "Specific commitment: 'Main kal shaam 6 baje call karungi' OR 'Payment link WhatsApp pe bhej rahi hoon.' Never 'main baad mein call karungi.'", tone: "green" },
        { k: "❌ Never do", v: "'Okay sir, aap soch lijiye.' — that's surrender, not a close.", tone: "mauve" },
      ],
    },
    quiz: [
      { q: "Customer says 'sochta hoon' — what 2 things must you do before ending?", a: "(1) Create a time-bound urgency anchor (discount deadline, slot, price change). (2) Schedule a specific callback time — not 'main kabhi call karungi'." },
      { q: "Why should you always restate benefits in the last 60 seconds?", a: "It re-anchors the customer on value, not price. The closing summary is what they remember after the call ends." },
      { q: "What urgency can you create without pressure-selling?", a: "Real deadlines: early-renewal discount cut-off, fund NAV cycle, age-band premium change. Always factual, never invented." },
    ],
    schedule: [
      { day: "Day 1", what: "Closing-summary script + 3-S framework (AI)", tone: "green" },
      { day: "Day 2–4", what: "STT monitoring on last 90 seconds of every call", tone: "green" },
      { day: "Day 5", what: "Assessment + reassess", tone: "amber" },
      { day: "Goal", what: "5 points to Top Quartile", tone: "neutral" },
    ],
    closing:
      "You're 5 points from Top Quartile! Keep creating urgency with deadlines and benefit summaries.",
  },
  manish: {
    kind: "escalated",
    targetCqi: 75,
    gap: "Product knowledge — cannot explain riders, fund options. AI coaching failed after 5 days.",
    coachNote:
      "Manish — AI coaching hasn't moved your scores in 5 days. Your Trainer and TL have been notified. A human-led session is scheduled for tomorrow 10 AM. This training plan is your preparation.",
    excerpts: [
      {
        scenario: "Cannot explain what plan covers",
        customer: "Is plan mein kya kya cover hota hai?",
        agent: "Sir, isme… life cover hota hai… aur kuch riders bhi hain… (dead air 9 sec)",
        analysis:
          "Could not list the three core covers. 9-second dead air. Customer left the call convinced the agent did not know the product.",
        correct:
          "Is plan mein teen cheezein cover hoti hain: (1) Life cover — 10x annual premium, (2) Critical illness rider — 34 bimariyon ka coverage, (3) Accidental death benefit — additional 50 lakh. Aur fund options mein 22 choices hain.",
      },
      {
        scenario: "Wrong fund-options number",
        customer: "Fund options kitne hain?",
        agent: "15 hain.",
        analysis: "Factual error — actual number is 22. Misrepresentation, even unintentional, is a compliance flag.",
        correct:
          "Hamare paas 22 fund options hain — equity se lekar debt tak. Aap apni risk appetite ke hisaab se choose kar sakte hain. Aur switching free aur unlimited hai.",
      },
    ],
    altCheat: {
      title: "Product Quick Reference — Riders, Funds, Plan Variants",
      intro: "Memorise these numbers. Customer asks → you answer in <3 seconds, no dead air.",
      rows: [
        { k: "Life cover", v: "10x annual premium (base). Up to 25x with additional underwriting.", tone: "green" },
        { k: "Critical illness rider", v: "34 illnesses covered. Lump sum payout on diagnosis.", tone: "green" },
        { k: "Accidental death benefit", v: "Additional ₹50 lakh on top of base cover.", tone: "green" },
        { k: "Waiver of premium rider", v: "Future premiums waived on disability or critical illness.", tone: "green" },
        { k: "Fund options", v: "22 funds — equity, debt, balanced. (HDFC: 11, SBI: 9, ICICI: 8)", tone: "green" },
        { k: "Switching", v: "Free and unlimited. (HDFC: 12/yr free, SBI: 2/yr free)", tone: "green" },
        { k: "Plan variants", v: "Savings, ULIP, Term, Pension, Child. 5 core categories.", tone: "neutral" },
      ],
    },
    quiz: [
      { q: "Name 3 things covered under the savings plan.", a: "(1) Life cover — 10x annual premium. (2) Critical illness rider — 34 illnesses. (3) Accidental death benefit — additional ₹50 lakh." },
      { q: "How many fund options does Axis Max Life offer? How many does HDFC offer?", a: "Axis Max Life — 22. HDFC — 11. Always quote both." },
      { q: "Customer asks 'riders kya hain' — explain in 2 sentences.", a: "Riders are optional add-ons that extend the base cover — like critical illness, accidental death, waiver of premium. You pay a small extra premium and get specific extra protection on top of life cover." },
    ],
    schedule: [
      { day: "Tonight", what: "Read this plan + product manual sections 3–5", tone: "amber" },
      { day: "Tomorrow 10 AM", what: "Human-led classroom session (Trainer + TL)", tone: "amber" },
      { day: "Week 1", what: "Daily product drill — riders, funds, charges", tone: "neutral" },
      { day: "Day 14", what: "Re-assessment — pass to exit escalation", tone: "neutral" },
    ],
    closing:
      "Your Trainer session is tomorrow 10 AM. Review this plan and the product manual tonight. Bring questions.",
  },
};

function TrainingPlanHeader({ a, plan }: { a: Agent; plan: AgentPlan }) {
  const statusLabel =
    plan.kind === "star" ? "STAR Performer"
    : plan.kind === "cap" ? "CAP-2 Active"
    : plan.kind === "escalated" ? "Escalated to Trainer"
    : "Active Coaching";
  const statusTone =
    plan.kind === "star" ? "text-acc-green border-acc-green/40 bg-acc-green/10"
    : plan.kind === "cap" ? "text-acc-mauve border-acc-mauve/40 bg-acc-mauve/10"
    : plan.kind === "escalated" ? "text-acc-sand border-acc-sand/40 bg-acc-sand/10"
    : "text-acc-blue border-acc-blue/40 bg-acc-blue/10";
  return (
    <div className="rounded-md border border-border bg-surface-2 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.18em] text-acc-green/80 font-semibold">
            Personalized Training Plan — AI Generated
          </div>
          <div className="text-[12px] text-text-secondary mt-0.5">
            Silaris Agentic AI · Auto-generated from call analysis
          </div>
        </div>
        <span className={`text-[11px] px-2 py-1 rounded border ${statusTone}`}>{statusLabel}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
        <Meta label="Agent" value={a.name} />
        <Meta label="Employee ID" value={a.empId} />
        <Meta label="Team Leader" value={a.tl} />
        <Meta label="Current CQI" value={`${a.pct.toFixed(1)}%`} />
        <Meta label="Target CQI" value={`${plan.targetCqi}%`} />
        <Meta label="Gap" value={`${Math.max(0, plan.targetCqi - a.pct).toFixed(1)} pts`} />
      </div>
      {plan.gap && plan.kind !== "star" && (
        <div className="rounded-md border border-border bg-surface px-3 py-2 text-[12.5px] mt-3">
          <span className="text-dim uppercase tracking-wider text-[10.5px] mr-2">Gap Identified</span>
          <span className="text-foreground/90">{plan.gap}</span>
        </div>
      )}
    </div>
  );
}

function ChatExcerpt({ idx, ex, agentName }: { idx: number; ex: CallExcerpt; agentName: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-semibold text-foreground">
          📞 Where You Need to Improve — Call Example {idx + 1}
        </div>
        <div className="text-[11px] text-dim">{ex.scenario}</div>
      </div>

      {/* Chat bubbles */}
      <div className="space-y-2">
        <div className="flex justify-start">
          <div className="max-w-[78%] rounded-2xl rounded-bl-sm border border-border bg-surface px-3.5 py-2">
            <div className="text-[10.5px] uppercase tracking-wider text-dim mb-0.5">Customer</div>
            <div className="text-[14px] italic text-acc-sand/90">"{ex.customer}"</div>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[78%] rounded-2xl rounded-br-sm border border-acc-mauve/30 bg-acc-mauve/10 px-3.5 py-2">
            <div className="text-[10.5px] uppercase tracking-wider text-acc-mauve mb-0.5">{agentName}</div>
            <div className="text-[14px] italic text-acc-mauve/90">"{ex.agent}"</div>
          </div>
        </div>
      </div>

      <div className="text-[12.5px] text-acc-sand/90 border-l-2 border-acc-sand/40 pl-3">
        <span className="uppercase tracking-wider text-[10.5px] text-acc-sand/80 mr-1">AI Note:</span>
        {ex.analysis}
      </div>

      <div className="rounded-md border border-acc-green/30 bg-acc-green/5 p-3">
        <div className="text-[12px] font-semibold text-acc-green mb-1">✓ What You Should Say Instead</div>
        <div className="text-[14px] italic text-acc-green/90 leading-snug">"{ex.correct}"</div>
        <div className="text-[11.5px] text-text-secondary mt-2">
          <span className="text-acc-green/80 font-medium">Why this works: </span>
          Acknowledged → specific numbers → reframed the objection → ended on a differentiator the customer remembers.
        </div>
      </div>
    </div>
  );
}

function CompetitionCheatSheet({ rows }: { rows: FbaRow[] }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 p-4">
      <div className="text-[13px] font-semibold mb-2">📊 Your Competition Cheat Sheet</div>
      <div className="text-[11.5px] text-text-secondary mb-3">
        Axis Max Life vs HDFC, SBI, ICICI — green = Axis Max Life wins on this dimension.
      </div>
      <div className="rounded-md border border-border overflow-hidden text-[12.5px]">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] bg-surface font-semibold text-text-secondary">
          <div className="px-2.5 py-2">Feature</div>
          <div className="px-2.5 py-2 text-acc-green">Axis Max Life</div>
          <div className="px-2.5 py-2">HDFC</div>
          <div className="px-2.5 py-2">SBI</div>
          <div className="px-2.5 py-2">ICICI</div>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] border-t border-border">
            <div className="px-2.5 py-2 text-text-secondary">{r.feature}</div>
            <div className="px-2.5 py-2 text-acc-green bg-acc-green/5">{r.axis}</div>
            <div className="px-2.5 py-2">{r.hdfc}</div>
            <div className="px-2.5 py-2">{r.sbi}</div>
            <div className="px-2.5 py-2">{r.icici ?? "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AltCheatSheet({ cheat }: { cheat: AltCheat }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 p-4">
      <div className="text-[13px] font-semibold mb-1">📊 {cheat.title}</div>
      {cheat.intro && <div className="text-[11.5px] text-text-secondary mb-3">{cheat.intro}</div>}
      <div className="rounded-md border border-border overflow-hidden">
        {cheat.rows.map((r, i) => {
          const tone =
            r.tone === "green" ? "text-acc-green"
            : r.tone === "amber" ? "text-acc-sand"
            : r.tone === "mauve" ? "text-acc-mauve"
            : "text-foreground/90";
          return (
            <div key={i} className="grid grid-cols-[200px_1fr] text-[12.5px] border-t border-border first:border-t-0">
              <div className={`bg-surface px-3 py-2 font-medium ${tone}`}>{r.k}</div>
              <div className="px-3 py-2 text-foreground/90">{r.v}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrainingScheduleTimeline({ items }: { items: NonNullable<AgentPlan["schedule"]> }) {
  return (
    <div className="rounded-md border border-acc-green/30 bg-acc-green/5 p-4">
      <div className="text-[13px] font-semibold mb-3 text-foreground">📅 Your Training Schedule</div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[12.5px]">
        {items.map((s, i) => {
          const tone =
            s.tone === "green" ? "border-acc-green/40 bg-acc-green/10 text-acc-green"
            : s.tone === "amber" ? "border-acc-sand/40 bg-acc-sand/10 text-acc-sand"
            : "border-border bg-surface-2 text-text-secondary";
          return (
            <div key={i} className="rounded-md border border-border bg-surface p-3">
              <div className={`text-[10.5px] uppercase tracking-wider px-1.5 py-0.5 rounded inline-block border ${tone}`}>
                {s.day}
              </div>
              <div className="text-[12.5px] mt-1.5 text-foreground/90 leading-snug">{s.what}</div>
            </div>
          );
        })}
      </div>
      <div className="text-[11.5px] text-text-secondary italic mt-3">
        Human intervention is the fallback, not the default.
      </div>
    </div>
  );
}

function TrainingPlan({ a, plan: planProp }: { a: Agent; plan?: AgentPlan }) {
  const plan = planProp ?? AGENT_PLANS[a.id];
  if (!plan) return <GenericTraining r={{ name: a.name, empId: a.empId, tl: a.tl, cqi: a.pct } as any} />;

  const coachTone =
    plan.kind === "cap" ? "border-acc-mauve/40 bg-acc-mauve/10 border-l-4 border-l-acc-mauve"
    : plan.kind === "escalated" ? "border-acc-sand/40 bg-acc-sand/10 border-l-4 border-l-acc-sand"
    : "border-acc-green/30 bg-acc-green/5 border-l-4 border-l-acc-green";

  const coachTitle =
    plan.kind === "star" ? "STAR Recognition Summary"
    : `Hi ${a.name.split(" ")[0]} — A Note From Your AI Coach`;

  return (
    <div className="space-y-4">
      {/* SECTION 1 — Header */}
      <TrainingPlanHeader a={a} plan={plan} />

      {/* SECTION 2 — AI Coach Note */}
      <div className={`rounded-md border ${coachTone} p-4`}>
        <div className="flex items-center gap-2 text-[13px] font-semibold mb-1.5">
          <GraduationCap className="size-4" /> {coachTitle}
        </div>
        <div className="text-[14px] text-foreground/90 leading-relaxed">{plan.coachNote}</div>
      </div>

      {/* STAR-only short path */}
      {plan.kind === "star" && plan.starStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {plan.starStats.map((s) => (
            <div key={s.label} className="rounded-md border border-border bg-surface-2 px-3 py-2">
              <div className="text-[10.5px] uppercase tracking-wider text-dim">{s.label}</div>
              <div className="text-[13px] font-medium mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* SECTIONS 3–4 — Call Excerpts */}
      {plan.excerpts?.map((ex, i) => (
        <ChatExcerpt key={i} idx={i} ex={ex} agentName={a.name.split(" ")[0]} />
      ))}

      {/* SECTION 5 — Cheat Sheet (FBA for Priya, alt for others) */}
      {plan.fba && <CompetitionCheatSheet rows={plan.fba} />}
      {!plan.fba && plan.altCheat && <AltCheatSheet cheat={plan.altCheat} />}

      {/* SECTION 6 — Training Schedule */}
      {plan.schedule && <TrainingScheduleTimeline items={plan.schedule} />}

      {/* SECTION 7 — Self-Assessment */}
      {plan.quiz && (
        <div className="rounded-md border border-border bg-surface-2 p-4">
          <div className="text-[13px] font-semibold mb-3">📝 Test Yourself — 3 Questions</div>
          <div className="space-y-2">
            {plan.quiz.map((qa, i) => <QuizItem key={i} idx={i} q={qa.q} a={qa.a} />)}
          </div>
        </div>
      )}

      {/* SECTION 8 — Closing Note */}
      <div className={`rounded-md border ${
        plan.kind === "cap" ? "border-acc-mauve/40 bg-acc-mauve/10"
        : plan.kind === "escalated" ? "border-acc-sand/40 bg-acc-sand/10"
        : "border-acc-green/30 bg-acc-green/5"
      } p-4 text-[14px] leading-relaxed`}>
        {plan.closing}
      </div>

      {/* Footer compliance */}
      <div className="text-[11px] text-dim text-center pt-2 border-t border-border">
        This training plan was generated by Silaris Agentic AI from analysis of 47 calls. 100% calls monitored. DPDP compliant.
      </div>
    </div>
  );
}


function AgentInfoStrip({ a, plan }: { a: Agent; plan: AgentPlan }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <Meta label="Agent" value={`${a.name}`} />
        <Meta label="Agent ID" value={a.empId} />
        <Meta label="Team Leader" value={a.tl} />
        <Meta label="Current CQI" value={`${a.pct.toFixed(1)}%`} />
        <Meta label="Target CQI" value={`${plan.targetCqi}%`} />
        <Meta label="Status" value={plan.kind === "star" ? "STAR" : plan.kind === "cap" ? "CAP-2 Active" : plan.kind === "escalated" ? "Escalated" : "Active Coaching"} />
      </div>
      {plan.gap && plan.kind !== "star" && (
        <div className="rounded-md border border-border bg-surface-2 px-3 py-2 text-[12.5px]">
          <span className="text-dim uppercase tracking-wider text-[10.5px] mr-2">Gap Identified</span>
          <span className="text-foreground/90">{plan.gap}</span>
        </div>
      )}
    </div>
  );
}

function QuizItem({ idx, q, a }: { idx: number; q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-border bg-surface-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-2 px-3 py-2.5 text-left"
      >
        <ChevronDown className={`size-4 mt-0.5 text-dim transition-transform ${open ? "rotate-180" : ""}`} />
        <div className="text-[13px] font-medium flex-1">Q{idx + 1}. {q}</div>
      </button>
      {open && (
        <div className="px-3 pb-3 pl-9 text-[12.5px] text-acc-green border-t border-border pt-2">
          → {a}
        </div>
      )}
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

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 px-3 py-2">
      <div className="text-[10.5px] uppercase tracking-wider text-dim">{label}</div>
      <div className="text-[13px] font-medium mt-0.5">{value}</div>
    </div>
  );
}

// ============================================================
// PART D — Everyday Improvement Sheet (EIS)
// ============================================================
type EisDim = { code: string; name: string; max: number; score: number; trend: "up" | "down" | "flat"; delta?: number; obs: string };
type EisSpotlight = { time: string; customer: string; agent: string; aiNote: string; correct: string; why: string };
type EisData = {
  date: string;
  shift: string;
  callsToday: number;
  callsWeek: number;
  cqiTodayPct: number;
  cqiTodayScore: number;
  cqiTodayDelta: number;
  weeklyAvgPct: number;
  dims: EisDim[];
  worked: string[];
  needs: string[];
  spotlight: EisSpotlight;
  risk: { tone: "fatal" | "minor" | "none"; text: string };
  tomorrow: string[];
  trend: { d: string; v: number }[];
};

const AGENT_EIS: Record<string, EisData> = {
  priya: {
    date: "28 April 2026", shift: "Morning (09:00–18:00)", callsToday: 21, callsWeek: 102,
    cqiTodayScore: 68, cqiTodayPct: 81.9, cqiTodayDelta: 2.0, weeklyAvgPct: 79.5,
    dims: [
      { code: "D1", name: "Communication",       max: 10, score: 9,  trend: "up",   delta: 0.5, obs: "Warm opening in all 21 calls." },
      { code: "D2", name: "Product Knowledge",   max: 20, score: 14, trend: "up",   delta: 1.0, obs: "Charges explained better in 3 calls. Still missed in 5." },
      { code: "D3", name: "Objection Handling",  max: 12, score: 7,  trend: "up",   delta: 1.0, obs: "Used claim settlement ratio in 2 calls — first time this week! HDFC comparison still weak." },
      { code: "D4", name: "Customer Handling",   max: 16, score: 15, trend: "flat",            obs: "Consistent and empathetic." },
      { code: "D5", name: "Closing",             max: 10, score: 9,  trend: "flat",            obs: "Benefit restatement in 14 of 21 calls." },
      { code: "D6", name: "Compliance",          max: 15, score: 14, trend: "flat",            obs: "Clean." },
    ],
    worked: [
      "Used claim settlement ratio in 2 calls for first time this week (10:42, 13:18).",
      "Charges disclosure rate improved 42% → 76% vs last week.",
      "Opening remains floor-best — warm, compliant, recording disclosure within 8s.",
    ],
    needs: [
      "Competition objection still #1 gap — hesitated in 3 of 5 HDFC mentions.",
      "FMC reducing-rate advantage not mentioned once today.",
      "Charges still missed entirely in 5 calls.",
    ],
    spotlight: {
      time: "14:22",
      customer: "HDFC ka online plan mein charges nahi hain. Aapke mein hain kya?",
      agent: "Sir, hamare mein charges hain thode se… main details bhej dungi… (8 sec pause)",
      aiNote: "Hesitation + 8s dead air. Customer interpreted silence as 'doesn't know.' Missed both the killer facts (claim settlement + reducing FMC).",
      correct: "Amit ji, bahut achha sawaal! Hamare admin charge ₹500/month — 10 saal tak — maturity pe wapas. Net loss zero. Claim settlement 98.7% (HDFC se higher), aur FMC 1.35% → 0.90% reduce hota hai.",
      why: "Three killer facts together — refundable charges, higher claim settlement, reducing FMC. Converts the objection into proof of superiority.",
    },
    risk: { tone: "minor", text: 'Minor — said "returns guaranteed hain" on ULIP at 11:48; self-corrected within 4 seconds. Flagged but not fatal.' },
    tomorrow: [
      "Use BOTH killer facts together — claim settlement AND reducing FMC — every HDFC / SBI mention.",
      "Charges disclosed in the first 2 minutes of every call.",
      'Replace "main check karti hoon" with confident data — you have the numbers now.',
    ],
    trend: [{ d: "Mon", v: 63 }, { d: "Tue", v: 65 }, { d: "Wed", v: 64 }, { d: "Thu", v: 66 }, { d: "Fri", v: 68 }],
  },
  rahul: {
    date: "28 April 2026", shift: "Morning (09:00–18:00)", callsToday: 18, callsWeek: 89,
    cqiTodayScore: 71, cqiTodayPct: 85.5, cqiTodayDelta: 1.0, weeklyAvgPct: 84.2,
    dims: [
      { code: "D1", name: "Communication",       max: 10, score: 9,  trend: "flat",            obs: "Clear, confident voice across all 18 calls." },
      { code: "D2", name: "Product Knowledge",   max: 20, score: 17, trend: "up",   delta: 0.5, obs: "Product explanation clear in 15 of 18 calls." },
      { code: "D3", name: "Objection Handling",  max: 12, score: 10, trend: "flat",            obs: "Strong rebuttal patterns, factual." },
      { code: "D4", name: "Customer Handling",   max: 16, score: 13, trend: "flat",            obs: "Callback scheduling strong; rapport solid." },
      { code: "D5", name: "Closing",             max: 10, score: 7,  trend: "down", delta: -0.5, obs: "Closing rushed in 4 calls — no benefit restatement." },
      { code: "D6", name: "Compliance",          max: 15, score: 15, trend: "up",   delta: 0.5, obs: "Clean — but T&C timing remains a concern." },
    ],
    worked: [
      "Product explanation clear in 15 of 18 calls.",
      "Empathetic tone maintained even with skeptical customers.",
      "Callback scheduling strong — 6 confirmed callbacks today.",
    ],
    needs: [
      "T&C disclosure at 1:42 in 3 calls today — well past the 30s compliance threshold.",
      "Closing rushed in 4 calls — no benefit restatement.",
      "Did not confirm customer understanding before ending pitch.",
    ],
    spotlight: {
      time: "11:15",
      customer: "Yeh toh pehle batana chahiye tha — charges kab bataye?",
      agent: "Sir bas batane hi wala tha — admin charge ₹500…",
      aiNote: "Customer raised this at 2:30 because premium discussion started at 0:15 but T&C only came at 1:42. The whole objection was avoidable.",
      correct: "Front-load T&C: 'Sir, premium discuss karne se pehle 30 second mein structure bata deti hoon — life cover, charges, free-look. Phir hum aapke liye plan customize karenge.'",
      why: "30-second T&C eliminates the 'aapne pehle nahi bataya' objection entirely and protects compliance score.",
    },
    risk: { tone: "minor", text: "T&C timing is a compliance concern — not fatal but flagged. 3 calls today exceeded the 30-second threshold." },
    tomorrow: [
      "T&C within 30 seconds — every call, no exceptions.",
      "Slow down closing — last 60 seconds must include benefit restatement.",
      "Confirm understanding before moving from pitch to close.",
    ],
    trend: [{ d: "Mon", v: 68 }, { d: "Tue", v: 70 }, { d: "Wed", v: 69 }, { d: "Thu", v: 70 }, { d: "Fri", v: 71 }],
  },
  anita: {
    date: "28 April 2026", shift: "Morning (09:00–18:00)", callsToday: 23, callsWeek: 114,
    cqiTodayScore: 78, cqiTodayPct: 94.0, cqiTodayDelta: 0, weeklyAvgPct: 93.8,
    dims: [
      { code: "D1", name: "Communication",       max: 10, score: 10, trend: "flat", obs: "Perfect opening — all 23 calls." },
      { code: "D2", name: "Product Knowledge",   max: 20, score: 19, trend: "flat", obs: "Encyclopedic; rider explanations consistently clear." },
      { code: "D3", name: "Objection Handling",  max: 12, score: 12, trend: "flat", obs: "Handled HDFC objection with data in 3 calls — textbook." },
      { code: "D4", name: "Customer Handling",   max: 16, score: 14, trend: "flat", obs: "Empathetic, patient, customer-led." },
      { code: "D5", name: "Closing",             max: 10, score: 9,  trend: "flat", obs: "Benefit restatement + urgency consistently used." },
      { code: "D6", name: "Compliance",          max: 15, score: 14, trend: "flat", obs: "T&C within 15 seconds every call." },
    ],
    worked: [
      "Perfect opening across all 23 calls.",
      "Handled HDFC objection with data (not deflection) in 3 calls.",
      "T&C within 15 seconds every call — exemplary compliance.",
    ],
    needs: ["None — maintain this consistency. You're the benchmark."],
    spotlight: {
      time: "10:30",
      customer: "Sir last year jaisa fee waiver de denge?",
      agent: "Sir, waiver ke liye manager approval chahiye — main check karke 2 ghante mein confirm karti hoon. Abhi ke liye early renewal pe 7% loyalty discount already applicable hai.",
      aiNote: "Exactly the behavior we train for — declined to make an unauthorized promise, set a callback expectation, AND offered immediate approved value.",
      correct: "(no correction needed — this IS the correct response)",
      why: "Protects company from IRDAI exposure, sets honest expectations, and keeps the customer engaged with a real concession.",
    },
    risk: { tone: "none", text: "None — clean day." },
    tomorrow: [
      "Continue being the standard.",
      "3 agents are learning from your recordings this week — keep recording quality high.",
      "Consider one peer-coaching slot for Sneha (closing technique).",
    ],
    trend: [{ d: "Mon", v: 77 }, { d: "Tue", v: 78 }, { d: "Wed", v: 78 }, { d: "Thu", v: 78 }, { d: "Fri", v: 78 }],
  },
  deepak: {
    date: "28 April 2026", shift: "Morning (09:00–15:30) — SUSPENDED 15:30", callsToday: 14, callsWeek: 71,
    cqiTodayScore: 52, cqiTodayPct: 62.7, cqiTodayDelta: -1.0, weeklyAvgPct: 54.3,
    dims: [
      { code: "D1", name: "Communication",       max: 10, score: 6,  trend: "flat",            obs: "Polite but hesitant." },
      { code: "D2", name: "Product Knowledge",   max: 20, score: 12, trend: "flat",            obs: "Attempted product explanation in 2 calls." },
      { code: "D3", name: "Objection Handling",  max: 12, score: 5,  trend: "down", delta: -1, obs: "Reverted to unauthorized commitments under pressure." },
      { code: "D4", name: "Customer Handling",   max: 16, score: 11, trend: "flat",            obs: "Friendly tone, but dead air avg 12 seconds." },
      { code: "D5", name: "Closing",             max: 10, score: 6,  trend: "flat",            obs: "Closes by promising things he cannot deliver." },
      { code: "D6", name: "Compliance",          max: 15, score: 7,  trend: "down", delta: -2, obs: "FATAL — unauthorized fee waiver + guaranteed-returns mis-selling." },
    ],
    worked: ["Attempted product explanation in 2 calls (minimal)."],
    needs: [
      "FATAL at 14:32 — unauthorized fee waiver promise.",
      'Mis-stated ULIP returns as "guaranteed" at 15:10.',
      "Dead air avg 12 seconds — customers disengaging.",
    ],
    spotlight: {
      time: "14:32",
      customer: "Sir last year jaisa fee waiver de denge?",
      agent: "Guaranteed fee waive kar denge — aaj hi renewal kar dijiye.",
      aiNote: "FATAL — unauthorized promise. Fee waiver requires manager approval. 'Guaranteed' is a binding word the agent has no authority to use. 3rd offense this quarter.",
      correct: "Sir, waiver ke liye manager approval chahiye — main 2 ghante mein confirm karti hoon. Abhi early renewal pe 7% loyalty discount available hai.",
      why: "Same outcome (customer engaged), zero IRDAI exposure, and an honest commitment the agent can keep.",
    },
    risk: { tone: "fatal", text: "🔴 FATAL breach. 3rd offense. CAP-2 active. Suspended from outbound effective 15:30 today." },
    tomorrow: [
      "No calls tomorrow.",
      "Compliance refresher mandatory — complete before any return to floor.",
      "Report to QA Head at 10:00 AM.",
    ],
    trend: [{ d: "Mon", v: 55 }, { d: "Tue", v: 53 }, { d: "Wed", v: 53 }, { d: "Thu", v: 53 }, { d: "Fri", v: 52 }],
  },
  sneha: {
    date: "28 April 2026", shift: "Morning (09:00–18:00)", callsToday: 20, callsWeek: 96,
    cqiTodayScore: 68, cqiTodayPct: 81.9, cqiTodayDelta: 1.0, weeklyAvgPct: 80.1,
    dims: [
      { code: "D1", name: "Communication",       max: 10, score: 9,  trend: "flat",            obs: "Warm and confident." },
      { code: "D2", name: "Product Knowledge",   max: 20, score: 16, trend: "up",   delta: 0.5, obs: "Charges explained proactively in 18 of 20 calls." },
      { code: "D3", name: "Objection Handling",  max: 12, score: 9,  trend: "up",   delta: 0.5, obs: "Improving — but still surrenders 'sochta hoon' easily." },
      { code: "D4", name: "Customer Handling",   max: 16, score: 14, trend: "flat",            obs: "Empathetic, patient." },
      { code: "D5", name: "Closing",             max: 10, score: 8,  trend: "up",   delta: 1.0, obs: "Closing improved — used urgency in 3 calls (\"discount sirf 25 April tak\")." },
      { code: "D6", name: "Compliance",          max: 15, score: 12, trend: "flat",            obs: "Clean." },
    ],
    worked: [
      "Closing improved — used urgency in 3 calls today (\"discount sirf 25 April tak\").",
      "Product knowledge strong — riders and fund options explained accurately.",
      "Charges disclosed proactively in 18 of 20 calls.",
    ],
    needs: [
      "Still 4 calls where customer said \"sochta hoon\" and Sneha didn't attempt retention.",
      "Benefit restatement only in 12 of 20 calls — should be every call.",
      "Urgency framing inconsistent — works when she uses it, but only 3 of 20.",
    ],
    spotlight: {
      time: "13:45",
      customer: "Sochta hoon, baad mein batata hoon.",
      agent: "Bilkul sir, samajh sakti hoon. Bas ek baat — early renewal discount 7% sirf 25 April tak valid hai. Main kal shaam 6 baje call karungi.",
      aiNote: "First successful retention attempt this week — customer agreed to a specific callback. This is the pattern to repeat.",
      correct: "(this WAS the correct move — replicate in every \"sochta hoon\" moment)",
      why: "Time-bound urgency + scheduled callback = customer leaves with a reason to return and a real deadline. No pressure, all facts.",
    },
    risk: { tone: "none", text: "None — clean day." },
    tomorrow: [
      "Use urgency + benefit restatement in EVERY closing — you did it in 3, do it in all 20.",
      "On every \"sochta hoon,\" anchor a specific deadline + callback time.",
      "Goal: 5 points to Top Quartile.",
    ],
    trend: [{ d: "Mon", v: 65 }, { d: "Tue", v: 65 }, { d: "Wed", v: 67 }, { d: "Thu", v: 67 }, { d: "Fri", v: 68 }],
  },
  manish: {
    date: "28 April 2026", shift: "Morning (09:00–18:00)", callsToday: 17, callsWeek: 84,
    cqiTodayScore: 58, cqiTodayPct: 69.9, cqiTodayDelta: 0, weeklyAvgPct: 69.5,
    dims: [
      { code: "D1", name: "Communication",       max: 10, score: 7,  trend: "flat",            obs: "Polite greeting and empathetic tone." },
      { code: "D2", name: "Product Knowledge",   max: 20, score: 10, trend: "flat",            obs: "Could not explain rider benefits in 4 calls." },
      { code: "D3", name: "Objection Handling",  max: 12, score: 6,  trend: "flat",            obs: "Dead air avg 9 sec after product questions." },
      { code: "D4", name: "Customer Handling",   max: 16, score: 11, trend: "down", delta: -0.5, obs: "Customer frustration high in 3 calls." },
      { code: "D5", name: "Closing",             max: 10, score: 6,  trend: "flat",            obs: "Closes without summarising benefits." },
      { code: "D6", name: "Compliance",          max: 15, score: 14, trend: "flat",            obs: "No breach — disclosure timing OK." },
    ],
    worked: ["Polite greeting and empathetic tone (minimal positives today)."],
    needs: [
      "Could not explain rider benefits in 4 calls.",
      "Dead air avg 9 sec after product questions.",
      'Customer said "aapko apne product ke baare mein pata nahi hai kya?" in 1 call.',
    ],
    spotlight: {
      time: "15:20",
      customer: "Riders kya hain?",
      agent: "Riders matlab… extra coverage… ek minute main check karta hoon. (11 sec dead air)",
      aiNote: "Customer disconnected after 11 seconds of silence. Pattern repeated in 4 calls today. AI coaching has not closed this gap in 5 days.",
      correct: "Riders optional add-ons hain jo base cover ke saath jude hain. Hamare paas critical illness (34 bimariyan), accidental death (₹50 lakh extra), aur waiver of premium — sab thoda extra premium pe.",
      why: "A 2-sentence factual answer eliminates dead air and projects mastery. This is exactly what tomorrow's classroom will drill.",
    },
    risk: { tone: "minor", text: "No compliance breach — but customer frustration score is high (3 calls flagged today). NPS risk." },
    tomorrow: [
      "No calls scheduled — Trainer session at 10:00 AM.",
      "Review product manual sections 3–5 tonight (riders, funds, charges).",
      "Bring 3 written questions to the classroom.",
    ],
    trend: [{ d: "Mon", v: 59 }, { d: "Tue", v: 59 }, { d: "Wed", v: 58 }, { d: "Thu", v: 58 }, { d: "Fri", v: 58 }],
  },
};

function synthEis(roster: RosterAgent): EisData {
  const pct = roster.cqi;
  const score = Math.round((pct / 100) * 83);
  const dims: EisDim[] = [
    { code: "D1", name: "Communication",      max: 10, score: Math.round(pct / 100 * 10), trend: "flat", obs: "Stable across today's calls." },
    { code: "D2", name: "Product Knowledge",  max: 20, score: Math.round(pct / 100 * 20), trend: "flat", obs: "On-pattern with weekly average." },
    { code: "D3", name: "Objection Handling", max: 12, score: Math.round(pct / 100 * 12), trend: "flat", obs: "Mixed — needs more reps." },
    { code: "D4", name: "Customer Handling",  max: 16, score: Math.round(pct / 100 * 16), trend: "flat", obs: "Customer rapport intact." },
    { code: "D5", name: "Closing",            max: 10, score: Math.round(pct / 100 * 10), trend: "flat", obs: "Consistent close pattern." },
    { code: "D6", name: "Compliance",         max: 15, score: Math.round(pct / 100 * 15), trend: "flat", obs: "No breach detected today." },
  ];
  return {
    date: "28 April 2026", shift: "Morning (09:00–18:00)", callsToday: 18, callsWeek: 86,
    cqiTodayScore: score, cqiTodayPct: pct, cqiTodayDelta: 0, weeklyAvgPct: Math.max(50, pct - 0.5),
    dims,
    worked: ["Consistent opening and disclosure.", "No fatal compliance flags today.", "Customer rapport maintained."],
    needs: ["Tighten closing summary.", "Confirm next-step on every call.", "Reduce dead-air windows."],
    spotlight: {
      time: "12:10",
      customer: "Aapka plan thoda mehnga lag raha hai.",
      agent: "Sir hamara plan thoda alag hai, main details bhej deti hoon…",
      aiNote: "Generic deflection. Customer wanted comparison data, not a follow-up promise.",
      correct: "Sir, ek minute mein bata deti hoon — humara claim settlement 98.7% hai aur FMC time ke saath reduce hota hai. Yeh charges ko long-term mein recover kar deta hai.",
      why: "Replaces deflection with two concrete numbers that reframe price as value.",
    },
    risk: { tone: "none", text: "None — clean day." },
    tomorrow: ["Use claim settlement + FMC together in every price objection.", "Restate top-3 benefits in last 60 seconds.", "Tighten openings to <12 seconds."],
    trend: [
      { d: "Mon", v: Math.max(50, score - 3) },
      { d: "Tue", v: Math.max(50, score - 2) },
      { d: "Wed", v: Math.max(50, score - 1) },
      { d: "Thu", v: Math.max(50, score - 1) },
      { d: "Fri", v: score },
    ],
  };
}

function EISReport({ roster, keyAgent }: { roster: RosterAgent; keyAgent: Agent | null }) {
  const eis: EisData = (roster.keyId && AGENT_EIS[roster.keyId]) ? AGENT_EIS[roster.keyId] : synthEis(roster);
  const deltaTone = eis.cqiTodayDelta > 0 ? "text-acc-green" : eis.cqiTodayDelta < 0 ? "text-acc-mauve" : "text-dim";
  const deltaArrow = eis.cqiTodayDelta > 0 ? "▲" : eis.cqiTodayDelta < 0 ? "▼" : "—";

  const cellTone = (s: number, m: number) => {
    const p = s / m;
    return p >= 0.8 ? "text-acc-green bg-acc-green/5"
      : p >= 0.6 ? "text-acc-sand bg-acc-sand/5"
      : "text-acc-mauve bg-acc-mauve/5";
  };
  const trendIcon = (t: "up" | "down" | "flat", d?: number) => {
    if (t === "up") return <span className="text-acc-green">▲ {d ? `+${d}` : ""}</span>;
    if (t === "down") return <span className="text-acc-mauve">▼ {d ?? ""}</span>;
    return <span className="text-dim">—</span>;
  };

  const riskTone =
    eis.risk.tone === "fatal" ? "border-l-4 border-l-acc-mauve border border-acc-mauve/30 bg-acc-mauve/10"
    : eis.risk.tone === "minor" ? "border-l-4 border-l-acc-sand border border-acc-sand/30 bg-acc-sand/10"
    : "border-l-4 border-l-acc-green border border-acc-green/30 bg-acc-green/5";

  return (
    <div className="space-y-4 text-[14px]">
      {/* Agent info strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Meta label="Agent" value={roster.name} />
        <Meta label="Agent ID" value={roster.empId} />
        <Meta label="Team Leader" value={roster.tl} />
        <Meta label="Date" value={eis.date} />
        <Meta label="Shift" value={eis.shift} />
        <Meta label="Calls Today" value={String(eis.callsToday)} />
        <Meta label="Calls This Week" value={String(eis.callsWeek)} />
        <Meta label="Weekly Avg CQI" value={`${eis.weeklyAvgPct.toFixed(1)}%`} />
      </div>

      {/* Today's CQI summary card */}
      <div className="rounded-md border border-border bg-surface-2 p-4">
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-[11px] uppercase tracking-wider text-dim">Today's CQI Summary</div>
          <div className="flex items-baseline gap-3">
            <div className="font-mono text-[26px] leading-none">
              {eis.cqiTodayScore}<span className="text-dim text-[16px]">/83</span>
            </div>
            <div className="text-[14px] text-text-secondary">({eis.cqiTodayPct.toFixed(1)}%)</div>
            <div className={`text-[14px] font-medium ${deltaTone}`}>
              {deltaArrow} {eis.cqiTodayDelta > 0 ? `+${eis.cqiTodayDelta}` : eis.cqiTodayDelta} from yesterday
            </div>
          </div>
        </div>
        <div className="rounded-md border border-border overflow-hidden">
          <div className="grid grid-cols-[60px_1.6fr_60px_80px_90px_1fr] bg-surface text-[11.5px] uppercase tracking-wider text-dim">
            <div className="px-2.5 py-2">Dim</div>
            <div className="px-2.5 py-2">Dimension</div>
            <div className="px-2.5 py-2 text-right">Max</div>
            <div className="px-2.5 py-2 text-right">Today</div>
            <div className="px-2.5 py-2">Trend</div>
            <div className="px-2.5 py-2">Observation</div>
          </div>
          {eis.dims.map((d, i) => (
            <div key={i} className="grid grid-cols-[60px_1.6fr_60px_80px_90px_1fr] border-t border-border text-[13px]">
              <div className="px-2.5 py-2 text-text-secondary">{d.code}</div>
              <div className="px-2.5 py-2">{d.name}</div>
              <div className="px-2.5 py-2 text-right text-dim">{d.max}</div>
              <div className={`px-2.5 py-2 text-right font-mono ${cellTone(d.score, d.max)}`}>{d.score}/{d.max}</div>
              <div className="px-2.5 py-2">{trendIcon(d.trend, d.delta)}</div>
              <div className="px-2.5 py-2 text-text-secondary">{d.obs}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Worked / Needs */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-md border-l-4 border-l-acc-green border border-acc-green/30 bg-acc-green/5 p-3">
          <div className="text-[11px] uppercase tracking-wider text-acc-green mb-2">What Worked Well</div>
          <ul className="space-y-1.5 text-[13.5px]">
            {eis.worked.map((s, i) => <li key={i} className="flex gap-2"><span className="text-acc-green mt-0.5">✓</span><span>{s}</span></li>)}
          </ul>
        </div>
        <div className="rounded-md border-l-4 border-l-acc-sand border border-acc-sand/30 bg-acc-sand/5 p-3">
          <div className="text-[11px] uppercase tracking-wider text-acc-sand mb-2">What Needs Improvement</div>
          <ul className="space-y-1.5 text-[13.5px]">
            {eis.needs.map((s, i) => <li key={i} className="flex gap-2"><span className="text-acc-sand mt-0.5">●</span><span>{s}</span></li>)}
          </ul>
        </div>
      </div>

      {/* Spotlight */}
      <div className="rounded-md border-l-4 border-l-acc-blue border border-acc-blue/30 bg-acc-blue/5 p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="text-[11px] uppercase tracking-wider text-acc-blue">Call Spotlight</div>
          <div className="text-[12px] text-dim">· {eis.spotlight.time}</div>
        </div>
        <div>
          <div className="text-[10.5px] uppercase tracking-wider text-acc-sand mb-0.5">Customer</div>
          <div className="text-[14px] italic text-acc-sand/90">"{eis.spotlight.customer}"</div>
        </div>
        <div>
          <div className="text-[10.5px] uppercase tracking-wider text-acc-mauve mb-0.5">Agent said</div>
          <div className="text-[14px] italic text-acc-mauve/90">"{eis.spotlight.agent}"</div>
        </div>
        <div className="rounded-md border border-border bg-surface-2 p-2.5">
          <div className="text-[10.5px] uppercase tracking-wider text-dim mb-0.5">AI Note</div>
          <div className="text-[13.5px] text-text-secondary">{eis.spotlight.aiNote}</div>
        </div>
        <div className="rounded-md border border-acc-green/30 bg-acc-green/5 p-2.5">
          <div className="text-[10.5px] uppercase tracking-wider text-acc-green mb-0.5">Correct Response</div>
          <div className="text-[14px] italic text-acc-green/90">"{eis.spotlight.correct}"</div>
        </div>
        <div>
          <div className="text-[10.5px] uppercase tracking-wider text-dim mb-0.5">Why this works</div>
          <div className="text-[13.5px] text-text-secondary">{eis.spotlight.why}</div>
        </div>
      </div>

      {/* Risk */}
      <div className={`rounded-md p-3 ${riskTone}`}>
        <div className="text-[11px] uppercase tracking-wider mb-1 text-foreground/80">Risk Flags</div>
        <div className="text-[13.5px]">{eis.risk.text}</div>
      </div>

      {/* Tomorrow */}
      <div className="rounded-md border-l-4 border-l-acc-green border border-acc-green/30 bg-acc-green/5 p-3">
        <div className="text-[11px] uppercase tracking-wider text-acc-green mb-2">Tomorrow's Focus</div>
        <ol className="space-y-1.5 text-[13.5px] list-decimal pl-5">
          {eis.tomorrow.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      </div>

      {/* Weekly trend */}
      <div className="rounded-md border border-border bg-surface-2 p-3">
        <div className="text-[11px] uppercase tracking-wider text-dim mb-2">Weekly Trend</div>
        <div className="grid grid-cols-5 gap-2">
          {eis.trend.map((t, i) => {
            const prev = i > 0 ? eis.trend[i - 1].v : t.v;
            const arrow = t.v > prev ? "▲" : t.v < prev ? "▼" : "—";
            const tone = t.v > prev ? "text-acc-green" : t.v < prev ? "text-acc-mauve" : "text-dim";
            return (
              <div key={i} className="rounded-md border border-border bg-surface p-2.5 text-center">
                <div className="text-[10.5px] uppercase tracking-wider text-dim">{t.d}</div>
                <div className="font-mono text-[18px] mt-0.5">{t.v}</div>
                <div className={`text-[12px] ${tone}`}>{arrow}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Roster Training Plan — synthesize rich plan for non-key agents
// ============================================================

type TopicTemplate = Omit<AgentPlan, "targetCqi" | "coachNote" | "closing"> & {
  coachNote: (firstName: string) => string;
  closing: (firstName: string, gain: number) => string;
  targetCqiBoost: number;
};

const TOPIC_TEMPLATES: { match: RegExp; key: string; tpl: TopicTemplate }[] = [
  {
    key: "tnc",
    match: /T&C|t&c|timing/i,
    tpl: {
      kind: "coaching",
      targetCqiBoost: 4,
      gap: "T&C disclosure timing — disclosure landing after the premium pitch. Compliance risk.",
      coachNote: (n) =>
        `Hi ${n} — your tone and product fluency are strong. The one fix: T&C must land in the first 30 seconds, before any premium discussion. This is an IRDAI compliance requirement and eliminates the 'aapne charges nahi bataye' objection.`,
      excerpts: [
        {
          scenario: "Late T&C disclosure",
          customer: "Haan boliye, kya plan hai aapke paas?",
          agent: "Sir premium ₹17,131 hai, 10 lakh cover… (T&C only at 1:42)",
          analysis:
            "Premium discussion began at 0:15. T&C framework came at 1:42 — customer was already anchored on price and confused about what 'charges' covered.",
          correct:
            "Within 10 sec: 'Yeh call quality aur training purpose ke liye record ho rahi hai.' Within 30 sec: T&C framework — cover scope, charges, free-look. THEN premium.",
        },
      ],
      altCheat: {
        title: "T&C Compliance Sequence — First 30 Seconds",
        intro: "Complete in this order BEFORE any premium discussion.",
        rows: [
          { k: "0–10 sec", v: "Call recording disclosure — verbatim line.", tone: "green" },
          { k: "10–20 sec", v: "T&C framework — cover scope, charges, free-look period.", tone: "green" },
          { k: "20–30 sec", v: "Confirm policy holder / decision maker identity.", tone: "green" },
          { k: "After 30 sec", v: "ONLY now begin premium and product discussion.", tone: "amber" },
          { k: "Never", v: "Premium before T&C — IRDAI compliance breach.", tone: "mauve" },
        ],
      },
      quiz: [
        { q: "What 3 things must you cover in the first 30 seconds?", a: "(1) Recording disclosure. (2) T&C framework — cover, charges, free-look. (3) Confirm decision maker." },
        { q: "Why mention T&C BEFORE premium?", a: "IRDAI compliance, and pre-empts the 'aapne charges nahi bataye' objection. Trust before price anchor." },
        { q: "Customer says 'aapne pehle charges kyun nahi bataye' — recover how?", a: "Acknowledge → re-disclose now → offer free-look as safety net. No defensiveness." },
      ],
      schedule: [
        { day: "Day 1", what: "30-second opening script + drill (AI)", tone: "green" },
        { day: "Day 2–4", what: "STT timing audit on every opening", tone: "green" },
        { day: "Day 5", what: "Assessment — 5 questions", tone: "amber" },
        { day: "If pass", what: "Cleared for Cat A track", tone: "neutral" },
      ],
      closing: (n, g) => `${n}, this is a 5-day fix. Stay disciplined on the first 30 seconds and you gain ~${g} CQI points.`,
    },
  },
  {
    key: "closing",
    match: /closing|3-S|sochta/i,
    tpl: {
      kind: "coaching",
      targetCqiBoost: 4,
      gap: "Closing technique — no urgency anchor, no benefit restatement. Losing 'sochta hoon' customers.",
      coachNote: (n) =>
        `Hi ${n} — your discovery and product pitch are good. The last 90 seconds are where the conversion lives. Use the 3-S close every time: Summarize → Urgency → Specific next step.`,
      excerpts: [
        {
          scenario: "'Sochta hoon' surrender",
          customer: "Sochta hoon, baad mein batata hoon.",
          agent: "Okay sir, aap soch lijiye. (call ended)",
          analysis: "Deferral accepted with no urgency and no callback slot. Customer leaves with zero commitment.",
          correct:
            "Bilkul sir. Bas ek baat — early renewal discount 7% sirf 25 April tak valid hai. Main kal shaam 6 baje call karungi — tab tak aap decide kar lijiye.",
        },
      ],
      altCheat: {
        title: "Closing Technique Framework — The 3-S Close",
        intro: "Last 90 seconds of every call. Never skip a step.",
        rows: [
          { k: "Step 1 — Summarize", v: "Top 3 benefits in one sentence. Re-anchor on value, not price.", tone: "green" },
          { k: "Step 2 — Urgency", v: "Only real deadlines: discount cut-off, NAV cycle, age-band change. Never invent.", tone: "green" },
          { k: "Step 3 — Next step", v: "Specific: 'Main kal 6 baje call karungi' OR 'Payment link bhej rahi hoon.'", tone: "green" },
          { k: "❌ Never do", v: "'Okay sir, aap soch lijiye.' — that's surrender, not a close.", tone: "mauve" },
        ],
      },
      quiz: [
        { q: "Customer says 'sochta hoon' — what 2 things before ending?", a: "(1) Time-bound urgency anchor. (2) Specific callback time." },
        { q: "Why restate benefits in the last 60 seconds?", a: "Re-anchors on value, not price. It's what the customer remembers." },
        { q: "What urgency can you create without pressure-selling?", a: "Real deadlines only — discount cut-off, NAV cycle, age-band premium change." },
      ],
      schedule: [
        { day: "Day 1", what: "3-S closing framework + script (AI)", tone: "green" },
        { day: "Day 2–4", what: "STT monitoring on last 90 seconds", tone: "green" },
        { day: "Day 5", what: "Assessment + CQI reassessment", tone: "amber" },
        { day: "Goal", what: "Top Quartile within 2 weeks", tone: "neutral" },
      ],
      closing: (n, g) => `${n}, the 3-S close is worth ~${g} points. Use it on every call this week.`,
    },
  },
  {
    key: "charges",
    match: /charges|clarity|transpar/i,
    tpl: {
      kind: "coaching",
      targetCqiBoost: 4,
      gap: "Charges communication — admin charge and FMC not proactively explained. Trust erodes mid-call.",
      coachNote: (n) =>
        `Hi ${n} — customers don't dislike charges, they dislike surprises. Front-load the structure once, frame the admin charge as refundable, and the objection disappears.`,
      excerpts: [
        {
          scenario: "Charges discovered late",
          customer: "Annual charges alag se lagte hain kya?",
          agent: "Ji… admin charges hain thode se… details bhej dungi.",
          analysis: "Vague reply triggered suspicion. Customer asked for a delay instead of paying.",
          correct:
            "Bilkul transparent batati hoon — admin charge ₹500/month hai, pehle 10 saal tak. Lekin yeh maturity pe wapas mil jaata hai — actual loss zero. FMC 1.35% se 0.90% tak reduce hota hai over time.",
        },
      ],
      altCheat: {
        title: "Charges Script — Proactive Disclosure",
        intro: "Use these exact lines within the first product explanation.",
        rows: [
          { k: "Admin charge", v: "'₹500/month, 10 saal, maturity pe wapas — net cost zero.'", tone: "green" },
          { k: "FMC", v: "'1.35% starting, time ke saath 0.90% tak reduce hota hai.'", tone: "green" },
          { k: "Allocation", v: "'Zero allocation charge — full premium invest hota hai.'", tone: "green" },
          { k: "❌ Avoid", v: "'Charges thode se hain' — vague language erodes trust.", tone: "mauve" },
        ],
      },
      quiz: [
        { q: "How do you frame the admin charge as an advantage?", a: "10 years only AND fully refunded at maturity → true cost is zero." },
        { q: "What is the FMC trajectory?", a: "Reduces from 1.35% to 0.90% over time — unlike HDFC where it stays fixed." },
        { q: "Customer says 'charges hi charges hain' — recover how?", a: "Acknowledge → walk through each charge with the offset (refund, reduction, zero allocation)." },
      ],
      schedule: [
        { day: "Day 1", what: "Charges script + drill (AI)", tone: "green" },
        { day: "Day 2–4", what: "STT flags on every 'charge' / 'fees' mention", tone: "green" },
        { day: "Day 5", what: "Assessment + reassess", tone: "amber" },
        { day: "Goal", what: "Same-call conversion uplift", tone: "neutral" },
      ],
      closing: (n, g) => `${n}, transparency closes more than discounts. Expect ~${g} CQI points within 5 days.`,
    },
  },
  {
    key: "objection",
    match: /objection|competition|rebuttal/i,
    tpl: {
      kind: "coaching",
      targetCqiBoost: 4,
      gap: "Objection handling on competition comparisons — losing data battles vs HDFC, SBI, ICICI.",
      coachNote: (n) =>
        `Hi ${n} — when a customer name-drops HDFC or SBI, that's a buying signal, not a rejection. Match the number, then add an Axis Max Life differentiator. Never say 'main check karti hoon.'`,
      excerpts: [
        {
          scenario: "HDFC claim settlement objection",
          customer: "HDFC ka claim settlement bhi 98% se upar hai.",
          agent: "Haan sir similar hi hoga…",
          analysis: "Conceded the comparison instead of winning on the specific number. Lost the differentiator.",
          correct:
            "Bilkul sir — HDFC 98.2% hai, hamara 98.7% — slightly higher. Aur hamara FMC time ke saath reduce hota hai 1.35% se 0.90% tak — HDFC mein fixed rehta hai.",
        },
      ],
      fba: [
        { feature: "Claim settlement", axis: "98.7% ✓", hdfc: "98.2%", sbi: "97.4%", icici: "97.9%" },
        { feature: "Allocation charge", axis: "Zero ✓", hdfc: "Zero", sbi: "3–6% (Yr 1–3)", icici: "1.5–4%" },
        { feature: "FMC", axis: "1.35% → 0.90% ✓", hdfc: "1.35% fixed", sbi: "1.35% fixed", icici: "1.35% fixed" },
        { feature: "Fund options", axis: "22 ✓", hdfc: "11", sbi: "9", icici: "8" },
        { feature: "Free switching", axis: "Unlimited ✓", hdfc: "12/yr", sbi: "2/yr", icici: "4/yr" },
      ],
      quiz: [
        { q: "Customer cites HDFC's claim settlement — your move?", a: "Match the number (98.2% vs 98.7%), then add a second differentiator (reducing FMC)." },
        { q: "Customer says SBI is cheaper — your move?", a: "Reframe: SBI has 3–6% allocation charge in Yr 1–3; Axis has zero. Long-term, Axis is cheaper." },
        { q: "What 3 numbers must you have memorised?", a: "98.7% claim settlement, FMC 1.35→0.90, 22 fund options." },
      ],
      schedule: [
        { day: "Day 1", what: "Competition cheat sheet drill (AI)", tone: "green" },
        { day: "Day 2–4", what: "STT flags on every competitor mention", tone: "green" },
        { day: "Day 5", what: "Assessment + CQI reassessment", tone: "amber" },
        { day: "Goal", what: "Zero 'main check karti hoon' moments", tone: "neutral" },
      ],
      closing: (n, g) => `${n}, every competitor mention is a sale to be won. Target ~${g} CQI points this week.`,
    },
  },
  {
    key: "product",
    match: /product|bootcamp|rider|step-up/i,
    tpl: {
      kind: "coaching",
      targetCqiBoost: 5,
      gap: "Product knowledge — riders, fund options, and benefit structure not at fingertips. Dead air spikes.",
      coachNote: (n) =>
        `Hi ${n} — product fluency is the foundation everything else rests on. This week is a focused refresher on the 3 covers, 22 funds, and the rider menu. No more 'ek minute main check karti hoon.'`,
      excerpts: [
        {
          scenario: "Cannot list what the plan covers",
          customer: "Is plan mein kya kya cover hota hai?",
          agent: "Sir, isme life cover hota hai… aur kuch riders bhi hain… (9 sec pause)",
          analysis: "Could not list the three core covers. 9-second dead air. Trust collapsed mid-call.",
          correct:
            "Teen cheezein cover hoti hain: (1) Life cover 10x annual premium, (2) Critical illness rider — 34 bimariyon, (3) Accidental death benefit — extra 50 lakh. Plus 22 fund options.",
        },
      ],
      altCheat: {
        title: "Product Quick Reference",
        intro: "Memorise these. Use them in every product pitch.",
        rows: [
          { k: "Core covers", v: "Life cover (10x premium) + 34-illness critical rider + 50 lakh accidental death.", tone: "green" },
          { k: "Fund options", v: "22 funds — equity, debt, balanced. Switching free and unlimited.", tone: "green" },
          { k: "Riders", v: "Critical illness, accidental death, waiver of premium, term booster.", tone: "green" },
          { k: "❌ Never say", v: "'Ek minute main check karti hoon' on basic product questions.", tone: "mauve" },
        ],
      },
      quiz: [
        { q: "Name the 3 core covers in one sentence.", a: "Life cover (10x annual premium), 34-illness critical rider, ₹50 lakh accidental death." },
        { q: "How many fund options? Switching policy?", a: "22 funds. Free and unlimited switching." },
        { q: "Customer asks 'riders kya hain' — 2-sentence answer.", a: "Extra benefits on top of the base policy. Top 3: critical illness (34 conditions), accidental death (extra 50 lakh), waiver of premium." },
      ],
      schedule: [
        { day: "Day 1", what: "Product quick-ref + flashcards (AI)", tone: "green" },
        { day: "Day 2–4", what: "STT flags on every 'check karti hoon' instance", tone: "green" },
        { day: "Day 5", what: "Assessment — must score 80%+", tone: "amber" },
        { day: "If fail", what: "Escalate to Trainer", tone: "neutral" },
      ],
      closing: (n, g) => `${n}, product fluency is the single highest-ROI fix. Expect ~${g} CQI points in 5 days.`,
    },
  },
  {
    key: "listening",
    match: /listening|active/i,
    tpl: {
      kind: "coaching",
      targetCqiBoost: 4,
      gap: "Active listening — interrupting customers, not paraphrasing concerns. Empathy score low.",
      coachNote: (n) =>
        `Hi ${n} — customers tell you exactly what to sell them if you let them finish. This week: pause, paraphrase, then respond. No interruptions in the first 90 seconds.`,
      excerpts: [
        {
          scenario: "Interrupted the customer",
          customer: "Mere papa ka hospital expense bahut zyada hua tha, isliye main soch raha hoon…",
          agent: "Sir hamare plan mein critical illness rider hai! 34 bimariyan cover hoti hain!",
          analysis: "Interrupted at 0:08 of a 25-second emotional disclosure. Killed rapport and missed the buying motive.",
          correct:
            "(Listen fully) 'Samajh sakti hoon sir — woh experience bahut tough hota hai. Aap apne family ko aisi situation mein protect karna chahte hain. Iske liye hamare paas exactly woh solution hai…' (then pitch).",
        },
      ],
      altCheat: {
        title: "Active Listening — The PPR Framework",
        intro: "Pause, Paraphrase, Respond. In that order. Every time.",
        rows: [
          { k: "Pause", v: "2-second silence after customer finishes. Don't fill with 'haan sir haan sir'.", tone: "green" },
          { k: "Paraphrase", v: "'Aap keh rahe hain ki…' — confirm you heard the actual concern.", tone: "green" },
          { k: "Respond", v: "Tie your pitch to the paraphrased concern. Not your standard script.", tone: "green" },
          { k: "❌ Never", v: "Interrupt in the first 90 seconds. Even with the 'right' answer.", tone: "mauve" },
        ],
      },
      quiz: [
        { q: "What does PPR stand for?", a: "Pause, Paraphrase, Respond." },
        { q: "How long should the pause after a customer finishes be?", a: "About 2 seconds — long enough to signal you're listening, short enough to keep flow." },
        { q: "Why paraphrase before responding?", a: "Confirms accurate understanding and demonstrates empathy — customer feels heard before sold to." },
      ],
      schedule: [
        { day: "Day 1", what: "PPR framework module (AI)", tone: "green" },
        { day: "Day 2–4", what: "STT flags on every interruption < 90 sec", tone: "green" },
        { day: "Day 5", what: "Assessment + empathy reassess", tone: "amber" },
        { day: "Goal", what: "Zero interruptions in opening 90 sec", tone: "neutral" },
      ],
      closing: (n, g) => `${n}, listening is the most underrated skill on the floor. Target ~${g} CQI points.`,
    },
  },
  {
    key: "compliance",
    match: /compliance|refresher|CAP/i,
    tpl: {
      kind: "cap",
      targetCqiBoost: 8,
      gap: "Compliance — unauthorized commitments and language drift. CAP-level risk.",
      coachNote: (n) =>
        `${n} — this is a compliance-critical plan. Unauthorized promises put the company at IRDAI risk. Complete this refresher, score 85%+, and shadow with your TL for a week before solo calls.`,
      excerpts: [
        {
          scenario: "Unauthorized fee waiver promise",
          customer: "Last year jaisa fee waiver de denge?",
          agent: "Agar aaj renewal kar dete hain to fee waive kar denge — guaranteed.",
          analysis: "Unauthorized commitment. Fee waiver requires manager approval. 'Guaranteed' creates a binding promise.",
          correct:
            "Sir, waiver ke liye manager approval chahiye — main 2 ghante mein confirm karti hoon. Abhi ke liye early renewal pe 7% loyalty discount already applicable hai.",
        },
      ],
      altCheat: {
        title: "Compliance Rules — What You Cannot Say",
        intro: "These phrases trigger IRDAI exposure. Use the approved alternatives.",
        rows: [
          { k: "❌ 'Guaranteed returns'", v: "✓ 'Expected returns based on historical performance. Market-linked, past performance not indicative.'", tone: "mauve" },
          { k: "❌ 'Fee waiver guaranteed'", v: "✓ 'Needs manager approval — I'll confirm in 2 hours.'", tone: "mauve" },
          { k: "❌ 'Tax-free guaranteed'", v: "✓ 'Subject to tax laws as applicable.'", tone: "mauve" },
          { k: "❌ 'Cancel anytime, full refund'", v: "✓ 'Free-look period of 15 days from receipt. Surrender charges apply thereafter.'", tone: "mauve" },
        ],
      },
      quiz: [
        { q: "Customer asks for a fee waiver — what do you do?", a: "Acknowledge → tell them manager approval is needed → commit callback window → offer existing loyalty discount." },
        { q: "Can you say 'guaranteed returns' for a ULIP?", a: "No. ULIPs are market-linked. 'Guaranteed' is mis-selling under IRDAI." },
        { q: "Difference between 'expected' and 'guaranteed' returns?", a: "Expected = projection from past performance. Guaranteed = contractually binding — only for traditional non-linked products." },
      ],
      schedule: [
        { day: "Today", what: "Compliance refresher (mandatory)", tone: "amber" },
        { day: "Tomorrow", what: "Assessment — 85%+ required", tone: "amber" },
        { day: "Week 1", what: "TL shadow on every call", tone: "neutral" },
        { day: "If fail", what: "Escalate to CAP-3 review", tone: "neutral" },
      ],
      closing: (n, g) => `${n}, compliance is non-negotiable. Pass the refresher and you reopen ~${g} CQI points.`,
    },
  },
];

function selectTemplate(note?: string): TopicTemplate {
  if (note) {
    for (const t of TOPIC_TEMPLATES) if (t.match.test(note)) return t.tpl;
  }
  // default — generic skill refresh
  return TOPIC_TEMPLATES.find((t) => t.key === "product")!.tpl;
}

function buildPlanForRoster(r: RosterAgent): { agent: Agent; plan: AgentPlan } {
  const tpl = selectTemplate(r.trainingNote);
  const targetCqi = Math.min(100, Math.round(r.cqi + tpl.targetCqiBoost));
  const firstName = r.name.split(" ")[0];
  const gain = Math.max(2, targetCqi - Math.round(r.cqi));
  const plan: AgentPlan = {
    ...tpl,
    targetCqi,
    coachNote: tpl.coachNote(firstName),
    closing: tpl.closing(firstName, gain),
  };
  const agent = {
    id: `roster-${r.empId}`,
    name: r.name,
    empId: r.empId,
    tl: r.tl,
    score: Math.round((r.cqi / 100) * 83),
    out: 83 as const,
    pct: r.cqi,
    category: r.cat,
    trend: [r.cqi - 2, r.cqi - 1, r.cqi, r.cqi + 0.5, r.cqi],
    primaryGap: r.trainingNote ?? "Skill refresh",
    trainingStatus: r.training,
    callsToday: 0,
    callsWeek: 0,
    dimensions: [],
    todaysCalls: [],
    feedback: { aiPattern: "", strengths: [], improvements: [], actionPlan: "", remarks: [] },
    training: {
      title: r.trainingNote ?? "",
      excerptCustomer: "",
      excerptAgentWrong: "",
      correctResponse: "",
      cheatSheet: { title: "", rows: [] },
      qa: [],
      closingNote: "",
    },
  } as unknown as Agent;
  return { agent, plan };
}

function RosterTrainingPlan({ r }: { r: RosterAgent }) {
  const { agent, plan } = useMemo(() => buildPlanForRoster(r), [r]);
  return <TrainingPlan a={agent} plan={plan} />;
}
