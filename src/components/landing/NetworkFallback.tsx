import { createNetwork } from "./networkModel";
const model = createNetwork(40);
export function NetworkFallback() {
  return (
    <div className="network-fallback" aria-hidden="true">
      <svg viewBox="0 0 1000 800">
        <defs>
          <radialGradient id="node-glow">
            <stop stopColor="#b9ffd0" />
            <stop offset=".2" stopColor="#b9ffd0" stopOpacity=".8" />
            <stop offset="1" stopColor="#80d49c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse
          cx="550"
          cy="400"
          rx="320"
          ry="270"
          fill="none"
          stroke="#a4b4ac"
          strokeOpacity=".12"
        />
        {model.pairs.map(([a, b], i) => (
          <line
            key={i}
            x1={550 + model.nodes[a][0] * 65}
            y1={400 + model.nodes[a][1] * 65}
            x2={550 + model.nodes[b][0] * 65}
            y2={400 + model.nodes[b][1] * 65}
            stroke="#a1d1b4"
            strokeOpacity=".2"
          />
        ))}
        {model.nodes.map(([x, y], i) => (
          <g key={i}>
            <circle
              cx={550 + x * 65}
              cy={400 + y * 65}
              r="14"
              fill="url(#node-glow)"
            />
            <circle
              cx={550 + x * 65}
              cy={400 + y * 65}
              r="2"
              fill={i % 7 === 0 ? "#b9ffd0" : "#e2e8e3"}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
