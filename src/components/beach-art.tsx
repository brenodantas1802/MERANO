// Coloured, hand-drawn-looking beach illustrations for pages without beach photography.
// Pure SVG + CSS animation (see .wave-drift / .bob in globals.css), so they cost no JS.

const SEA = { foam: "#CFE7EC", light: "#8CC5D6", mid: "#4F97B3", deep: "#2C6A86" };
const SAND = "#EBD6B0";
const CORAL = "#E0795A";
const INK = "var(--ink)";

// Layered waves drifting sideways. The front layer is painted in `into` so the water blends into whatever
// comes next (the page background or the footer). Each path repeats every 360 units, so sliding by half loops.
function waveRow(amplitude: number, base: number) {
  let d = `M0 ${base}`;
  for (let x = 0; x < 2880; x += 360) d += ` Q${x + 90} ${base - amplitude} ${x + 180} ${base} T${x + 360} ${base}`;
  return `${d} V120 H0 Z`;
}

export function SeaWaves({ into = "var(--paper)", className = "" }: { into?: string; className?: string }) {
  const layers = [
    { d: waveRow(14, 40), fill: SEA.light, speed: "wave-drift-slow" },
    { d: waveRow(18, 58), fill: SEA.mid, speed: "wave-drift-reverse" },
    { d: waveRow(12, 78), fill: SEA.foam, speed: "wave-drift" },
    { d: waveRow(10, 92), fill: into, speed: "wave-drift-slow" },
  ];
  return <div aria-hidden className={`relative h-20 overflow-hidden md:h-28 ${className}`}>
    {layers.map((layer, index) => <svg key={index} viewBox="0 0 2880 120" preserveAspectRatio="none" className={`absolute inset-y-0 left-0 h-full w-[200%] ${layer.speed}`}><path d={layer.d} fill={layer.fill} /></svg>)}
  </div>;
}

export type BeachScene = "sunset" | "umbrella" | "boat" | "shell" | "starfish" | "bottle";

function Sunset() {
  return <svg viewBox="0 0 240 160">
    <circle cx="120" cy="96" r="44" fill="var(--sol-2)" />
    <circle cx="120" cy="96" r="30" fill="var(--sol-1)" />
    <path d="M0 96 H240 V160 H0 Z" fill={SEA.mid} />
    <path d="M0 96 H240" stroke={INK} strokeWidth="1.5" />
    <path d="M92 108 h56 M100 118 h40 M108 128 h24" stroke="var(--sol-2)" strokeWidth="3" strokeLinecap="round" />
    <path d="M14 120 q10 -6 20 0 t20 0 M170 132 q10 -6 20 0 t20 0 M30 146 q10 -6 20 0 t20 0" stroke={SEA.foam} strokeWidth="2" fill="none" strokeLinecap="round" />
    <g className="bob">
      <path d="M176 92 h36 l-6 8 h-24 z" fill={CORAL} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M193 90 V56 L178 88 Z" fill="var(--creme)" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M196 88 V62 L208 88 Z" fill="var(--creme)" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
    </g>
    <path d="M40 40 q6 -5 12 0 q6 -5 12 0 M62 26 q4 -4 8 0 q4 -4 8 0" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
  </svg>;
}

function Umbrella() {
  return <svg viewBox="0 0 240 160">
    <path d="M0 104 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 V132 H0 Z" fill={SEA.light} />
    <path d="M0 132 Q120 110 240 132 V160 H0 Z" fill={SAND} stroke={INK} strokeWidth="1.5" />
    <path d="M118 150 L134 58" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    <path d="M72 76 Q126 12 192 62 Q176 58 164 68 Q150 58 136 66 Q120 58 106 70 Q90 64 72 76 Z" fill="var(--sol-1)" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M106 70 Q112 38 134 30 Q126 50 136 66 Q120 58 106 70 Z" fill="var(--creme)" />
    <path d="M164 68 Q160 40 134 30 Q152 42 164 68 Z" fill="var(--creme)" />
    <path d="M150 146 l36 -8 l6 12 l-36 8 z" fill={SEA.deep} stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M160 144 l4 10 M172 141 l4 10" stroke="var(--creme)" strokeWidth="2" />
    <path d="M52 146 l3 -7 l3 7 l7 1 l-5 4 l2 7 l-7 -4 l-6 4 l2 -7 l-5 -4 z" fill="var(--sol-2)" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
    <circle cx="206" cy="30" r="12" fill="var(--sol-2)" />
  </svg>;
}

