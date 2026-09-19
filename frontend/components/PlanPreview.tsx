import type { FloorPlan } from "@/lib/store";

export default function PlanPreview({ plan }: { plan: FloorPlan }) {
  const points = [...plan.walls.flatMap((w) => [[w.x1, w.y1], [w.x2, w.y2]]), ...plan.furniture.map((f) => [f.x, f.y])];
  const minX = Math.min(0, ...points.map((p) => p[0])) - 30;
  const minY = Math.min(0, ...points.map((p) => p[1])) - 30;
  const maxX = Math.max(500, ...points.map((p) => p[0])) + 30;
  const maxY = Math.max(360, ...points.map((p) => p[1])) + 30;
  return <svg viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} role="img" aria-label="Pratonton pelan ruang" className="w-full max-h-[420px] bg-white rounded-2xl border border-navy-100">
    {plan.walls.map((w) => <line key={w.id} x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} stroke="#1B2B6B" strokeWidth={7} strokeLinecap="round" />)}
    {plan.windows.map((w) => <rect key={w.id} x={w.x - 18} y={w.y - 4} width={36} height={8} fill="#7dd3fc" transform={`rotate(${w.rotation} ${w.x} ${w.y})`} />)}
    {plan.doors.map((d) => <path key={d.id} d={`M${d.x},${d.y} h30 a30,30 0 0 0 -30,-30 z`} fill="#ffedd5" stroke="#ea580c" transform={`rotate(${d.rotation} ${d.x} ${d.y})`} />)}
    {plan.furniture.map((f) => <g key={f.id}><rect x={f.x - 18} y={f.y - 18} width={36} height={36} rx={8} fill="#E8EBFF" /><text x={f.x} y={f.y + 7} textAnchor="middle" fontSize={22}>{f.icon}</text></g>)}
    {plan.roomLabels.map((r) => <text key={r.id} x={r.x} y={r.y} textAnchor="middle" fill="#3547A8" fontSize={12}>{r.type.replaceAll("_", " ")}</text>)}
  </svg>;
}
