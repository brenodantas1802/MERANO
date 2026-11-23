import type { ReactNode } from "react";

// The headline rises in line by line with a CSS animation (globals.css, .revela): it runs as soon as the page paints,
// without waiting for the page's JavaScript, and only animates opacity and position (cheap on any phone).
export function HeroTextReveal({ lines, className }: { lines: ReactNode[]; className?: string }) {
  return (
    <h1 className={className}>
      {lines.map((line, index) => <span key={index} className="revela block" style={{ animationDelay: `${index * 0.1}s` }}>{line}</span>)}
    </h1>
  );
}
