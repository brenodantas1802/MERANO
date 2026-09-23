import { SIZE_CHART } from "@/lib/products";

export function SizeChart() {
  return (
    <div className="overflow-x-auto">
      <table className="sans w-full min-w-[420px] border-collapse text-left text-xs">
        <thead className="uppercase tracking-[.1em] text-[var(--muted)]">
          <tr className="border-b border-[var(--line)]">
            <th className="py-3">Tamanho</th>
            <th className="py-3">Largura do busto (cm)</th>
            <th className="py-3">Comprimento (cm)</th>
            <th className="py-3">Ombro a ombro (cm)</th>
          </tr>
        </thead>
        <tbody>
          {SIZE_CHART.map((row) => (
            <tr key={row.size} className="border-b border-[var(--line)]">
              <td className="py-3 font-medium">{row.size}</td>
              <td className="py-3">{row.largura}</td>
              <td className="py-3">{row.comprimento}</td>
              <td className="py-3">{row.ombro}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="sans mt-3 text-[10px] uppercase tracking-[.1em] text-[var(--muted)]">Medidas em centímetros, tiradas com a peça deitada e plana. Margem de 1 a 2 cm entre tamanhos.</p>
    </div>
  );
}
