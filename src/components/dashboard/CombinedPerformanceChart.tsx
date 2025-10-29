"use client"

import React, { useState, useMemo } from 'react';

interface DataPoint {
  x: number;
  y: number;
  value: number;
  period: string;
}

interface HoverData {
  x: number;
  accuracyY: number;
  lossY: number;
  accuracyValue: number;
  lossValue: number;
  period: string;
}

interface CombinedPerformanceChartProps {
  accuracyData: { period: string; [key: string]: string | number }[];
  lossData: { period: string; [key: string]: string | number }[];
  title?: string;
}

const CombinedPerformanceChart: React.FC<CombinedPerformanceChartProps> = ({
  accuracyData,
  lossData,
  title = 'Model Performance'
}) => {
  // Helper: average across numeric keys for a given data point
  const averageValue = (point: { [key: string]: string | number }): number => {
    const vals = Object.entries(point)
      .filter(([k, v]) => k !== 'period' && typeof v === 'number')
      .map(([, v]) => v as number);
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  // Process accuracy and loss data
  const { accuracySeries, lossSeries } = useMemo(() => {
    const periods = Array.from(
      new Set([
        ...accuracyData.map(d => d.period),
        ...lossData.map(d => d.period)
      ])
    ).sort();

    const accuracy = periods.map(p => {
      const pt = accuracyData.find(d => d.period === p);
      return { period: p, value: pt ? averageValue(pt) : 0 };
    });

    const loss = periods.map(p => {
      const pt = lossData.find(d => d.period === p);
      return { period: p, value: pt ? averageValue(pt) : 0 };
    });

    return { accuracySeries: accuracy, lossSeries: loss };
  }, [accuracyData, lossData]);

  // Calculate min/max for Y-axis (for accuracy)
  const { minAccuracy, maxAccuracy, accuracyRange } = useMemo(() => {
    const values = accuracySeries.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { 
      minAccuracy: min,
      maxAccuracy: max,
      accuracyRange: max - min || 1
    };
  }, [accuracySeries]);

  // Calculate max for loss (scaled to match accuracy range)
  const { maxLoss } = useMemo(() => {
    const values = lossSeries.map(d => d.value);
    return { maxLoss: Math.max(...values) || 1 };
  }, [lossSeries]);

  // Generate points for both series
  const accuracyPoints = useMemo(() => {
    return accuracySeries.map((d, i) => ({
      x: (i / Math.max(accuracySeries.length - 1, 1)) * 100,
      y: 100 - ((d.value - minAccuracy) / accuracyRange) * 90,
      value: d.value,
      period: d.period
    }));
  }, [accuracySeries, minAccuracy, accuracyRange]);

  const lossPoints = useMemo(() => {
    return lossSeries.map((d, i) => ({
      x: (i / Math.max(lossSeries.length - 1, 1)) * 100,
      y: 100 - (d.value / maxLoss) * 90,
      value: d.value,
      period: d.period
    }));
  }, [lossSeries, maxLoss]);
  
  // Hover state
  const [hoverData, setHoverData] = useState<HoverData | null>(null);

  // Generate SVG paths
  const generatePath = (points: DataPoint[]): string => {
    if (points.length < 2) return '';
    return `M${points[0].x},${points[0].y} ` + 
           points.slice(1).map(p => `L${p.x},${p.y}`).join(' ');
  };

  const accuracyPath = useMemo(() => generatePath(accuracyPoints), [accuracyPoints]);
  const lossPath = useMemo(() => generatePath(lossPoints), [lossPoints]);
  
  // Generate area paths
  const generateAreaPath = (points: DataPoint[]): string => {
    if (points.length < 2) return '';
    return `M${points[0].x},100 L${points[0].x},${points[0].y} ` +
           points.slice(1).map(p => `L${p.x},${p.y}`).join(' ') +
           ` L${points[points.length - 1].x},100 Z`;
  };

  const accuracyAreaPath = useMemo(() => generateAreaPath(accuracyPoints), [accuracyPoints]);
  const lossAreaPath = useMemo(() => generateAreaPath(lossPoints), [lossPoints]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            <span className="text-xs text-gray-600 dark:text-gray-300">Accuracy</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span className="text-xs text-gray-600 dark:text-gray-300">Loss</span>
          </div>
        </div>
      </div>

      {accuracySeries.length > 0 && lossSeries.length > 0 ? (
        <div className="relative h-80">
          {/* Y-axis labels for Accuracy */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-blue-500 py-4 pr-2">
            <span>{maxAccuracy.toFixed(0)}%</span>
            <span>{((maxAccuracy + minAccuracy) / 2).toFixed(0)}%</span>
            <span>{minAccuracy.toFixed(0)}%</span>
          </div>

          {/* Y-axis labels for Loss (right side) */}
          <div className="absolute right-0 top-0 h-full flex flex-col justify-between text-xs text-red-500 py-4 pl-2">
            <span>{(maxLoss).toFixed(2)}</span>
            <span>{(maxLoss / 2).toFixed(2)}</span>
            <span>0.00</span>
          </div>

          {/* Grid */}
          <div className="absolute inset-0 ml-10 mr-10 border-l border-r border-b border-gray-200 dark:border-gray-700">
            {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => (
              <div 
                key={i} 
                className="absolute left-0 right-0 h-px bg-gray-100 dark:bg-gray-700" 
                style={{ top: `${fraction * 90}%` }}
              ></div>
            ))}
          </div>

          {/* Chart area */}
          <div className="absolute inset-0 ml-10 mr-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Accuracy area and line */}
              <path
                d={accuracyAreaPath}
                fill="url(#accuracyGradient)"
                stroke="none"
              />
              <path
                d={accuracyPath}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
              />
              
              {/* Loss area and line */}
              <path
                d={lossAreaPath}
                fill="url(#lossGradient)"
                stroke="none"
                opacity="0.5"
              />
              <path
                d={lossPath}
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4 2"
              />
            </svg>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
              {accuracyPoints
                .filter((_, i) => i % Math.ceil(accuracyPoints.length / 4) === 0 || i === accuracyPoints.length - 1)
                .map((point, i) => (
                  <span 
                    key={i} 
                    className="text-xs text-gray-500 dark:text-gray-400"
                    style={{ 
                      transform: 'translateX(-50%)',
                      left: `${point.x}%`,
                      position: 'absolute',
                      bottom: '-20px'
                    }}
                  >
                    {point.period}
                  </span>
                ))}
            </div>

            {/* Hover indicator and tooltip */}
            {hoverData && (
              <>
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"
                  style={{ left: `${hoverData.x}%` }}
                ></div>
                
                {/* Accuracy dot */}
                <div 
                  className="absolute w-3 h-3 bg-blue-500 rounded-full -translate-x-1.5 -translate-y-1.5 border-2 border-white dark:border-gray-800"
                  style={{ 
                    left: `${hoverData.x}%`, 
                    top: `${hoverData.accuracyY}%`
                  }}
                ></div>
                
                {/* Loss dot */}
                <div 
                  className="absolute w-3 h-3 bg-red-500 rounded-full -translate-x-1.5 -translate-y-1.5 border-2 border-white dark:border-gray-800"
                  style={{ 
                    left: `${hoverData.x}%`, 
                    top: `${hoverData.lossY}%`
                  }}
                ></div>
                
                <div 
                  className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm z-10 min-w-[180px]"
                  style={{ 
                    left: `${Math.min(85, Math.max(15, hoverData.x))}%`, 
                    top: '20px',
                    transform: hoverData.x > 70 ? 'translateX(-100%)' : 'none'
                  }}
                >
                  <div className="font-medium text-gray-900 dark:text-white mb-2">
                    {hoverData.period}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-300">Accuracy:</span>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {hoverData.accuracyValue.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-300">Loss:</span>
                    </div>
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {hoverData.lossValue.toFixed(4)}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Invisible overlay for mouse events */}
            <div 
              className="absolute inset-0"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                
                // Find the closest accuracy point for the x-coordinate
                let closestAccuracyPoint = accuracyPoints[0];
                let minAccuracyDistance = Infinity;
                
                accuracyPoints.forEach(point => {
                  const distance = Math.abs(point.x - x);
                  if (distance < minAccuracyDistance) {
                    minAccuracyDistance = distance;
                    closestAccuracyPoint = point;
                  }
                });
                
                // Find the corresponding loss point (same x-coordinate)
                const closestLossPoint = lossPoints.reduce((prev, curr) => 
                  Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev
                );
                
                setHoverData({
                  x: closestAccuracyPoint.x,
                  accuracyY: closestAccuracyPoint.y,
                  lossY: closestLossPoint.y,
                  accuracyValue: closestAccuracyPoint.value,
                  lossValue: closestLossPoint.value,
                  period: closestAccuracyPoint.period
                });
              }}
              onMouseLeave={() => setHoverData(null)}
            ></div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-80">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      )}
    </div>
  );
};

export default CombinedPerformanceChart;