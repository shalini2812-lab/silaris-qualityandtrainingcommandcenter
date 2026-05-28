import { Sparkles, Check, AlertTriangle, MessageSquare } from "lucide-react";
import { useExecutionPanel } from "./ExecutionPanel";

export interface CopilotProps {
  working: string[];
  attention: string[];
  suggestions: { title: string; detail: string; action?: "Approve" | "Review" }[];
  summary?: string;
}

export function Copilot({ working, attention, suggestions, summary }: CopilotProps) {
  return (
    <aside className="w-[310px] shrink-0 border-l border-border bg-surface-2 flex flex-col">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Sparkles className="size-4 text-acc-green" />
        <div className="font-semibold text-[14px]">Silaris Co-Pilot</div>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-acc-green border border-acc-green/40 bg-acc-green/10 rounded px-1.5 py-0.5">
          <span className="size-1.5 rounded-full bg-acc-green live-dot" /> Live
        </span>
      </div>

      <div className="overflow-y-auto p-4 space-y-4 flex-1">
        {summary && (
          <div className="text-[12.5px] text-foreground/85 leading-relaxed bg-surface border border-border rounded-md p-3">
            {summary}
          </div>
        )}

        <Section title="What's Working" tone="green" icon={<Check className="size-3.5" />}>
          {working.map((w, i) => (
            <Item key={i} dotClass="bg-acc-green">{w}</Item>
          ))}
        </Section>

        <Section title="Needs Attention" tone="amber" icon={<AlertTriangle className="size-3.5" />}>
          {attention.map((w, i) => (
            <Item key={i} dotClass="bg-acc-sand">{w}</Item>
          ))}
        </Section>

        <div>
          <div className="text-[10.5px] uppercase tracking-[0.12em] text-dim mb-2 font-medium">AI Suggestions</div>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <div key={i} className="rounded-md border border-border bg-surface p-3">
                <div className="text-[13px] font-medium">{s.title}</div>
                <div className="text-[12px] text-text-secondary mt-1 leading-snug">{s.detail}</div>
                <div className="mt-2 flex gap-2">
                  <button className="text-[11px] px-2.5 py-1 rounded bg-acc-green/15 text-acc-green border border-acc-green/30 hover:bg-acc-green/25">
                    Approve
                  </button>
                  <button className="text-[11px] px-2.5 py-1 rounded bg-secondary text-foreground/85 border border-border hover:border-acc-blue/40">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
          <MessageSquare className="size-4 text-dim" />
          <input
            placeholder="Ask me anything…"
            className="bg-transparent text-[13px] flex-1 outline-none placeholder:text-dim"
          />
        </div>
      </div>
    </aside>
  );
}

function Section({
  title, icon, tone, children,
}: { title: string; icon: any; tone: "green" | "amber"; children: any }) {
  const color = tone === "green" ? "text-acc-green" : "text-acc-sand";
  return (
    <div>
      <div className={`flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.12em] mb-2 font-medium ${color}`}>
        {icon}{title}
      </div>
      <ul className="space-y-1.5">{children}</ul>
    </div>
  );
}

function Item({ children, dotClass }: { children: any; dotClass: string }) {
  return (
    <li className="flex gap-2 text-[12.5px] text-foreground/85 leading-snug">
      <span className={`size-1.5 rounded-full mt-1.5 shrink-0 ${dotClass}`} />
      <span>{children}</span>
    </li>
  );
}
