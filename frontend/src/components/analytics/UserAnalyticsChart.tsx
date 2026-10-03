import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { getUserAnalytics } from '../../services/analyticsApi'
import type {
  AnalyticsRange,
  UserAnalyticsItem,
} from '../../services/analyticsApi'

type UserAnalyticsChartProps = {
  dateRange: AnalyticsRange
}

function UserAnalyticsChart({
  dateRange,
}: UserAnalyticsChartProps) {
  const [userData, setUserData] = useState<UserAnalyticsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getUserAnalytics(dateRange)

        if (!response.success) {
          setError(response.message)
          return
        }

        setUserData(response.data)
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            'Failed to load user analytics',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchUserAnalytics()
  }, [dateRange])

  const chartData = userData.map((item) => ({
    period: new Date(
      `${item.date}T00:00:00`,
    ).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    newUsers: item.newUsers,
    activeUsers: item.activeUsers,
  }))

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          User Analytics
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Compare new users with active users.
        </p>
      </div>

      {loading ? (
        <div className="mt-6 flex h-80 items-center justify-center">
          <p className="text-sm text-slate-500">
            Loading user analytics...
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
            No user data found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            No users were registered during this period.
          </p>
        </div>
      ) : (
        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
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
              />

              <Tooltip
                formatter={(value, name) => [
                  Number(value).toLocaleString(),
                  name === 'newUsers'
                    ? 'New Users'
                    : 'Active Users',
                ]}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="newUsers"
                name="New Users"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="activeUsers"
                name="Active Users"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default UserAnalyticsChart