import { createFileRoute } from "@tanstack/react-router";
import { Shell, Card, SectionTitle, Kpi } from "@/components/silaris/Shell";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { PROCESS_COMPARE } from "@/lib/silaris-data";

export const Route = createFileRoute("/manager")({
  head: () => ({ meta: [{ title: "Manager · Silaris" }] }),
  component: Manager,
});

function Manager() {
  return (
    <Shell copilot={{
      summary: "Process owner view for Savings. CQI 87.1%. Training pipeline healthy. 1 escalation pending sign-off.",
      working: ["WoW +1.8 pp", "Training ROI 7×", "Fatal rate at record low"],
      attention: ["Manish Verma classroom escalation awaiting approval", "Q2 hiring plan due"],
      suggestions: [
        { title: "Approve classroom escalation", detail: "Manish Verma · 2-week intensive" },
        { title: "Share weekly digest", detail: "Auto-PDF to AVP every Monday" },
      ],
    }}>
      <SectionTitle kicker="Operations · Manager">Process Manager — Savings</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <Kpi label="Process CQI" value="87.1%" sub="Savings" badge={{ text: "On Track", tone: "green" }} />
        <Kpi label="Agents" value="100" sub="6 TLs · 1 AM" />
        <Kpi label="Conversion" value="9.0%" sub="+0.4 pp WoW" badge={{ text: "Improving", tone: "green" }} />
        <Kpi label="Open Escalations" value="1" sub="Awaiting sign-off" badge={{ text: "Action", tone: "amber" }} />
      </div>

      <Card title="Process Comparison">
        <div className="h-[260px]">
          <ResponsiveContainer>
            <BarChart data={PROCESS_COMPARE}>
              <CartesianGrid stroke="#1c2940" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[80, 95]} unit="%" />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1c2940", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="cqi" radius={[4, 4, 0, 0]}>
                {PROCESS_COMPARE.map((p, i) => (
                  <Cell key={i} fill={p.name === "Savings" ? "#34d399" : "#7ba4cc"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </Shell>
  );
}
