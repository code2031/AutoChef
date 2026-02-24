import React, { useState } from 'react';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { generateCookTimeline } from '../lib/groq.js';

const LANE_COLORS = {
  main: { fill: '#f97316', text: '#fff' },
  parallel: { fill: '#3b82f6', text: '#fff' },
};

export default function CookTimeline({ recipe }) {
  const [open, setOpen] = useState(false);
  const [timelineSteps, setTimelineSteps] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoad = async () => {
    if (timelineSteps !== null || isLoading) return;
    setIsLoading(true);
    try {
      const steps = await generateCookTimeline(recipe);
      setTimelineSteps(steps || []);
    } catch {
      setTimelineSteps([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && timelineSteps === null && !isLoading) handleLoad();
  };

  // Compute SVG dimensions
  const getChartData = (steps) => {
    if (!steps || steps.length === 0) return null;
    const totalMin = Math.max(...steps.map(s => (s.startMinute || 0) + (s.durationMinutes || 1)));
    const paddedTotal = totalMin + 2;
    const W = 640;
    const H = 110; // 2 lanes + labels
    const MARGIN_L = 8;
    const MARGIN_R = 40;
    const CHART_W = W - MARGIN_L - MARGIN_R;
    const LANE_H = 28;
    const LANE_GAP = 10;
    const TOP_PAD = 14; // for axis labels

    const toX = (min) => MARGIN_L + (min / paddedTotal) * CHART_W;
    const laneY = (lane) => TOP_PAD + (lane === 1 ? LANE_H + LANE_GAP : 0);

    // Grid lines every 5 mins
    const gridLines = [];
    for (let t = 0; t <= totalMin; t += (totalMin > 30 ? 10 : 5)) {
      gridLines.push(t);
    }

    return { W, H, toX, laneY, LANE_H, gridLines, totalMin, paddedTotal };
  };

  const chartData = timelineSteps ? getChartData(timelineSteps) : null;

  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/2 transition-all"
      >
        <span className="font-semibold text-sm flex items-center gap-2">
          🗂️ Cooking Timeline
          <span className="text-xs text-slate-500 font-normal">See parallel tasks at a glance</span>
        </span>
        {open ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>

      {open && (
        <div className="px-5 pb-5 animate-in fade-in duration-200">
          {isLoading && (
            <div className="flex items-center gap-2 py-6 text-slate-400 text-sm">
              <Loader2 size={16} className="animate-spin text-orange-400" />
              Analyzing cooking steps…
            </div>
          )}

          {!isLoading && timelineSteps && timelineSteps.length === 0 && (
            <p className="text-sm text-slate-500 py-4">Couldn't build timeline for this recipe.</p>
          )}

          {!isLoading && timelineSteps === null && (
            <button
              onClick={handleLoad}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 text-sm rounded-xl transition-all"
            >
              View Cooking Timeline
            </button>
          )}

          {!isLoading && chartData && timelineSteps && timelineSteps.length > 0 && (
            <>
              {/* Legend */}
              <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-orange-500 inline-block" />Main steps
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-500 inline-block" />Parallel / meanwhile
                </span>
                <span className="ml-auto text-slate-600">Total: {chartData.totalMin} min</span>
              </div>

              {/* SVG chart */}
              <div className="overflow-x-auto rounded-xl bg-slate-900 border border-white/5 p-3">
                <svg
                  viewBox={`0 0 ${chartData.W} ${chartData.H}`}
                  style={{ width: '100%', minWidth: 360, height: chartData.H }}
                >
                  {/* Grid lines */}
                  {chartData.gridLines.map(t => {
                    const x = chartData.toX(t);
                    return (
                      <g key={t}>
                        <line x1={x} y1={12} x2={x} y2={chartData.H - 4} stroke="#1e293b" strokeWidth={1} />
                        <text x={x} y={10} textAnchor="middle" fontSize={8} fill="#475569">{t}m</text>
                      </g>
                    );
                  })}
                  {/* Axis end label */}
                  <text
                    x={chartData.toX(chartData.totalMin)}
                    y={10}
                    textAnchor="middle"
                    fontSize={8}
                    fill="#f97316"
                    fontWeight="bold"
                  >
                    {chartData.totalMin}m
                  </text>

                  {/* Lanes background */}
                  {[0, 1].map(lane => (
                    <rect
                      key={lane}
                      x={0}
                      y={chartData.laneY(lane)}
                      width={chartData.W}
                      height={chartData.LANE_H}
                      fill={lane === 0 ? '#0f172a' : '#0f1f3a'}
                      rx={4}
                    />
                  ))}

                  {/* Step bars */}
                  {timelineSteps.map((step, i) => {
                    const lane = step.isParallel ? 1 : 0;
                    const color = LANE_COLORS[lane === 0 ? 'main' : 'parallel'];
                    const x = chartData.toX(step.startMinute || 0);
                    const w = Math.max(18, chartData.toX((step.startMinute || 0) + (step.durationMinutes || 1)) - x);
                    const y = chartData.laneY(lane);
                    const label = step.label || `Step ${step.stepNumber || i + 1}`;
                    const labelMaxW = w - 6;
                    const shortLabel = label.length > 16 ? label.slice(0, 14) + '…' : label;
                    const durLabel = `${step.durationMinutes || '?'}m`;

                    return (
                      <g key={i}>
                        <rect x={x + 1} y={y + 2} width={w - 2} height={chartData.LANE_H - 4} rx={4} fill={color.fill} opacity={0.85} />
                        {labelMaxW > 30 && (
                          <text x={x + 4} y={y + 13} fontSize={8} fill={color.text} fontWeight="500">
                            {shortLabel}
                          </text>
                        )}
                        {labelMaxW > 20 && (
                          <text x={x + 4} y={y + 23} fontSize={7} fill={color.text} opacity={0.7}>
                            {durLabel}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Step list */}
              <div className="mt-3 space-y-1.5">
                {timelineSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <span className={`shrink-0 w-2 h-2 rounded-full mt-1 ${step.isParallel ? 'bg-blue-500' : 'bg-orange-500'}`} />
                    <span className="text-slate-400">
                      <span className="font-medium text-slate-300">{step.label}</span>
                      {' — '}
                      <span className="text-slate-600">starts at {step.startMinute}m · {step.durationMinutes}m</span>
                      {step.isParallel && <span className="text-blue-400/70"> (parallel)</span>}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
