import { Link, useRouterState } from "@tanstack/react-router";
import {
  User, Users, UserCog, Briefcase, ShieldCheck,
  GraduationCap, BookOpen, Crown, Swords,
} from "lucide-react";

interface NavItem { to: string; icon: any; name: string; sub: string }
interface Section { label: string; items: NavItem[] }

const SECTIONS: Section[] = [
  {
    label: "Operations", items: [
      { to: "/agent", icon: User, name: "Agent", sub: "My Dashboard" },
      { to: "/team-leader", icon: Users, name: "Team Leader", sub: "My Team" },
      { to: "/assistant-manager", icon: UserCog, name: "Assistant Manager", sub: "Span of TLs" },
      { to: "/manager", icon: Briefcase, name: "Manager", sub: "Process View" },
    ],
  },
  {
    label: "Quality", items: [
      { to: "/quality-leader", icon: ShieldCheck, name: "Quality Leader", sub: "Calibration & Audits" },
    ],
  },
  {
    label: "Training", items: [
      { to: "/training-lead", icon: GraduationCap, name: "Training Lead", sub: "TNA & Plans" },
      { to: "/training-manager", icon: BookOpen, name: "Training Manager", sub: "Effectiveness" },
    ],
  },
  {
    label: "Leadership", items: [
      { to: "/avp", icon: Crown, name: "AVP & Above", sub: "Executive KPIs" },
    ],
  },
  {
    label: "Analytics", items: [
      { to: "/competition", icon: Swords, name: "Competition Analysis", sub: "Feature-benefit" },
    ],
  },
];

export function Sidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <aside className="w-[260px] shrink-0 border-r border-border bg-surface-2 flex flex-col">
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-md bg-acc-green/15 grid place-items-center text-acc-green font-bold">S</div>
          <div className="leading-tight">
            <div className="font-semibold text-[15px]">Silaris</div>
            <div className="text-[11px] text-dim uppercase tracking-wider">Agentic AI</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {SECTIONS.map((sec) => (
          <div key={sec.label} className="mb-4">
            <div className="px-4 mb-1.5 text-[10.5px] tracking-[0.12em] text-dim uppercase font-medium">
              {sec.label}
            </div>
            <ul className="px-2 space-y-0.5">
              {sec.items.map((it) => {
                const active = path === it.to || path.startsWith(it.to + "/");
                const Icon = it.icon;
                return (
                  <li key={it.to}>
                    <Link
                      to={it.to}
                      className={[
                        "flex items-start gap-2.5 rounded-md px-2.5 py-2 transition-colors",
                        active
                          ? "bg-acc-green/10 text-acc-green border border-acc-green/30"
                          : "text-foreground/85 hover:bg-secondary border border-transparent",
                      ].join(" ")}
                    >
                      <Icon className="size-4 mt-0.5 shrink-0" />
                      <div className="leading-tight">
                        <div className="text-[13.5px] font-medium">{it.name}</div>
                        <div className="text-[11px] text-dim">{it.sub}</div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