function Boat() {
  return <svg viewBox="0 0 200 150">
    <circle cx="150" cy="40" r="18" fill="var(--sol-2)" />
    <g className="bob">
      <path d="M44 104 h112 l-16 20 h-80 z" fill={CORAL} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M58 110 h84" stroke="var(--creme)" strokeWidth="3" />
      <path d="M98 100 V28" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <path d="M96 32 Q70 64 62 98 H96 Z" fill="var(--creme)" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M101 40 Q124 66 132 98 H101 Z" fill="var(--sol-1)" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M98 28 l16 5 l-16 5" fill={SEA.deep} />
    </g>
    <path d="M0 122 q12.5 -10 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 V150 H0 Z" fill={SEA.mid} />
    <path d="M0 132 q12.5 -8 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 V150 H0 Z" fill={SEA.deep} />
  </svg>;
}

function Shell() {
  return <svg viewBox="0 0 140 130">
    <path d="M70 114 C26 110 10 74 18 48 C30 14 110 14 122 48 C130 74 114 110 70 114 Z" fill="#F4CDB6" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    {[26, 40, 55, 70, 85, 100, 114].map((x) => <path key={x} d={`M70 112 Q${(70 + x) / 2} 70 ${x} ${x === 70 ? 24 : 34 + Math.abs(70 - x) / 3}`} stroke={CORAL} strokeWidth="1.6" fill="none" strokeLinecap="round" />)}
    <path d="M56 112 h28 l-5 10 h-18 z" fill={CORAL} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="112" cy="18" r="3" fill={SEA.light} /><circle cx="124" cy="30" r="2" fill={SEA.light} /><circle cx="20" cy="24" r="2.5" fill={SEA.light} />
  </svg>;
}

function Starfish() {
  return <svg viewBox="0 0 130 130">
    <path d="M65 12 C70 34 74 44 92 48 C112 52 116 54 100 68 C88 78 88 86 94 108 C98 122 92 122 80 110 C70 100 60 100 50 110 C38 122 32 122 36 108 C42 86 42 78 30 68 C14 54 18 52 38 48 C56 44 60 34 65 12 Z" fill="var(--sol-1)" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    {[[65, 40], [65, 62], [84, 60], [46, 60], [76, 84], [54, 84]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="var(--sol-2)" />)}
  </svg>;
}

function Bottle() {
  return <svg viewBox="0 0 200 150">
    <g className="bob">
      <g transform="rotate(-18 100 80)">
        <rect x="58" y="62" width="84" height="36" rx="16" fill={SEA.foam} fillOpacity="0.85" stroke={INK} strokeWidth="1.6" />
        <rect x="140" y="72" width="20" height="16" rx="4" fill={SEA.foam} stroke={INK} strokeWidth="1.4" />
        <rect x="158" y="73" width="10" height="14" rx="3" fill="#C49A6C" stroke={INK} strokeWidth="1.3" />
        <rect x="72" y="70" width="52" height="20" rx="4" fill="var(--creme)" stroke={INK} strokeWidth="1.2" />
        <path d="M80 77 h34 M80 83 h24" stroke={CORAL} strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </g>
    <path d="M0 108 q12.5 -10 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 V150 H0 Z" fill={SEA.light} fillOpacity="0.9" />
    <path d="M0 122 q12.5 -8 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 V150 H0 Z" fill={SEA.mid} />
  </svg>;
}

const SCENES: Record<BeachScene, () => React.JSX.Element> = { sunset: Sunset, umbrella: Umbrella, boat: Boat, shell: Shell, starfish: Starfish, bottle: Bottle };

// Scenes with open water get soft edges so they don't read as a pasted rectangle; the sunset becomes a round medallion.
const FRAMES: Partial<Record<BeachScene, string>> = {
  sunset: "aspect-square overflow-hidden rounded-full bg-[#FBE6CC] [&>svg]:scale-[1.35] [&>svg]:translate-y-[6%]",
  umbrella: "[mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]",
  boat: "[mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]",
  bottle: "[mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]",
};

export function BeachArt({ scene, className = "" }: { scene: BeachScene; className?: string }) {
  const Scene = SCENES[scene];
  return <div aria-hidden className={`[&>svg]:h-full [&>svg]:w-full ${FRAMES[scene] ?? ""} ${className}`}><Scene /></div>;
}
