export interface Point {
  x: number;
  y: number;
}

/** Mapeia valores para coordenadas dentro de um viewBox w x h, com margem vertical. */
export const toPoints = (values: number[], w: number, h: number, pad = 8): Point[] => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((v, i) => ({
    x: (i / (values.length - 1)) * w,
    y: pad + (1 - (v - min) / range) * (h - pad * 2),
  }));
};

/** Curva suave (Catmull-Rom convertida para bezier cubico) passando por todos os pontos. */
export const smoothPath = (points: Point[]): string => {
  if (points.length < 2) return '';
  const [first, ...rest] = points;
  let d = `M${first!.x.toFixed(1)},${first!.y.toFixed(1)}`;
  for (let i = 0; i < rest.length; i++) {
    const p0 = points[Math.max(i - 1, 0)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(i + 2, points.length - 1)]!;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
};
