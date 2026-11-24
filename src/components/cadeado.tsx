import { ESPADAS } from "@/lib/naipes";

// The pre-sale padlock: polished brass with the house spade as the keyhole. The shackle (.cadeado-arco) lifts when
// a parent gets the `abrindo` class (see globals.css). `id` names the brass gradient: two padlocks can share a page
// (the hidden entry veil is in the layout), and a gradient inside a hidden element paints nothing.
// Owners, 2026-11-23: a richer, warmer gold and no inner rim (the pale brass looked washed out on the wine); the spade is
// cut in the wine of the background (#39000F, .feltro).
export function Cadeado({ id, className = "" }: { id: string; className?: string }) {
  return <svg viewBox="0 0 120 160" aria-hidden className={`cadeado overflow-visible ${className}`}>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#E3BE6B" />
        <stop offset=".4" stopColor="#D0A24D" />
        <stop offset=".72" stopColor="#B4853A" />
        <stop offset="1" stopColor="#D3A958" />
      </linearGradient>
    </defs>
    <path className="cadeado-arco" d="M32 76 V48 a28 28 0 0 1 56 0 V76" fill="none" stroke={`url(#${id})`} strokeWidth={11} />
    <rect x="12" y="70" width="96" height="84" rx="14" fill={`url(#${id})`} />
    <path d={ESPADAS} transform="translate(46 97) scale(.28)" fill="#39000F" />
  </svg>;
}
