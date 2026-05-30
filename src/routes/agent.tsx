import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell,
} from "recharts";
import { X, FileText, GraduationCap, TrendingUp, Search, ChevronDown } from "lucide-react";
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
        />
      )}

      {modal && selected && (
        <Modal
          onClose={() => setModal(null)}
          title={modal === "feedback" ? "CALL QUALITY MONITORING SHEET" : "Personalized Training Plan"}
          subtitle={modal === "feedback" ? "Outbound Insurance Sales · BPO Operations · AI-Enhanced Review" : undefined}
          wide={modal === "feedback"}
        >
          {modal === "feedback"
            ? <FeedbackSheet roster={selected} keyAgent={keyAgent} />
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
  roster, keyAgent, onClose, onOpenFeedback, onOpenTraining,
}: {
  roster: RosterAgent;
  keyAgent: Agent | null;
  onClose: () => void;
  onOpenFeedback: () => void;
  onOpenTraining: () => void;
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
            />
          )}
          {tab === "rebuttals" && <RebuttalsTab roster={roster} keyAgent={keyAgent} />}
          {tab === "training" && (
            keyAgent
              ? <TrainingPlan a={keyAgent} />
              : <GenericTraining r={roster} />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Overview tab ----------
function OverviewTab({
  roster, keyAgent, trend, dims, calls, onOpenFeedback, onOpenTraining,
}: {
  roster: RosterAgent;
  keyAgent: Agent | null;
  trend: number[];
  dims: Agent["dimensions"];
  calls: Agent["todaysCalls"];
  onOpenFeedback: () => void;
  onOpenTraining: () => void;
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
      <div className="space-y-3">
        {sections.map((sec) => {
          const secScore = sec.params.reduce((a, p) => a + p.score, 0);
          return (
            <div key={sec.letter} className="rounded-md border border-border overflow-hidden">
              <div className="flex items-center justify-between bg-surface-2 px-3 py-2 border-b border-border">
                <div className="text-[13px] font-semibold">
                  <span className="font-mono text-acc-blue mr-2">Section {sec.letter}</span>
                  {sec.title}
                </div>
                <div className={`font-mono text-[13px] ${scoreClass(secScore, sec.max)}`}>{secScore} / {sec.max}</div>
              </div>
              <table className="w-full text-[12.5px]">
                <thead className="text-dim text-[10.5px] uppercase tracking-wider">
                  <tr className="border-b border-border">
                    <th className="text-left py-1.5 px-3 w-10 font-medium">#</th>
                    <th className="text-left py-1.5 px-3 font-medium">Parameter</th>
                    <th className="text-right py-1.5 px-3 w-14 font-medium">Max</th>
                    <th className="text-right py-1.5 px-3 w-16 font-medium">Score</th>
                    <th className="text-left py-1.5 px-3 font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {sec.params.map((p) => (
                    <tr key={p.n} className="border-t border-border/60">
                      <td className="py-1.5 px-3 font-mono text-dim">{p.n}</td>
                      <td className="py-1.5 px-3">{p.name}</td>
                      <td className="py-1.5 px-3 text-right font-mono text-text-secondary">{p.max}</td>
                      <td className={`py-1.5 px-3 text-right font-mono ${scoreClass(p.score, p.max)}`}>{p.score}</td>
                      <td className="py-1.5 px-3 text-text-secondary">{p.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
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
            <CatBadge cat={rating} />
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
          <li>{actionPlan}</li>
          <li>STT live-monitors every call for the next 5 working days; deviation triggers real-time nudge.</li>
          <li>Day 5 assessment auto-scheduled — pre vs post CQI delta reported to TL ({roster.tl}) and QA Manager.</li>
          <li>If no improvement after 5 days, escalate to classroom training with Trainer + TL shadowing.</li>
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
