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
  getUserGrowthChart,
} from '../../services/dashboardApi'

import type {
  DashboardRange,
  UserGrowthChartItem,
} from '../../services/dashboardApi'

type UserGrowthChartProps = {
  dateRange: DashboardRange
}

function UserGrowthChart({
  dateRange,
}: UserGrowthChartProps) {
  const [userData, setUserData] = useState<
    UserGrowthChartItem[]
  >([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const fetchUserGrowthData = async () => {
      try {
        setLoading(true)
        setError('')

        const response =
          await getUserGrowthChart(dateRange)

        if (!response.success) {
          setError(response.message)
          return
        }

        setUserData(response.data)
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            'Failed to load user growth data',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchUserGrowthData()
  }, [dateRange])

  const chartData = userData.map((item) => ({
    date: new Date(
      `${item.date}T00:00:00`,
    ).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),

    users: item.users,
  }))

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          User Growth
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          New users registered during selected period
        </p>
      </div>

      {loading ? (
        <div className="flex h-80 items-center justify-center">
          <p className="text-sm text-slate-500">
            Loading user growth data...
          </p>
        </div>
      ) : error ? (
        <div className="flex h-80 items-center justify-center">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-80 flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-slate-700">
            No user growth data found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            No users were registered during this selected period.
          </p>
        </div>
      ) : (
        <div className="h-80 w-full">
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
                dataKey="date"
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                formatter={(value) => [
                  Number(value).toLocaleString('en-US'),
                  'Users',
                ]}
              />

              <Area
                type="monotone"
                dataKey="users"
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

export default UserGrowthChart