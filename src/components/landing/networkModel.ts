// Stable positions: the same student constellation appears on every visit.
export function createNetwork(count: number) {
  const nodes: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const angle = i * Math.PI * (3 - Math.sqrt(5));
    const depth = 3.4 + Math.sin(i * 12.78) * 0.8;
    nodes.push([
      Math.cos(angle) * radius * depth,
      y * depth,
      Math.sin(angle) * radius * depth,
    ]);
  }
  // Connect each point to its three closest neighbors, with no duplicate edges.
  const pairs: [number, number][] = [];
  const seen = new Set<string>();
  nodes.forEach((node, i) => {
    const nearest = nodes
      .map((other, j) => ({
        j,
        distance: Math.hypot(...node.map((v, axis) => v - other[axis])),
      }))
      .filter((other) => other.j !== i)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
    nearest.forEach(({ j }) => {
      const key = [Math.min(i, j), Math.max(i, j)].join("-");
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push([i, j]);
      }
    });
  });
  return { nodes, pairs };
}
