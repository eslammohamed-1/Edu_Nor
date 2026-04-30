/** سلسلة أرقام حتمية من البذرة (بدون Math.random) للرسوم البيانية */
export function seededSeries(length: number, seed: number, max: number, min = 0): number[] {
  const out: number[] = [];
  for (let i = 0; i < length; i++) {
    const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    const n = x - Math.floor(x);
    out.push(min + Math.floor(n * (max - min + 1)));
  }
  return out;
}
