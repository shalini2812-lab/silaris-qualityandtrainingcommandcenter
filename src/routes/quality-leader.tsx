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
