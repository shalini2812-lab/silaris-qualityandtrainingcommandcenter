import type { ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, BarChart3, Mic2 } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Header, Footer } from "./Header";
import { Copilot, type CopilotProps } from "./Copilot";
import { ExecutionPanelProvider } from "./ExecutionPanel";
import { ProcessOverviewView } from "./views/ProcessOverviewView";
import { CallAnalyticsView } from "./views/CallAnalyticsView";
import { VocView } from "./views/VocView";

type TabKey = "overview" | "analytics" | "voc";

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: "overview", label: "Process Overview", icon: LayoutDashboard },
  { key: "analytics", label: "Call Analytics", icon: BarChart3 },
  { key: "voc", label: "Voice of Customer", icon: Mic2 },
];

function useCurrentTab(): TabKey {
  const search = useRouterState({ select: (r) => r.location.search as Record<string, unknown> });
  const t = (search?.tab as string) ?? "overview";
  return (TABS.some((x) => x.key === t) ? t : "overview") as TabKey;
}

function TopTabs() {
  const active = useCurrentTab();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  return (
    <div className="border-b border-border bg-surface-2/40 px-5">
      <nav className="flex items-end gap-1 -mb-px">
        {TABS.map((t) => {
          const isActive = active === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() =>
                navigate({
                  to: path as any,
                  search: (t.key === "overview" ? {} : { tab: t.key }) as any,
                })
              }
              className={[
                "flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-medium border-b-2 transition-colors cursor-pointer",
                isActive
                  ? "border-acc-green text-acc-green"
                  : "border-transparent text-text-secondary hover:text-foreground hover:border-border",
              ].join(" ")}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export function Shell({
  children,
  copilot,
  /** If true, hide the top tabs (for pages that aren't role/overview scoped, e.g. Competition). */
  hideTabs = false,
}: {
  children: ReactNode;
  copilot: CopilotProps;
  hideTabs?: boolean;
}) {
  const tab = useCurrentTab();

  let body: ReactNode = children;
  if (!hideTabs) {
    if (tab === "analytics") body = <CallAnalyticsView />;
    else if (tab === "voc") body = <VocView />;
    // overview => children (role's default dashboard)
  }

  return (
    <ExecutionPanelProvider>
      <div className="h-screen flex bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          {!hideTabs && <TopTabs />}
          <main className="flex-1 overflow-y-auto p-5 min-w-0">
            {body}
          </main>
          <Footer />
        </div>
        <Copilot {...copilot} />
      </div>
    </ExecutionPanelProvider>
  );
}

// Re-export views for convenience
export { ProcessOverviewView, CallAnalyticsView, VocView };

// Reusable UI
export function Card({
  title, right, children, className = "",
}: { title?: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[10px] border border-border bg-card p-5 ${className}`}>
      {(title || right) && (
        <header className="flex items-center justify-between mb-4">
          {title && <h3 className="text-[16px] font-semibold tracking-tight">{title}</h3>}
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

export function SectionTitle({ children, kicker }: { children: ReactNode; kicker?: string }) {
  return (
    <div className="mb-3">
      {kicker && (
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-dim font-medium">{kicker}</div>
      )}
      <h2 className="text-[20px] font-semibold tracking-tight">{children}</h2>
    </div>
  );
}

export function Badge({
  children, tone = "neutral",
}: { children: ReactNode; tone?: "green" | "amber" | "mauve" | "blue" | "sand" | "neutral" | "red" }) {
  const map: Record<string, string> = {
    green: "text-acc-green border-acc-green/40 bg-acc-green/10",
    amber: "text-acc-amber border-acc-amber/40 bg-acc-amber/10",
    mauve: "text-acc-mauve border-acc-mauve/40 bg-acc-mauve/10",
    blue: "text-acc-blue  border-acc-blue/40  bg-acc-blue/10",
    sand: "text-acc-sand  border-acc-sand/40  bg-acc-sand/10",
    red: "text-destructive border-destructive/40 bg-destructive/10",
    neutral: "text-text-secondary border-border bg-secondary",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10.5px] uppercase tracking-wider rounded px-1.5 py-0.5 border ${map[tone]}`}>
      {children}
    </span>
  );
}

export function Kpi({
  label, value, sub, badge, trend,
}: { label: string; value: ReactNode; sub?: string; badge?: { text: string; tone: "green" | "amber" | "blue" | "mauve" | "sand" | "red" }; trend?: string }) {
  return (
    <div className="rounded-[10px] border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-[12px] uppercase tracking-[0.12em] text-dim font-medium">{label}</div>
        {badge && <Badge tone={badge.tone}>{badge.text}</Badge>}
      </div>
      <div className="mt-2 font-mono text-[32px] leading-none text-foreground">{value}</div>
      {sub && <div className="mt-2 text-[12.5px] text-text-secondary">{sub}</div>}
      {trend && <div className="mt-1 text-[12px] text-acc-green">{trend}</div>}
    </div>
  );
}

export function CatBadge({ cat }: { cat: "A" | "B" | "C" }) {
  const tone = cat === "A" ? "green" : cat === "B" ? "blue" : "sand";
  return <Badge tone={tone as any}>Cat {cat}</Badge>;
}
