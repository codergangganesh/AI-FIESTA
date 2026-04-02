'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  Brain,
  Download,
  GitCompare,
  MessageSquare,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useOptimizedRouter } from '@/hooks/useOptimizedRouter'
import { useOptimizedLoading } from '@/contexts/OptimizedLoadingContext'
import { createClient } from '@/utils/supabase/client'
import SimpleLoader from '@/components/ui/SimpleLoader'
import SharedSidebar from '@/components/layout/SharedSidebar'
import BarChart from '@/components/dashboard/BarChart'
import LineChart from '@/components/dashboard/LineChart'
import SimpleCircleChart from '@/components/dashboard/SimpleCircleChart'
import ResponseTimeDistribution from '@/components/dashboard/ResponseTimeDistribution'
import CombinedPerformanceChart from '@/components/dashboard/CombinedPerformanceChart'
import { dashboardService } from '@/services/dashboard.service'
import { chatHistoryService } from '@/services/chatHistory.service'
import { ChatSession } from '@/types/chat'
import { generateAccuracyData, generateLossData } from '@/lib/chartUtils'

interface MetricCard {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useOptimizedRouter()
  const { setPageLoading } = useOptimizedLoading()
  const supabase = createClient()
  const realtimeSubscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const [metrics, setMetrics] = useState<MetricCard[]>([
    { title: 'Total Comparisons', value: '0', change: '+0%', trend: 'up', icon: GitCompare, color: 'from-blue-500 to-cyan-400' },
    { title: 'Models Analyzed', value: '0', change: '+0%', trend: 'up', icon: Brain, color: 'from-violet-500 to-blue-500' },
    { title: 'Accuracy Score', value: '0%', change: '+0%', trend: 'up', icon: TrendingUp, color: 'from-emerald-500 to-cyan-500' },
    { title: 'API Usage', value: '0%', change: '-0%', trend: 'down', icon: Activity, color: 'from-amber-500 to-orange-500' }
  ])

  const [usageData, setUsageData] = useState({ apiCalls: 0, comparisons: 0, storage: 0 })
  const [avgResponsesPerComparison, setAvgResponsesPerComparison] = useState(0)
  const [chartVisibility, setChartVisibility] = useState<Record<string, boolean>>({
    'model-latency': false,
    'prompts-per-model': false,
    'throughput-by-model': false,
    'latency-trends': false,
    'latency-distribution': false
  })
  const [loadingData, setLoadingData] = useState(true)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [hasUsedModels, setHasUsedModels] = useState(false)

  const [responseTimeData, setResponseTimeData] = useState<{ name: string; value: number; color: string }[]>([])
  const [messagesTypedData, setMessagesTypedData] = useState<{ name: string; value: number; color: string }[]>([])
  const [modelDataTimeData, setModelDataTimeData] = useState<{ name: string; value: number; color: string }[]>([])
  const [responseTimeDistributionData, setResponseTimeDistributionData] = useState<{ name: string; value: number; color: string }[]>([])
  const [lineChartData, setLineChartData] = useState<{ [key: string]: string | number; period: string }[]>([])
  const [lineChartMetrics, setLineChartMetrics] = useState<string[]>([])
  const [lineChartMetricLabels, setLineChartMetricLabels] = useState<Record<string, string>>({})
  const [accuracyData, setAccuracyData] = useState<{ [key: string]: string | number; period: string }[]>([])
  const [lossData, setLossData] = useState<{ [key: string]: string | number; period: string }[]>([])
  const [userPlan] = useState('free')

