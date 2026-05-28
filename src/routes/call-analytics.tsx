import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Shell, Card, SectionTitle } from "@/components/silaris/Shell";
import { VOLUME_BY_DAY, FATAL_DONUT, SCORE_DISTRIBUTION, CONVERSION, PARAMETER_SCORES, VOC_PAIN } from "@/lib/silaris-data";

export const Route = createFileRoute("/call-analytics")({
  head: () => ({ meta: [{ title: "Call Analytics · Silaris" }] }),
  component: CallAnalytics,
});

function CallAnalytics() {
  return (
    <Shell
      copilot={{
        summary: "1,895 calls analyzed this week — Fri lower volume (309). Objection-handling parameter is the lowest at 71%.",
        working: ["100% STT coverage", "Clean-call share 81%", "Compliance parameter 96%"],
        attention: ["Objection-handling parameter 71%", "Fatal share 1% — 4 calls"],
        suggestions: [
          { title: "Drill objection parameter", detail: "By TL and shift" },
          { title: "Export weekly QC pack", detail: "PDF + raw STT links" },
        ],
      }}
    >
      <SectionTitle kicker="Views">Call Analytics</SectionTitle>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
        <Card title="Call Volume by Day" className="xl:col-span-2">
          <div className="h-[240px]">
            <ResponsiveContainer>
              <BarChart data={VOLUME_BY_DAY}>
                <CartesianGrid stroke="#1c2940" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="calls" radius={[4, 4, 0, 0]} fill="#7ba4cc" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Fatal vs Non-Fatal">
          <div className="h-[200px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={FATAL_DONUT} innerRadius={50} outerRadius={80} dataKey="value" stroke="none" paddingAngle={2}>
                  {FATAL_DONUT.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="text-[12.5px] mt-2 space-y-1">
            {FATAL_DONUT.map((d) => (
              <li key={d.name} className="flex items-center gap-2">
                <span className="size-2 rounded-sm" style={{ background: d.color }} />
                <span className="text-text-secondary">{d.name}</span>
                <span className="ml-auto font-mono">{d.value}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
        <Card title="Score Distribution (by Category)">
          <div className="space-y-2.5">
            {SCORE_DISTRIBUTION.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-[12.5px] mb-1">
                  <span>{s.name}</span><span className="font-mono">{s.pct}%</span>
                </div>
                <div className="h-2 rounded bg-surface-2 overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Converted vs Non-Converted">
          <div className="h-[200px]">
            <ResponsiveContainer>
              <BarChart data={CONVERSION}>
                <CartesianGrid stroke="#1c2940" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="pct" radius={[4, 4, 0, 0]} fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Customer Pain Points">
          <div className="space-y-2">
            {VOC_PAIN.map((p) => (
              <div key={p.name} className="flex items-center gap-3 text-[12.5px]">
                <div className="w-[180px] text-text-secondary truncate">{p.name}</div>
                <div className="flex-1 h-2.5 rounded bg-surface-2 overflow-hidden">
                  <div className="h-full" style={{ width: `${p.pct * 2}%`, background: "#d4a574" }} />
                </div>
                <div className="font-mono w-10 text-right">{p.pct}%</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Parameter Scores">
          <div className="space-y-2">
            {PARAMETER_SCORES.map((p) => (
              <div key={p.name} className="flex items-center gap-3 text-[12.5px]">
                <div className="w-[180px] text-text-secondary truncate">{p.name}</div>
                <div className="flex-1 h-2.5 rounded bg-surface-2 overflow-hidden">
                  <div className="h-full" style={{
                    width: `${p.pct}%`,
                    background: p.pct >= 85 ? "#34d399" : p.pct >= 75 ? "#7ba4cc" : "#d4a574",
                  }} />
                </div>
                <div className="font-mono w-10 text-right">{p.pct}%</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
