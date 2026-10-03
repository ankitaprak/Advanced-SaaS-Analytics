import { useEffect, useState } from 'react'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  getRevenueAnalytics,
} from '../../services/analyticsApi'

import type {
  AnalyticsRange,
  RevenueAnalyticsItem,
} from '../../services/analyticsApi'

type RevenueAnalyticsChartProps = {
  dateRange: AnalyticsRange
}

function RevenueAnalyticsChart({
  dateRange,
}: RevenueAnalyticsChartProps) {
  const [revenueData, setRevenueData] =
    useState<RevenueAnalyticsItem[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true)
        setError('')

        const response =
          await getRevenueAnalytics(dateRange)

        if (!response.success) {
          setError(response.message)
          return
        }

        setRevenueData(response.data)
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            'Failed to load revenue analytics',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
  }, [dateRange])

  const chartData = revenueData.map((item) => ({
    period: new Date(
      `${item.date}T00:00:00`,
    ).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),

    revenue: item.revenue,
  }))

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Revenue Analytics
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Revenue trend for the selected period.
        </p>
      </div>

      {loading ? (
        <div className="mt-6 flex h-80 items-center justify-center">
          <p className="text-sm text-slate-500">
            Loading revenue analytics...
          </p>
        </div>
      ) : error ? (
        <div className="mt-6 flex h-80 items-center justify-center">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="mt-6 flex h-80 flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-slate-700">
            No revenue data found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            No completed transactions were found for this period.
          </p>
        </div>
      ) : (
        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  `$${Number(value) / 1000}k`
                }
              />

              <Tooltip
                formatter={(value) => [
                  `$${Number(value).toLocaleString(
                    'en-US',
                    {
                      minimumFractionDigits: 2,
                    },
                  )}`,
                  'Revenue',
                ]}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                fill="#dbeafe"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default RevenueAnalyticsChart