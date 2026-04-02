'use client'

import React, { useState } from 'react'
import { MessageSquare, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react'

interface SimpleCircleChartProps {
  data: { name: string; value: number; color: string }[]
  title: string
  chartId?: string
  isExpanded?: boolean
  onToggleExpand?: () => void
}

const SimpleCircleChart: React.FC<SimpleCircleChartProps> = ({ 
  data, 
  title,
  isExpanded = false,
  onToggleExpand
}) => {
  // Show only first 4 items by default, unless expanded
  const displayedData = isExpanded ? data : data.slice(0, 4)
  
  // Calculate total value
  const total = displayedData.reduce((sum, item) => sum + item.value, 0)
  
  // Calculate average value
  const average = displayedData.length > 0 ? total / displayedData.length : 0
  
  const [hoveredSegment, setHoveredSegment] = useState<{name: string, value: number, percentage: number} | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  
  const handleSegmentHover = (e: React.MouseEvent, segment: {name: string, value: number}) => {
    const percentage = total > 0 ? (segment.value / total) * 100 : 0
    setHoveredSegment({
      name: segment.name,
      value: segment.value,
      percentage
    })
    setTooltipPosition({ x: e.clientX, y: e.clientY })
  }
  
  const handleSegmentLeave = () => {
    setHoveredSegment(null)
  }

  return (
    <div className="fiesta-panel rounded-3xl p-6 transition-shadow duration-300 relative">
      <div className="mb-6 flex items-center justify-between border-b border-white/8 pb-2">
        <h3 className="text-xl font-semibold text-white">
          {title}
        </h3>
        {data.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center rounded-full border border-white/8 bg-white/5 px-2 py-1 text-xs">
              <MessageSquare className="mr-1 h-3 w-3 text-slate-400" />
              <span className="font-medium text-white">
                {total} total
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
        <div className="flex flex-col md:flex-row items-center">
          {/* Simple circle with total count */}
          <div className="relative w-40 h-40 flex-shrink-0 mb-6 md:mb-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg flex items-center justify-center">
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-[#07101c]">
                <span className="text-2xl font-extrabold text-white">{total}</span>
                <span className="mt-1 text-xs text-slate-400">Messages</span>
              </div>
            </div>
          </div>
          
          {/* Legend on the right side */}
          <div className="ml-0 md:ml-6 w-full">
            {displayedData.map((segment, index) => {
              // Calculate percentage
              // Calculate difference from average
              const diffFromAvg = average > 0 ? ((segment.value - average) / average) * 100 : 0
              const isAboveAverage = diffFromAvg > 0
              
              return (
                <div 
                  key={index} 
                  className="flex items-center justify-between rounded px-2 py-2 transition-colors hover:bg-white/5"
                  onMouseEnter={(e) => handleSegmentHover(e, segment)}
                  onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
                  onMouseLeave={handleSegmentLeave}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2 cursor-pointer hover:opacity-80" 
                      style={{ backgroundColor: segment.color }}
                    ></div>
                    <span className="max-w-[100px] truncate text-sm text-slate-300">
                      {segment.name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm font-medium text-white">
                      {segment.value}
                    </span>
                    {diffFromAvg !== 0 && (
                      <div className={`flex items-center text-xs ${isAboveAverage ? 'text-green-500' : 'text-red-500'}`}>
                        {isAboveAverage ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        <span>{Math.abs(diffFromAvg).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="mb-4 text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-center font-medium text-slate-400">
            No data available
          </p>
          <p className="mt-1 text-center text-sm text-slate-500">
            History has been cleared
          </p>
        </div>
      )}
      
      {/* Tooltip */}
      {hoveredSegment && (
        <div 
          className="fixed z-50 bg-gray-900 text-white text-xs rounded py-2 px-3 shadow-lg pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="font-medium">{hoveredSegment.name}</div>
          <div className="flex items-center mt-1">
            <span>{hoveredSegment.value} messages</span>
            <span className="ml-2 text-gray-300">
              ({hoveredSegment.percentage.toFixed(1)}% of total)
            </span>
          </div>
          <div className="absolute bottom-0 left-4 w-3 h-3 bg-gray-900 transform rotate-45 translate-y-1/2"></div>
        </div>
      )}
    </div>
  )
}

export default SimpleCircleChart
