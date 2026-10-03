import { useEffect, useState } from 'react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  getTrafficChart,
} from '../../services/dashboardApi'

import type {
  DashboardRange,
  TrafficChartItem,
} from '../../services/dashboardApi'

type TrafficChartProps = {
  dateRange: DashboardRange
}

function TrafficChart({
  dateRange,
}: TrafficChartProps) {
  const [trafficData, setTrafficData] = useState<
    TrafficChartItem[]
  >([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        setLoading(true)
        setError('')

        const response =
          await getTrafficChart(dateRange)

        if (!response.success) {
          setError(response.message)
          return
        }

        setTrafficData(response.data)
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            'Failed to load traffic data',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchTrafficData()
  }, [dateRange])

  const chartData = trafficData.map((item) => ({
    date: new Date(
      `${item.date}T00:00:00`,
    ).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),

    transactions: item.transactions,
  }))

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Traffic Activity
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Transaction activity during selected period
        </p>
      </div>

      {loading ? (
        <div className="mt-6 flex h-80 items-center justify-center">
          <p className="text-sm text-slate-500">
            Loading traffic data...
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
            No traffic data found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            No transactions were found during this selected period.
          </p>
        </div>
      ) : (
        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
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
                dataKey="date"
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />

              <Tooltip
                formatter={(value) => [
                  Number(value).toLocaleString(),
                  'Transactions',
                ]}
              />

              <Bar
                dataKey="transactions"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default TrafficChart