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

import { getConversionFunnel } from '../../services/analyticsApi'
import type {
  AnalyticsRange,
  ConversionFunnelItem,
} from '../../services/analyticsApi'

type ConversionFunnelChartProps = {
  dateRange: AnalyticsRange
}

function ConversionFunnelChart({
  dateRange,
}: ConversionFunnelChartProps) {
  const [funnelData, setFunnelData] = useState<
    ConversionFunnelItem[]
  >([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchFunnelData = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getConversionFunnel(dateRange)

        if (!response.success) {
          setError(response.message)
          return
        }

        setFunnelData(response.data)
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            'Failed to load conversion funnel',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchFunnelData()
  }, [dateRange])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Transaction Funnel
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Transaction status breakdown for the selected period.
        </p>
      </div>

      {loading ? (
        <div className="mt-6 flex h-80 items-center justify-center">
          <p className="text-sm text-slate-500">
            Loading transaction funnel...
          </p>
        </div>
      ) : error ? (
        <div className="mt-6 flex h-80 items-center justify-center">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </div>
      ) : funnelData.length === 0 ? (
        <div className="mt-6 flex h-80 flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-slate-700">
            No transaction data found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            No transactions were found for this selected period.
          </p>
        </div>
      ) : (
        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={funnelData}
              layout="vertical"
              margin={{
                top: 10,
                right: 20,
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
              />

              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                type="category"
                dataKey="stage"
                axisLine={false}
                tickLine={false}
                width={120}
              />

              <Tooltip
                formatter={(value) => [
                  Number(value).toLocaleString(),
                  'Transactions',
                ]}
              />

              <Bar
                dataKey="users"
                fill="#2563eb"
                radius={[0, 6, 6, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default ConversionFunnelChart