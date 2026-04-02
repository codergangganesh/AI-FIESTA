'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, TrendingDown, TrendingUp } from 'lucide-react'

interface BarChartProps {
  data: { name: string; value: number; color: string }[]
  title: string
  unit?: string
  chartId?: string
  isExpanded?: boolean
  onToggleExpand?: () => void
}

const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  title, 
  unit = '',
  isExpanded = false,
  onToggleExpand
}) => {
  // Show only first 4 items by default, unless expanded
  const displayedData = isExpanded ? data : data.slice(0, 4)
  
  // Find the maximum value for scaling
  const maxValue = displayedData.length > 0 ? Math.max(...displayedData.map(item => item.value), 0) : 1
  
  // Calculate average value for comparison
  const averageValue = displayedData.length > 0 ? displayedData.reduce((sum, item) => sum + item.value, 0) / displayedData.length : 0
  
  const [hoveredItem, setHoveredItem] = useState<{name: string, value: number, percentage: number} | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  
  const handleMouseEnter = (e: React.MouseEvent, item: {name: string, value: number}) => {
    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
    setHoveredItem({
      name: item.name,
      value: item.value,
      percentage
    })
    setTooltipPosition({ x: e.clientX, y: e.clientY })
  }
  
  const handleMouseLeave = () => {
    setHoveredItem(null)
  }

  return (
    <div className="fiesta-panel rounded-3xl p-6 transition-shadow duration-300 relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {data.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-xs">
              <span className="mr-1 text-slate-400">Avg:</span>
              <span className="font-medium text-white">
                {averageValue.toFixed(2)}{unit}
              </span>
            </div>
            {data.length > 4 && onToggleExpand && (
              <button 
                onClick={onToggleExpand}
                className="rounded-full bg-white/5 p-1 hover:bg-white/10 transition-colors"
                aria-label={isExpanded ? `Show fewer ${title}` : `Show all ${title}`}
              >
                {isExpanded ? (
                  <EyeOff className="w-4 h-4 text-slate-300" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-300" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
      {displayedData.length > 0 ? (
        <div className="space-y-4">
          {displayedData.map((item, index) => {
            // Calculate percentage difference from average
            const diffFromAvg = averageValue > 0 ? ((item.value - averageValue) / averageValue) * 100 : 0
            const isAboveAverage = diffFromAvg > 0
            
            return (
              <div 
                key={index} 
                className="flex items-center"
                onMouseEnter={(e) => handleMouseEnter(e, item)}
                onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
                onMouseLeave={handleMouseLeave}
              >
                <div className="w-24 truncate text-sm text-slate-300">
                  {item.name}
                </div>
                <div className="flex-1 ml-2">
                  <div className="flex items-center">
                    <div 
                      className="h-6 rounded-md transition-all duration-500 ease-out cursor-pointer hover:opacity-90" 
                      style={{ 
                        width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                    <span className="ml-2 whitespace-nowrap text-sm text-slate-300">
                      {item.value}{unit}
                    </span>
                    {diffFromAvg !== 0 && (
                      <div className={`ml-2 flex items-center text-xs ${isAboveAverage ? 'text-green-500' : 'text-red-500'}`}>
                        {isAboveAverage ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        <span>{Math.abs(diffFromAvg).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-32">
          <div className="mb-2 text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-center text-slate-400">No data available<br/><span className="text-sm">History has been cleared</span></p>
        </div>
      )}
      
      {/* Tooltip */}
      {hoveredItem && (
        <div 
          className="fixed z-50 bg-gray-900 text-white text-xs rounded py-2 px-3 shadow-lg pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="font-medium">{hoveredItem.name}</div>
          <div className="flex items-center mt-1">
            <span>{hoveredItem.value}{unit}</span>
            <span className="ml-2 text-gray-300">
              ({hoveredItem.percentage.toFixed(1)}% of max)
            </span>
          </div>
          <div className="absolute bottom-0 left-4 w-3 h-3 bg-gray-900 transform rotate-45 translate-y-1/2"></div>
        </div>
      )}
    </div>
  )
}

export default BarChart
