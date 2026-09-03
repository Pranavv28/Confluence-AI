import React from "react";

interface RadarChartProps {
  data: {
    name: string;
    score: number;
    benchmark: number;
  }[];
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, size = 320 }) => {
  const center = size / 2;
  const radius = (size - 80) / 2;
  const total = data.length;

  // Convert polar coordinates to Cartesian
  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const distance = (value / 100) * radius;
    const x = center + distance * Math.cos(angle);
    const y = center + distance * Math.sin(angle);
    return { x, y };
  };

  // Generate web background polygons (20%, 40%, 60%, 80%, 100%)
  const levels = [20, 40, 60, 80, 100];
  const levelPolygons = levels.map((level) => {
    const points = data
      .map((_, i) => {
        const { x, y } = getCoordinates(i, level);
        return `${x},${y}`;
      })
      .join(" ");
    return points;
  });

  // Candidate polygon points
  const candidatePoints = data
    .map((item, i) => {
      const { x, y } = getCoordinates(i, item.score);
      return `${x},${y}`;
    })
    .join(" ");

  // Benchmark polygon points
  const benchmarkPoints = data
    .map((item, i) => {
      const { x, y } = getCoordinates(i, item.benchmark);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grids */}
        {levelPolygons.map((points, idx) => (
          <polygon
            key={idx}
            points={points}
            fill="none"
            stroke="#27272A"
            strokeWidth="1"
            strokeDasharray={idx === levels.length - 1 ? "" : "2,2"}
          />
        ))}

        {/* Axis Spokes */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#27272A"
              strokeWidth="1"
            />
          );
        })}

        {/* Benchmark Shape */}
        <polygon
          points={benchmarkPoints}
          fill="rgba(148, 163, 184, 0.1)"
          stroke="#64748B"
          strokeWidth="1.5"
          strokeDasharray="4,4"
        />

        {/* Candidate Score Shape */}
        <polygon
          points={candidatePoints}
          fill="rgba(59, 130, 246, 0.25)"
          stroke="#3B82F6"
          strokeWidth="2.5"
        />

        {/* Vertex Points & Labels */}
        {data.map((item, i) => {
          const { x, y } = getCoordinates(i, item.score);
          const labelCoord = getCoordinates(i, 118);

          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#60A5FA" stroke="#1E3A8A" strokeWidth="2" />
              <text
                x={labelCoord.x}
                y={labelCoord.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] font-semibold fill-zinc-400"
              >
                {item.name}
              </text>
              <text
                x={labelCoord.x}
                y={labelCoord.y + 12}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] font-mono font-bold fill-blue-400"
              >
                {item.score}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-blue-500/40 border border-blue-500" />
          <span>Candidate Score</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-4 bg-zinc-400 border-dashed border-b border-zinc-400" />
          <span>Role Benchmark (75%)</span>
        </div>
      </div>
    </div>
  );
};
