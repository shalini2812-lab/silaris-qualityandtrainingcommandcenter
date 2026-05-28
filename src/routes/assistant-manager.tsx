import { createFileRoute } from "@tanstack/react-router";
import { Shell, Card, SectionTitle, Kpi, Badge } from "@/components/silaris/Shell";
import { HEATMAP_TEAMS } from "@/lib/silaris-data";

export const Route = createFileRoute("/assistant-manager")({
  head: () => ({ meta: [{ title: "Assistant Manager · Silaris" }] }),
  component: AM,
});

function AM() {
  return (
    <Shell copilot={{
      summary: "Span of 6 TLs · 100 agents. Pooja S. and Neha A. teams leading; Suresh B. team needs intervention.",
      working: ["4 of 6 TLs improving WoW", "Process CQI +1.8 pp", "Training pipeline healthy (23 active)"],
      attention: ["Suresh B. team trend −3 pp", "Vikram J. team stagnant"],
      suggestions: [
        { title: "Joint coaching for Suresh B.", detail: "Pair with Pooja S. for 1 week" },
        { title: "Skip-level with bottom decile", detail: "10 agents · 15 min each" },
      ],
    }}>
      <SectionTitle kicker="Operations · Assistant Manager">My TLs</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <Kpi label="Span CQI" value="84.8%" sub="6 TLs · 100 agents" badge={{ text: "On Track", tone: "green" }} />
        <Kpi label="TLs Improving" value="4 / 6" sub="WoW basis" />
        <Kpi label="Fatals (Span)" value="4" sub="30-day trailing" badge={{ text: "Review", tone: "amber" }} />
        <Kpi label="CAP Active" value="4" sub="3 CAP-1 · 1 CAP-2" badge={{ text: "Monitor", tone: "amber" }} />
      </div>

      <Card title="TL Leaderboard">
        <table className="w-full text-[13px]">
          <thead className="text-dim text-[11px] uppercase tracking-wider">
            <tr>
              <th className="text-left py-2 font-medium">TL</th>
              <th className="text-right py-2 font-medium">W1</th>
              <th className="text-right py-2 font-medium">W2</th>
              <th className="text-right py-2 font-medium">W3</th>
              <th className="text-right py-2 font-medium">W4</th>
              <th className="text-right py-2 font-medium">Δ</th>
              <th className="text-left py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {HEATMAP_TEAMS.map((t) => {
              const delta = t.weeks[3] - t.weeks[0];
              const tone = delta >= 2 ? "green" : delta <= -2 ? "mauve" : "blue";
              return (
                <tr key={t.tl} className="border-t border-border">
                  <td className="py-2.5">{t.tl}</td>
                  {t.weeks.map((v, i) => <td key={i} className="py-2.5 text-right font-mono">{v}%</td>)}
                  <td className={`py-2.5 text-right font-mono ${delta >= 0 ? "text-acc-green" : "text-acc-mauve"}`}>{delta >= 0 ? "+" : ""}{delta}</td>
                  <td className="py-2.5"><Badge tone={tone as any}>{delta >= 2 ? "Improving" : delta <= -2 ? "Declining" : "Stable"}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}
