import React, { useState } from 'react';
import type { Product } from '../../../types/database.types';
import { Package } from 'lucide-react';

interface ProductGrowthChartProps {
  products: Product[];
  loading?: boolean;
}

interface TimelinePoint {
  dateKey: string;
  label: string;
  cumulativeCount: number;
  addedCount: number;
}

export const ProductGrowthChart: React.FC<ProductGrowthChartProps> = ({
  products,
  loading = false,
}) => {
  const [activePoint, setActivePoint] = useState<TimelinePoint | null>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E2DA] p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="w-36 h-4 bg-[#EAE8E2] rounded animate-pulse" />
            <div className="w-48 h-3 bg-[#F0EFE9] rounded animate-pulse" />
          </div>
        </div>
        <div className="w-full h-44 bg-[#FAF9F5] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E2DA] p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="pb-2 border-b border-[#EAE8E2]">
          <h2 className="text-sm font-bold text-[#121214] tracking-tight">
            Perkembangan Barang
          </h2>
          <p className="text-xs text-[#75726B]">
            Pertumbuhan akumulatif katalog barang aktif
          </p>
        </div>
        <div className="py-12 text-center text-xs text-[#75726B]">
          Belum ada data barang untuk dianalisis.
        </div>
      </div>
    );
  }

  // 1. Process actual created_at timestamps into chronological cumulative growth
  const validProducts = products.filter((p) => p.created_at);
  const sorted = [...validProducts].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Group by Month or Day depending on date distribution
  const dateMap = new Map<string, { label: string; count: number; rawDate: Date }>();

  for (const prod of sorted) {
    const d = new Date(prod.created_at);
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const label = `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;

    const existing = dateMap.get(yearMonth);
    if (existing) {
      existing.count += 1;
    } else {
      dateMap.set(yearMonth, { label, count: 1, rawDate: d });
    }
  }

  let runningTotal = 0;
  const rawPoints: TimelinePoint[] = [];

  dateMap.forEach((val, key) => {
    runningTotal += val.count;
    rawPoints.push({
      dateKey: key,
      label: val.label,
      cumulativeCount: runningTotal,
      addedCount: val.count,
    });
  });

  // If only 1 timeline point (e.g. initial setup batch import), create a clean baseline entry
  let points: TimelinePoint[] = [];
  if (rawPoints.length === 1) {
    points = [
      {
        dateKey: 'initial',
        label: 'Awal',
        cumulativeCount: 0,
        addedCount: 0,
      },
      rawPoints[0],
    ];
  } else {
    points = rawPoints;
  }

  // 2. SVG Geometry Calculations
  const svgWidth = 500;
  const svgHeight = 150;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 30;

  const maxCount = Math.max(...points.map((p) => p.cumulativeCount), products.length);
  const minCount = 0;
  const range = maxCount - minCount || 1;

  const coords = points.map((p, idx) => {
    const x =
      points.length === 1
        ? svgWidth / 2
        : paddingX + (idx / (points.length - 1)) * (svgWidth - 2 * paddingX);
    const y =
      svgHeight -
      paddingBottom -
      ((p.cumulativeCount - minCount) / range) * (svgHeight - paddingTop - paddingBottom);
    return { ...p, x, y };
  });

  // Build SVG Path strings
  const linePath = coords.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    // Use smooth curve
    const prev = coords[idx - 1];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (curr.x - prev.x) / 2;
    const cpY2 = curr.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
  }, '');

  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${svgHeight - paddingBottom} L ${coords[0].x} ${svgHeight - paddingBottom} Z`;

  const latestPoint = coords[coords.length - 1];

  return (
    <div className="bg-white rounded-xl border border-[#E5E2DA] p-4 sm:p-5 shadow-2xs space-y-3 flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 pb-2 border-b border-[#EAE8E2]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#75726B] font-bold block">
            Tren Pertumbuhan
          </span>
          <h2 className="text-sm sm:text-base font-bold text-[#121214] tracking-tight mt-0.5">
            Perkembangan Barang
          </h2>
          <p className="text-[11px] text-[#75726B] mt-0.5">
            Pertumbuhan akumulatif katalog barang aktif
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAF9F5] border border-[#EAE8E2] text-xs font-mono font-bold text-[#121214]">
            <Package className="w-3.5 h-3.5 text-[#75726B]" />
            <span>{products.length} Barang</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative pt-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-36 sm:h-40 overflow-visible select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="growthAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#121214" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#121214" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={svgWidth - paddingX}
            y2={paddingTop}
            stroke="#EAE8E2"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={(svgHeight - paddingBottom + paddingTop) / 2}
            x2={svgWidth - paddingX}
            y2={(svgHeight - paddingBottom + paddingTop) / 2}
            stroke="#EAE8E2"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={svgHeight - paddingBottom}
            x2={svgWidth - paddingX}
            y2={svgHeight - paddingBottom}
            stroke="#E5E2DA"
            strokeWidth="1"
          />

          {/* Area Fill */}
          <path d={areaPath} fill="url(#growthAreaGradient)" />

          {/* Main Curve Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#121214"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {coords.map((pt, idx) => {
            const isHovered = activePoint?.dateKey === pt.dateKey;
            return (
              <g key={pt.dateKey || idx} className="cursor-pointer">
                {/* Hit target */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="14"
                  fill="transparent"
                  onMouseEnter={() => setActivePoint(pt)}
                  onMouseLeave={() => setActivePoint(null)}
                />
                {/* Visible dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? '5' : '3.5'}
                  fill="#FFFFFF"
                  stroke="#121214"
                  strokeWidth={isHovered ? '2.5' : '2'}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {/* X Axis Labels */}
          {coords.map((pt, idx) => {
            // Show first, middle, last to prevent overlap
            const isMilestone =
              idx === 0 ||
              idx === coords.length - 1 ||
              (coords.length > 3 && idx === Math.floor(coords.length / 2));

            if (!isMilestone && coords.length > 4) return null;

            return (
              <text
                key={`label-${pt.dateKey || idx}`}
                x={pt.x}
                y={svgHeight - 10}
                textAnchor="middle"
                fontSize="10"
                fontFamily="monospace"
                fill="#75726B"
              >
                {pt.label}
              </text>
            );
          })}
        </svg>

        {/* Hover / Active Tooltip */}
        {activePoint && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#121214] text-white text-[11px] font-mono px-3 py-1 rounded-md shadow-md pointer-events-none transition-all">
            <span>{activePoint.label}: </span>
            <strong className="text-white">{activePoint.cumulativeCount} barang</strong>
            {activePoint.addedCount > 0 && (
              <span className="text-emerald-400 ml-1.5">(+{activePoint.addedCount})</span>
            )}
          </div>
        )}
      </div>

      {/* Footer Insight Note */}
      <div className="pt-2 border-t border-[#EAE8E2] flex items-center justify-between text-[11px] text-[#75726B] font-mono">
        <span>Status Terakhir:</span>
        <strong className="text-[#121214]">
          {latestPoint.cumulativeCount} barang terdaftar
        </strong>
      </div>
    </div>
  );
};
