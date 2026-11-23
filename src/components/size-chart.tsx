import { MATERIAL, SIZE_CHART, TOLERANCIA_CM, type SizeRow } from "@/lib/products";

const cm = (value: number) => String(value).replace(".", ",");

// The garment's own measurements (Remix regular blank), as the supplier publishes them.
export function SizeChart({ chart = SIZE_CHART }: { chart?: SizeRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="sans w-full min-w-[360px] border-collapse text-left text-xs">
        <thead className="uppercase tracking-[.1em] text-[var(--muted)]">
          <tr className="border-b border-[var(--line)]">
            <th className="py-3">Tamanho</th>
            <th className="py-3">Tórax (cm)</th>
            <th className="py-3">Barra (cm)</th>
            <th className="py-3">Comprimento (cm)</th>
          </tr>
        </thead>
        <tbody>
          {chart.map((row) => (
            <tr key={row.size} className="border-b border-[var(--line)]">
              <td className="py-3 font-medium">{row.size}</td>
              <td className="py-3">{cm(row.largura)}</td>
              <td className="py-3">{cm(row.barra ?? row.largura)}</td>
              <td className="py-3">{cm(row.comprimento)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="sans mt-3 text-[11px] uppercase tracking-[.1em] text-[var(--muted)]">Medidas da peça em centímetros, com ela deitada e plana. Tolerância de {TOLERANCIA_CM} cm para mais ou para menos.</p>
      <p className="sans mt-2 text-[12px] text-[var(--muted)]">{MATERIAL}.</p>
    </div>
  );
}