  useEffect(() => {
    dashboardService.clearCache()
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      setPageLoading(true, 'Redirecting to authentication...')
      router.push('/auth')
    } else if (user && !loading) {
      setPageLoading(false)
    }
  }, [loading, router, setPageLoading, user])

  const updateDashboardData = async (fetchedSessions: ChatSession[] | null = null) => {
    try {
      const sessionsToUse = fetchedSessions || await dashboardService.getChatSessions(false) || []
      setHasUsedModels(sessionsToUse.length > 0)

      const dashboardMetrics = dashboardService.calculateDashboardMetrics(sessionsToUse)
      setMetrics([
        {
          title: 'Total Comparisons',
          value: dashboardMetrics.totalComparisons.toString(),
          change: dashboardMetrics.totalComparisons > 0 ? '+12.5%' : '+0%',
          trend: 'up',
          icon: GitCompare,
          color: 'from-blue-500 to-cyan-400'
        },
        {
          title: 'Models Analyzed',
          value: dashboardMetrics.modelsAnalyzed.toString(),
          change: dashboardMetrics.modelsAnalyzed > 0 ? '+8.2%' : '+0%',
          trend: 'up',
          icon: Brain,
          color: 'from-violet-500 to-blue-500'
        },
        {
          title: 'Accuracy Score',
          value: `${dashboardMetrics.accuracyScore}%`,
          change: dashboardMetrics.accuracyScore > 0 ? '+2.1%' : '+0%',
          trend: 'up',
          icon: TrendingUp,
          color: 'from-emerald-500 to-cyan-500'
        },
        {
          title: 'API Usage',
          value: `${dashboardMetrics.apiUsage}%`,
          change: dashboardMetrics.apiUsage > 0 ? '-5.4%' : '-0%',
          trend: dashboardMetrics.apiUsage > 50 ? 'down' : 'up',
          icon: Activity,
          color: 'from-amber-500 to-orange-500'
        }
      ])

      const usage = dashboardService.getUsageData(sessionsToUse)
      setUsageData(usage)

      const totalResponses = sessionsToUse.reduce((sum, s) => sum + (s.responses ? s.responses.length : 0), 0)
      const avg = sessionsToUse.length > 0 ? totalResponses / sessionsToUse.length : 0
      setAvgResponsesPerComparison(Number.isFinite(avg) ? parseFloat(avg.toFixed(2)) : 0)

      setResponseTimeData(dashboardService.getResponseTimeData(sessionsToUse))
      setMessagesTypedData(dashboardService.getMessagesTypedData(sessionsToUse))
      setModelDataTimeData(dashboardService.getModelDataTimeData(sessionsToUse))
      setResponseTimeDistributionData(dashboardService.getResponseTimeDistributionData(sessionsToUse))

      const lineData = dashboardService.getLineChartData(sessionsToUse)
      const metricsList = dashboardService.getLineChartMetrics(sessionsToUse)
      const labels: Record<string, string> = {}
      metricsList.forEach(metric => {
        labels[metric] = metric
      })

      setLineChartData(lineData)
      setLineChartMetrics(metricsList)
      setLineChartMetricLabels(labels)
      setAccuracyData(generateAccuracyData(metricsList, lineData))
      setLossData(generateLossData(metricsList, lineData))
    } catch (error) {
      console.error('Error updating dashboard data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!user || loading) return
      setLoadingData(true)
      const fetchedSessions = await chatHistoryService.getChatSessions()
      await updateDashboardData(fetchedSessions || [])
    }

    fetchData()
  }, [loading, user])

  useEffect(() => {
    if (!user || loading) return

    const channel = supabase
      .channel('dashboard-chat-sessions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions', filter: `user_id=eq.${user.id}` }, async () => {
        dashboardService.clearCache()
        const fetchedSessions = await chatHistoryService.getChatSessions(false)
        await updateDashboardData(fetchedSessions || [])
      })
      .subscribe()

    realtimeSubscriptionRef.current = channel

    return () => {
      if (realtimeSubscriptionRef.current) {
        supabase.removeChannel(realtimeSubscriptionRef.current)
      }
    }
  }, [loading, supabase, user])

  const toggleChartVisibility = (chartId: string) => {
    setChartVisibility(prev => ({ ...prev, [chartId]: !prev[chartId] }))
  }

  const generateDashboardData = () => ({
    metrics,
    usageData,
    userPlan,
    exportDate: new Date().toISOString(),
    userId: user?.id || 'anonymous'
  })

  const exportToJSON = () => {
    const data = generateDashboardData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-data-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setIsExportOpen(false)
  }

  const exportToCSV = () => {
    const data = generateDashboardData()
    let csvContent = 'Dashboard Data Export\n'
    csvContent += `Export Date: ${data.exportDate}\n\n`
    csvContent += 'Metrics:\nTitle,Value,Change,Trend\n'
    data.metrics.forEach(metric => {
      csvContent += `${metric.title},${metric.value},${metric.change},${metric.trend}\n`
    })
    csvContent += '\nUsage Data:\n'
    csvContent += `API Calls,${data.usageData.apiCalls}\nComparisons,${data.usageData.comparisons}\nStorage,${data.usageData.storage} MB\n`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-data-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setIsExportOpen(false)
  }

  const exportToPDF = () => {
    const data = generateDashboardData()
    let pdfContent = 'Dashboard Data Export\n\n'
    pdfContent += `Export Date: ${new Date(data.exportDate).toLocaleString()}\n\n`
    data.metrics.forEach(metric => {
      pdfContent += `- ${metric.title}: ${metric.value} (${metric.change} ${metric.trend})\n`
    })

    const blob = new Blob([pdfContent], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-data-${new Date().toISOString().slice(0, 10)}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setIsExportOpen(false)
  }

  const getPlanDisplayName = () => (userPlan === 'pro' || userPlan === 'pro_plus' ? 'Pro Plus' : 'Free')
  const getPlanLimits = (planType: string) => {
    switch (planType) {
      case 'pro':
        return { apiCalls: 2500, comparisons: 500, storage: 10 * 1024 }
      case 'pro_plus':
        return { apiCalls: 10000, comparisons: Infinity, storage: 100 * 1024 }
      default:
        return { apiCalls: 100, comparisons: 10, storage: 50 }
    }
  }

  const usageCards = useMemo(() => {
    const limits = getPlanLimits(userPlan)
    const calculateUsagePercentage = (current: number, limit: number) => (limit === Infinity ? 0 : Math.min(100, (current / limit) * 100))

    return [
      {
        title: 'API Calls',
        value: `${usageData.apiCalls} / ${limits.apiCalls === Infinity ? 'Infinity' : limits.apiCalls}`,
        description: `${calculateUsagePercentage(usageData.apiCalls, limits.apiCalls).toFixed(1)}% used`,
        progress: calculateUsagePercentage(usageData.apiCalls, limits.apiCalls),
        tone: 'bg-blue-500'
      },
      {
        title: 'Comparisons',
        value: `${usageData.comparisons} / ${limits.comparisons === Infinity ? 'Infinity' : limits.comparisons}`,
        description: `${calculateUsagePercentage(usageData.comparisons, limits.comparisons).toFixed(1)}% used`,
        progress: calculateUsagePercentage(usageData.comparisons, limits.comparisons),
        tone: 'bg-violet-500'
      },
      {
        title: 'Avg Responses',
        value: avgResponsesPerComparison.toString(),
        description: 'Average model responses per comparison',
        progress: 100,
        tone: 'bg-emerald-500'
      }
    ]
  }, [avgResponsesPerComparison, usageData, userPlan])

  if (loading || loadingData) {
    return <SimpleLoader message="Loading dashboard..." />
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-transparent text-white">
      <SharedSidebar />

      <main className="m-4 flex min-w-0 flex-1 flex-col">
        <div className="fiesta-panel relative z-30 overflow-visible rounded-[1.75rem] px-5 py-5 sm:px-6">
          <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                {!hasUsedModels && (
                  <p className="mt-2 text-sm text-slate-400">Start using AI models to populate real dashboard metrics and charts.</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative z-40">
                  <button
                    onClick={() => setIsExportOpen(!isExportOpen)}
                    className="fiesta-button-secondary rounded-2xl p-3"
                    title="Export"
                  >
                    <Download className="h-4 w-4" />
                  </button>

                  {isExportOpen && (
                    <div className="fiesta-panel absolute right-0 z-[90] mt-2 w-56 rounded-2xl p-2 shadow-[0_28px_80px_rgba(15,23,42,0.45)]">
                      <button onClick={exportToJSON} className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5">Export to JSON</button>
                      <button onClick={exportToCSV} className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5">Export to CSV</button>
                      <button onClick={exportToPDF} className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5">Export to PDF</button>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
                  {getPlanDisplayName()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6">
            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
              {metrics.map((metric) => {
                const Icon = metric.icon
                return (
                  <div key={metric.title} className="fiesta-panel rounded-3xl p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${metric.color} text-white shadow-lg`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className={`text-sm font-medium ${metric.trend === 'up' ? 'text-emerald-300' : 'text-amber-300'}`}>
                        {metric.change}
                      </div>
                    </div>
                    <div className="text-3xl font-semibold text-white">{metric.value}</div>
                    <p className="mt-2 text-sm text-slate-400">{metric.title}</p>
                  </div>
                )
              })}
            </section>

            <section>
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-white">Resource usage</h2>
                <p className="mt-1 text-sm text-slate-400">Usage cards resized for desktop scanning and aligned to the active theme.</p>
              </div>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                {usageCards.map((card) => (
                  <div key={card.title} className="fiesta-panel rounded-3xl p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                      <MessageSquare className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="mt-5 text-3xl font-semibold text-white">{card.value}</div>
                    <p className="mt-2 text-sm text-slate-400">{card.description}</p>
                    <div className="mt-5 h-2 rounded-full bg-white/8">
                      <div className={`${card.tone} h-2 rounded-full`} style={{ width: `${Math.min(card.progress, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
              <BarChart
                data={responseTimeData}
                title="Model Latency Comparison"
                unit="s"
                chartId="model-latency"
                isExpanded={chartVisibility['model-latency']}
                onToggleExpand={() => toggleChartVisibility('model-latency')}
              />
              <SimpleCircleChart
                data={messagesTypedData}
                title="Prompts per Model"
                chartId="prompts-per-model"
                isExpanded={chartVisibility['prompts-per-model']}
                onToggleExpand={() => toggleChartVisibility('prompts-per-model')}
              />
            </section>

            <section className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
              <BarChart
                data={modelDataTimeData}
                title="Throughput by Model"
                unit="s"
                chartId="throughput-by-model"
                isExpanded={chartVisibility['throughput-by-model']}
                onToggleExpand={() => toggleChartVisibility('throughput-by-model')}
              />
              <LineChart
                data={lineChartData}
                title="Latency Trends Over Time"
                metrics={lineChartMetrics}
                metricLabels={lineChartMetricLabels}
                chartId="latency-trends"
                isExpanded={chartVisibility['latency-trends']}
                onToggleExpand={() => toggleChartVisibility('latency-trends')}
              />
            </section>

            <section className="grid grid-cols-1 gap-6">
              <ResponseTimeDistribution
                data={responseTimeDistributionData}
                title="Latency Distribution"
                unit="s"
                chartId="latency-distribution"
                isExpanded={chartVisibility['latency-distribution']}
                onToggleExpand={() => toggleChartVisibility('latency-distribution')}
              />
            </section>

            <section className="pt-2">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-white">Performance metrics</h2>
                <p className="mt-1 text-sm text-slate-400">A cleaner combined chart section for wider desktop screens.</p>
              </div>
              <CombinedPerformanceChart accuracyData={accuracyData} lossData={lossData} title="Accuracy and Loss Trends" />
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
