import { ChevronDown } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-surface-2/60 backdrop-blur px-5 py-3 flex items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-md bg-foreground/5 border border-border grid place-items-center font-mono text-acc-green text-[12px]">
          AML
        </div>
        <div className="leading-tight">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold">Axis Max Life Insurance</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-acc-green border border-acc-green/40 bg-acc-green/10 rounded px-1.5 py-0.5">
              <span className="size-1.5 rounded-full bg-acc-green live-dot" />
              Live
            </span>
          </div>
          <div className="text-[12px] text-dim">
            Silaris Operations · Quality &amp; Training Intelligence · April 2026
          </div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="text-[11px] text-dim">Process</div>
        <button className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-[13px] hover:border-acc-green/40 transition-colors">
          <span className="font-medium">Savings</span>
          <ChevronDown className="size-3.5 text-dim" />
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border px-5 py-2.5 text-[11px] text-dim flex items-center gap-2 bg-surface-2/40">
      <span className="text-acc-green">◉</span>
      <span>HUMAN-IN-THE-LOOP</span>
      <span className="text-border">·</span>
      <span>100% calls analyzed</span>
      <span className="text-border">·</span>
      <span>Powered by Silaris Agentic AI</span>
    </footer>
  );
}
