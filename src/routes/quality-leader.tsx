import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BarChart, Bar, ComposedChart, Line, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { Shell, Card, SectionTitle, Kpi, Badge } from "@/components/silaris/Shell";
import { TOP_DEFECTS, HEATMAP_TEAMS } from "@/lib/silaris-data";

export const Route = createFileRoute("/quality-leader")({
  head: () => ({ meta: [{ title: "Quality Leader · Silaris" }] }),
  component: QLView,
});

const PARAMS = [
  { name: "Opening", pct: 94, target: 95 },
  { name: "T&C", pct: 82, target: 90 },
  { name: "Discovery", pct: 88, target: 88 },
  { name: "Product", pct: 86, target: 88 },
  { name: "Objection", pct: 71, target: 82 },
  { name: "Closing", pct: 78, target: 85 },
  { name: "Compliance", pct: 96, target: 95 },
];

function QLView() {
  let cum = 0;
  const total = TOP_DEFECTS.reduce((s, d) => s + d.pct, 0);
  const pareto = TOP_DEFECTS.map((d) => {
    cum += d.pct;
    return { ...d, cumulative: Math.round((cum / total) * 100) };
  });

  return (
    <Shell
      copilot={{
        summary: "Section C (Objection Handling) is 11 pts below target. AI scripts deployed to 34 agents — early signal +2pp in week 1.",
        working: ["Compliance dimension above target (96 vs 95)", "100% call coverage via STT", "Fatal rate 0.21% — record low"],
        attention: ["Section C trails target by 11 pts", "Cross-TL CQI variance 4.2 pp (Suresh B. low)", "Calibration variance >5% in 2 reviewers"],
        suggestions: [
          { title: "Open calibration session", detail: "Suresh B. team + 2 QAs · variance >5%" },
          { title: "Promote refreshed objection script", detail: "Apply to 34 Cat-B agents process-wide" },
        ],
        extra: <CqiQuickReference />,
      }}
    >
      <SectionTitle kicker="Quality">Quality Leader</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <Kpi label="Process CQI" value="87.1%" sub="Category B · WoW +1.8 pp" badge={{ text: "On Track", tone: "green" }} />
        <Kpi label="STT Coverage" value="100%" sub="1,895 / 1,895 calls" badge={{ text: "Live", tone: "green" }} />
        <Kpi label="Fatal Rate" value="0.21%" sub="4 fatals · all CAP-tracked" badge={{ text: "Improving", tone: "green" }} />
        <Kpi label="CAP Overview" value="4" sub="3 · CAP-1   1 · CAP-2" badge={{ text: "Monitor", tone: "amber" }} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
        <Card title="Quartile Distribution" className="xl:col-span-1">
          {[
            { cat: "A", desc: "≥ 90%", count: 28, mov: "+3 WoW", tone: "green" },
            { cat: "B", desc: "85 – 90%", count: 37, mov: "+2 WoW", tone: "blue" },
            { cat: "C", desc: "< 85%",   count: 35, mov: "−5 WoW", tone: "sand" },
          ].map((c) => (
            <div key={c.cat} className="mb-3 last:mb-0 flex items-center justify-between rounded-md border border-border bg-surface-2 px-4 py-3">
              <div>
                <div className="text-[15px] font-semibold">Category {c.cat}</div>
                <div className="text-[12px] text-dim">{c.desc}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[22px]">{c.count}</div>
                <Badge tone={c.tone as any}>{c.mov}</Badge>
              </div>
            </div>
          ))}
        </Card>

        <Card title="Common Errors — Pareto" className="xl:col-span-2">
          <div className="h-[300px]">
            <ResponsiveContainer>
              <ComposedChart data={pareto} margin={{ bottom: 60 }}>
                <CartesianGrid stroke="#1c2940" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} angle={-22} textAnchor="end" interval={0} height={70} />
                <YAxis yAxisId="L" stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
                <YAxis yAxisId="R" orientation="right" stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
                <Bar yAxisId="L" dataKey="pct" radius={[4, 4, 0, 0]}>
                  {pareto.map((d, i) => (
                    <Cell key={i} fill={d.risk === "High" ? "#d4a574" : d.risk === "Medium" ? "#7ba4cc" : "#a78baf"} />
                  ))}
                </Bar>
                <Line yAxisId="R" type="monotone" dataKey="cumulative" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
        <Card title="TL-Wise CQI Comparison">
          <div className="h-[260px]">
            <ResponsiveContainer>
              <BarChart data={HEATMAP_TEAMS.map((h) => ({ tl: h.tl, cqi: h.weeks[3] }))}>
                <CartesianGrid stroke="#1c2940" vertical={false} />
                <XAxis dataKey="tl" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[60, 100]} unit="%" />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="cqi" radius={[4, 4, 0, 0]}>
                  {HEATMAP_TEAMS.map((h, i) => (
                    <Cell key={i} fill={h.weeks[3] >= 85 ? "#34d399" : h.weeks[3] >= 80 ? "#7ba4cc" : "#d4a574"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Parameter-Level Analysis (vs Target)">
          <div className="h-[260px]">
            <ResponsiveContainer>
              <BarChart data={PARAMS} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid stroke="#1c2940" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} width={84} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                  {PARAMS.map((p, i) => (
                    <Cell key={i} fill={p.pct >= p.target ? "#34d399" : p.pct >= p.target - 5 ? "#7ba4cc" : "#d4a574"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <GradingClassificationCard />

      <Card title="Call Calibration — Latest Session (24 Apr 2026)">
        <div className="grid md:grid-cols-3 gap-3 text-[13px]">
          <NoteCard tone="green" title="Aligned (12 of 15)">
            QA scoring aligned within ±2 pts on 12 audited calls — strong consistency on opening, T&C, and closing parameters.
          </NoteCard>
          <NoteCard tone="amber" title="Variance (2 calls)">
            Variance &gt;5 pts on objection-handling subjective scoring between QA-A and QA-C. Re-calibration scheduled.
          </NoteCard>
          <NoteCard tone="blue" title="Action items">
            Update objection-handling rubric · publish revised mock-calls · re-test all 6 QAs by 02 May.
          </NoteCard>
        </div>
      </Card>
    </Shell>
  );
}

function NoteCard({ tone, title, children }: { tone: "green" | "amber" | "blue"; title: string; children: any }) {
  const cls = tone === "green" ? "border-acc-green/30 bg-acc-green/5"
    : tone === "amber" ? "border-acc-sand/30 bg-acc-sand/5"
    : "border-acc-blue/30 bg-acc-blue/5";
  return (
    <div className={`rounded-md border p-3 ${cls}`}>
      <div className="text-[13px] font-semibold mb-1">{title}</div>
      <div className="text-[12.5px] text-foreground/85 leading-snug">{children}</div>
    </div>
  );
}

// ============================================================
// Grading & Quartile Classification
// ============================================================

const QUARTILE_ROWS: { label: string; top: string; mid: string; low: string; lowMauve?: boolean }[] = [
  { label: "Target Achievement", top: "100%", mid: "90 – 100%", low: "< 90%", lowMauve: true },
  { label: "Login", top: "100%", mid: "100%", low: "100%" },
  { label: "Sales Conversion", top: "100%", mid: "90 – 100%", low: "< 90%", lowMauve: true },
  { label: "NOP (No. of Policies)", top: "100%", mid: "90 – 100%", low: "< 90%", lowMauve: true },
  { label: "Issuance Number", top: "100%", mid: "90 – 100%", low: "< 90%", lowMauve: true },
  { label: ">2 min Call %age", top: "As per Target", mid: "As per Target", low: "< 90%", lowMauve: true },
  { label: "Average Talk Time", top: "3 hours", mid: "3 hours", low: "3 hours" },
  { label: "Quality Score", top: "> 90%", mid: "> 90%", low: "> 90%" },
  { label: "Call Back Adherence", top: "100%", mid: "100%", low: "100%" },
];

function GradingClassificationCard() {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-[10px] border border-border bg-card p-5 mb-5">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-semibold tracking-tight">Agent Grading &amp; Quartile Classification</h3>
          <div className="text-[12px] text-dim mt-0.5">CQI Quality Categories · Overall Quartile · CAP escalation logic</div>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 text-[12.5px] px-3 py-1.5 rounded border border-border text-text-secondary hover:border-acc-green/40 hover:text-acc-green"
        >
          <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
          {open ? "Hide Grading Logic" : "View Grading Logic"}
        </button>
      </header>

      {open && (
        <div className="mt-5 space-y-6">
          {/* SYSTEM 1 */}
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-dim font-medium mb-2">
              System 1 — CQI Quality Categories (from AI call analysis)
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <CatGradeCard tone="green" badge="Category A" thresh="≥ 90% CQI">
                STAR performers. AI monitors consistency.
              </CatGradeCard>
              <CatGradeCard tone="amber" badge="Category B" thresh="85 – 90% CQI">
                On track. AI delivers targeted training.
              </CatGradeCard>
              <CatGradeCard tone="mauve" badge="Category C" thresh="< 85% CQI">
                AI coaching deployed. If no improvement in 5 days → Trainer + TL notified.
              </CatGradeCard>
            </div>
          </div>

          {/* SYSTEM 2 */}
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-dim font-medium mb-2">
              System 2 — Overall Quartile Classification (sales + quality combined)
            </div>
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2.5 px-3 font-medium text-dim text-[11px] uppercase tracking-wider">Particulars</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-acc-green bg-acc-green/10">Top Quartile</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-acc-sand bg-acc-sand/10">Middle Quartile</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-acc-mauve bg-acc-mauve/10">Lower Quartile</th>
                  </tr>
                </thead>
                <tbody>
                  {QUARTILE_ROWS.map((r) => {
                    const isQuality = r.label === "Quality Score";
                    return (
                      <tr key={r.label} className={`border-t border-border ${isQuality ? "bg-acc-green/[0.06]" : ""}`}>
                        <td className={`py-2 px-3 ${isQuality ? "font-semibold" : ""}`}>{r.label}</td>
                        <td className="py-2 px-3 font-mono">{r.top}</td>
                        <td className="py-2 px-3 font-mono">{r.mid}</td>
                        <td className={`py-2 px-3 font-mono ${r.lowMauve ? "text-acc-mauve" : ""}`}>{r.low}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="mt-4 space-y-2 text-[12.5px] text-foreground/85">
              <li className="flex gap-2"><span className="text-acc-green mt-0.5">●</span><span><span className="font-medium">Quality Score &gt; 90% is mandatory across all quartiles.</span> Agents below 90% quality enter AI coaching regardless of sales performance.</span></li>
              <li className="flex gap-2"><span className="text-acc-blue mt-0.5">●</span><span>CQI Category (A/B/C) tracks call quality. Quartile (Top/Middle/Lower) tracks overall performance including sales.</span></li>
              <li className="flex gap-2"><span className="text-acc-sand mt-0.5">●</span><span><span className="font-medium">CAP:</span> CAP-1 (15 days observation) → CAP-2 (15 days intensive) → CAP-3 (Termination consideration)</span></li>
              <li className="flex gap-2"><span className="text-acc-mauve mt-0.5">●</span><span><span className="font-medium">Fatal Error = Zero Tolerance.</span> Call score becomes 0. Agent enters CAP immediately.</span></li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

function CatGradeCard({ tone, badge, thresh, children }: { tone: "green" | "amber" | "mauve"; badge: string; thresh: string; children: any }) {
  const cls =
    tone === "green" ? "border-acc-green/40 bg-acc-green/[0.06]"
    : tone === "amber" ? "border-acc-sand/40 bg-acc-sand/[0.06]"
    : "border-acc-mauve/40 bg-acc-mauve/[0.06]";
  const badgeTone = tone === "green" ? "green" : tone === "amber" ? "sand" : "mauve";
  return (
    <div className={`rounded-md border p-3 ${cls}`}>
      <div className="flex items-center justify-between mb-2">
        <Badge tone={badgeTone as any}>{badge}</Badge>
        <span className="font-mono text-[11.5px] text-text-secondary">{thresh}</span>
      </div>
      <div className="text-[12.5px] text-foreground/85 leading-snug">{children}</div>
    </div>
  );
}

export function CqiQuickReference() {
  return (
    <div className="rounded-md border border-acc-green/30 bg-acc-green/[0.04] p-3">
      <div className="text-[10.5px] uppercase tracking-[0.12em] text-acc-green font-medium mb-2">CQI Grading · Quick Ref</div>
      <ul className="space-y-1.5 text-[11.5px]">
        <li className="flex items-start gap-2">
          <span className="font-mono text-acc-green shrink-0">A · ≥90</span>
          <span className="text-foreground/80">STAR — monitor consistency</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-mono text-acc-sand shrink-0">B · 85-90</span>
          <span className="text-foreground/80">Targeted AI training</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-mono text-acc-mauve shrink-0">C · &lt;85</span>
          <span className="text-foreground/80">AI coaching → Trainer + TL if no lift in 5 days</span>
        </li>
      </ul>
      <div className="mt-2 pt-2 border-t border-acc-green/20 text-[11px] text-text-secondary leading-snug">
        Fatal = 0 score → instant CAP. CAP-1 → CAP-2 → CAP-3.
      </div>
    </div>
  );
}
