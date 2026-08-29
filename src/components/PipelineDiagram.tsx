const STAGES = [
  "Ingestion",
  "Feature Extraction",
  "World Model",
  "K-Step Rollout",
  "MITRE Mapping",
  "Explainability",
  "Dashboard",
];

const NODE_WIDTH = 150;
const NODE_HEIGHT = 56;
const GAP = 56;
const NODE_Y = 60;

export function PipelineDiagram() {
  const totalWidth = STAGES.length * NODE_WIDTH + (STAGES.length - 1) * GAP;
  const viewHeight = 180;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${totalWidth} ${viewHeight}`}
        width="100%"
        height={viewHeight}
        style={{ minWidth: 720 }}
        role="img"
        aria-label="Pipeline: Ingestion, Feature Extraction, World Model, K-Step Rollout, MITRE Mapping, Explainability, Dashboard"
      >
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-border)" />
          </marker>
        </defs>

        {STAGES.map((stage, i) => {
          const x = i * (NODE_WIDTH + GAP);
          const isLast = i === STAGES.length - 1;
          const isModel = stage === "World Model";

          return (
            <g key={stage}>
              <rect
                x={x}
                y={NODE_Y}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={8}
                fill="var(--color-panel)"
                stroke={isModel ? "var(--color-accent)" : "var(--color-border)"}
                strokeWidth={isModel ? 1.5 : 1}
              />
              <text
                x={x + NODE_WIDTH / 2}
                y={NODE_Y + NODE_HEIGHT / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isModel ? "var(--color-accent)" : "var(--color-text-primary)"}
                fontSize="12"
                fontFamily="var(--font-sans)"
                fontWeight={isModel ? 600 : 500}
              >
                {stage}
              </text>
              <text
                x={x + NODE_WIDTH / 2}
                y={NODE_Y - 12}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                fontSize="10"
                fontFamily="var(--font-mono)"
              >
                {String(i + 1).padStart(2, "0")}
              </text>

              {!isLast && (
                <>
                  <line
                    x1={x + NODE_WIDTH}
                    y1={NODE_Y + NODE_HEIGHT / 2}
                    x2={x + NODE_WIDTH + GAP}
                    y2={NODE_Y + NODE_HEIGHT / 2}
                    stroke="var(--color-border)"
                    strokeWidth={1.5}
                    markerEnd="url(#arrowhead)"
                  />
                  <circle r={3} fill="var(--color-accent)">
                    <animateMotion
                      dur="2.4s"
                      begin={`${i * 0.35}s`}
                      repeatCount="indefinite"
                      path={`M${x + NODE_WIDTH},${NODE_Y + NODE_HEIGHT / 2} L${x + NODE_WIDTH + GAP},${NODE_Y + NODE_HEIGHT / 2}`}
                    />
                  </circle>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
