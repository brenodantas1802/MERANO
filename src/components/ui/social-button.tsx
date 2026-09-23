"use client";

import { IconBrandApple, IconBrandGoogle } from "@tabler/icons-react";
import type { ReactNode } from "react";

const ICONS = { google: IconBrandGoogle, apple: IconBrandApple };

export function SocialButton({ social, children, onClick }: { social: keyof typeof ICONS; children: ReactNode; onClick?: () => void }) {
  const Icon = ICONS[social];
  return (
    <button
      type="button"
      onClick={onClick}
      className="sans flex w-full items-center justify-center gap-3 border border-[var(--line)] bg-[var(--creme)] px-4 py-3 text-[11px] uppercase tracking-[.12em] text-[var(--ink)] transition-colors hover:bg-[var(--cream)]"
    >
      <Icon size={16} strokeWidth={1.5} />
      <span>{children}</span>
    </button>
  );
}
