export function mockIrn(gstin: string, number: string, fy: string) {
  const raw = `${gstin}|${number}|${fy}|pramaan`;
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hex = (Math.abs(h).toString(16) + Math.abs(h * 13).toString(16) + Math.abs(h * 97).toString(16))
    .padEnd(64, "a1b2c3d4e5f6")
    .slice(0, 64);
  return hex.toLowerCase();
}

export function qrMatrix(payload: string, size = 21) {
  const cells: boolean[][] = [];
  let seed = 7;
  for (let i = 0; i < payload.length; i++) seed = (seed * 33 + payload.charCodeAt(i)) >>> 0;
  for (let y = 0; y < size; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < size; x++) {
      const finder =
        (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
      if (finder) {
        const dx = x < 7 ? x : x >= size - 7 ? x - (size - 7) : x;
        const dy = y < 7 ? y : y >= size - 7 ? y - (size - 7) : y;
        const edge = dx === 0 || dx === 6 || dy === 0 || dy === 6;
        const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        row.push(edge || core);
      } else {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        row.push((seed & 3) !== 0);
      }
    }
    cells.push(row);
  }
  return cells;
}

export function qrSvg(payload: string, px = 120) {
  const size = 21;
  const m = qrMatrix(payload, size);
  const cell = px / size;
  let rects = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (m[y][x]) rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" />`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${px} ${px}" shape-rendering="crispEdges"><rect width="${px}" height="${px}" fill="#fff"/>${rects}</svg>`;
}
