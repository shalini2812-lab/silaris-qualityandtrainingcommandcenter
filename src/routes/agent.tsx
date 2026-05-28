import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell,
} from "recharts";
import { X, FileText, GraduationCap, TrendingUp } from "lucide-react";
import { Shell, Card, SectionTitle, Badge, CatBadge, Kpi } from "@/components/silaris/Shell";
import { AGENTS, type Agent } from "@/lib/silaris-data";

export const Route = createFileRoute("/agent")({
  head: () => ({ meta: [{ title: "Agent · My Dashboard · Silaris" }] }),
  component: AgentView,
});

function AgentView() {
  const [selectedId, setSelectedId] = useState(AGENTS[0].id);
  const [modal, setModal] = useState<null | "feedback" | "training">(null);
  const agent = AGENTS.find((a) => a.id === selectedId)!;

  return (
    <Shell
      copilot={{
        summary: `${agent.name}: ${agent.primaryGap}`,
        working: agent.feedback.strengths.slice(0, 3),
        attention: agent.feedback.improvements.slice(0, 3),
        suggestions: [
          { title: "Open today's coaching card", detail: agent.training.title },
          { title: "Schedule 1:1 with TL", detail: `${agent.tl} · 15 min review` },
        ],
      }}
    >
      <SectionTitle kicker="Operations · Agent">My Dashboard</SectionTitle>

      {/* Agent selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 mb-5">
        {AGENTS.map((a) => {
          const active = a.id === selectedId;
          const toneBorder =
            a.category === "A" ? "border-acc-green/40"
            : a.category === "B" ? "border-acc-blue/40"
            : "border-acc-sand/40";
          return (
            <button
              key={a.id}
              onClick={() => setSelectedId(a.id)}
              className={`text-left rounded-md border p-3 transition-colors ${
                active
                  ? "border-acc-green bg-acc-green/10"
                  : `${toneBorder} bg-surface-2 hover:bg-secondary`
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-[13.5px] font-medium truncate">{a.name}</div>
                <CatBadge cat={a.category} />
              </div>
              <div className="mt-1 font-mono text-[18px]">{a.pct}%</div>
              <div className="text-[11px] text-dim">{a.empId} · TL {a.tl}</div>
              {a.capStatus && <div className="text-[11px] text-acc-sand mt-1">{a.capStatus}</div>}
            </button>
          );
        })}
      </div>

      {/* KPIs + trend */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <Kpi label="My CQI Today" value={`${agent.pct}%`} sub={`${agent.score} / ${agent.out}`} badge={{ text: `Cat ${agent.category}`, tone: agent.category === "A" ? "green" : agent.category === "B" ? "blue" : "sand" }} />
        <Kpi label="Calls Today" value={agent.callsToday} sub={`${agent.callsWeek} this week`} />
        <Kpi label="Status" value={agent.capStatus ?? "Active"} sub={agent.trainingStatus} badge={agent.capStatus ? { text: agent.capStatus, tone: "amber" } : undefined} />
        <Card title="4-Week Trend">
          <div className="h-[80px]">
            <ResponsiveContainer>
              <LineChart data={agent.trend.map((v, i) => ({ w: `W${i + 1}`, v }))}>
                <XAxis dataKey="w" stroke="#5a6a82" tick={{ fontSize: 10 }} />
                <YAxis domain={["dataMin-3", "dataMax+3"]} hide />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="v" stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: "#34d399" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
        <Card title="My Calls Today" className="xl:col-span-2">
          <table className="w-full text-[13px]">
            <thead className="text-dim text-[11px] uppercase tracking-wider">
              <tr>
                <th className="text-left py-2 font-medium">Call ID</th>
                <th className="text-left py-2 font-medium">Duration</th>
                <th className="text-left py-2 font-medium">CQI</th>
                <th className="text-left py-2 font-medium">Status</th>
                <th className="text-left py-2 font-medium">Observation</th>
              </tr>
            </thead>
            <tbody>
              {agent.todaysCalls.map((c) => {
                const rowBg =
                  c.tag === "Clean" ? "" :
                  c.tag === "Non-Fatal" ? "bg-acc-sand/5" :
                  "bg-acc-mauve/10";
                const tone = c.tag === "Clean" ? "green" : c.tag === "Non-Fatal" ? "sand" : "mauve";
                return (
                  <tr key={c.id} className={`border-t border-border ${rowBg}`}>
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

        <Card title="My CQI by Dimension">
          <div className="h-[260px]">
            <ResponsiveContainer>
              <BarChart data={agent.dimensions.map((d) => ({ ...d, pct: Math.round((d.score / d.max) * 100) }))} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid stroke="#1c2940" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 10 }} unit="%" />
                <YAxis type="category" dataKey="code" stroke="#94a3b8" tick={{ fontSize: 11 }} width={32} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} formatter={(v: any, _n, p: any) => [`${v}% (${p.payload.score}/${p.payload.max})`, p.payload.name]} />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                  {agent.dimensions.map((d, i) => {
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

      <Card title="My Training Status">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[280px]">
            <div className="text-[13px] text-text-secondary">Identified Gap</div>
            <div className="text-[15px] font-medium mt-0.5">{agent.primaryGap}</div>
            {agent.secondaryGap && (
              <div className="text-[12.5px] text-text-secondary mt-1">Secondary: {agent.secondaryGap}</div>
            )}
            <div className="mt-3 text-[13px]">
              <span className="text-dim">Status:</span>{" "}
              <span className={agent.trainingStatus.includes("Escalated") ? "text-acc-sand" : "text-acc-green"}>
                {agent.trainingStatus}
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setModal("feedback")}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3.5 py-2 text-[13px] hover:border-acc-blue/40"
            >
              <FileText className="size-4 text-acc-blue" /> View Full Feedback Sheet
            </button>
            <button
              onClick={() => setModal("training")}
              className="inline-flex items-center gap-2 rounded-md border border-acc-green/40 bg-acc-green/10 px-3.5 py-2 text-[13px] text-acc-green hover:bg-acc-green/20"
            >
              <GraduationCap className="size-4" />
              {agent.id === "anita" ? "No Training Plan — STAR Performer" : "View Training Plan"}
            </button>
          </div>
        </div>
      </Card>

      {modal && (
        <Modal onClose={() => setModal(null)} title={modal === "feedback" ? "CQI Feedback Sheet" : "Personalized Training Plan"}>
          {modal === "feedback" ? <FeedbackSheet a={agent} /> : <TrainingPlan a={agent} />}
        </Modal>
      )}
    </Shell>
  );
}

function Modal({ children, onClose, title }: { children: any; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex">
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
