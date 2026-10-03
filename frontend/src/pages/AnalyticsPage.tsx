import { useEffect, useState } from 'react'

import DateRangeFilter from '../components/dashboard/DateRangeFilter'
import StatCard from '../components/dashboard/StatCard'

import {
  FaBullseye,
  FaDollarSign,
  FaUserPlus,
  FaUsers,
} from 'react-icons/fa'

import ConversionFunnelChart from '../components/analytics/ConversionFunnelChart'
import RevenueAnalyticsChart from '../components/analytics/RevenueAnalyticsChart'
import UserAnalyticsChart from '../components/analytics/UserAnalyticsChart'

import {
  getAnalyticsSummary,
} from '../services/analyticsApi'

import type {
  AnalyticsRange,
  AnalyticsSummary,
} from '../services/analyticsApi'

function AnalyticsPage() {
  const [dateRange, setDateRange] =
    useState<AnalyticsRange>('30')

  const [summary, setSummary] =
    useState<AnalyticsSummary | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const fetchAnalyticsSummary = async () => {
      try {
        setLoading(true)
        setError('')

        const response =
          await getAnalyticsSummary(dateRange)

        if (!response.success) {
          setError(response.message)
          return
        }

        setSummary(response.data)
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            'Failed to load analytics data',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsSummary()
  }, [dateRange])

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    })
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const revenuePerUser =
    summary && summary.totalUsers > 0
      ? summary.revenue / summary.totalUsers
      : 0

  return (
    <div>
      {/* Page Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Analytics
          </h1>

          <p className="mt-1 text-slate-500">
            Analyze your business performance and user behavior.
          </p>
        </div>

        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      {/* Error */}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* KPI Cards */}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={
            loading
              ? '...'
              : formatCurrency(summary?.revenue || 0)
          }
          change={
            loading
              ? 'Loading analytics data'
              : 'Completed transaction revenue'
          }
          changeType="positive"
          icon={<FaDollarSign size={20} />}
        />

        <StatCard
          title="Total Users"
          value={
            loading
              ? '...'
              : String(summary?.totalUsers || 0)
          }
          change={
            loading
              ? 'Loading analytics data'
              : 'Users registered during selected period'
          }
          changeType="positive"
          icon={<FaUsers size={20} />}
        />

        <StatCard
          title="Conversion Rate"
          value={
            loading
              ? '...'
              : formatPercentage(
                  summary?.completionRate || 0,
                )
          }
          change={
            loading
              ? 'Loading analytics data'
              : 'Completed transactions / total transactions'
          }
          changeType="positive"
          icon={<FaBullseye size={20} />}
        />

        <StatCard
          title="Revenue / User"
          value={
            loading
              ? '...'
              : formatCurrency(revenuePerUser)
          }
          change={
            loading
              ? 'Loading analytics data'
              : 'Revenue divided by users'
          }
          changeType="positive"
          icon={<FaUserPlus size={20} />}
        />
      </div>

      {/* Analytics Charts */}

      <div className="mt-6">
        <RevenueAnalyticsChart
          dateRange={dateRange}
        />
      </div>

      <div className="mt-6">
        <UserAnalyticsChart
          dateRange={dateRange}
        />
      </div>

      <div className="mt-6">
        <ConversionFunnelChart dateRange={dateRange} />
      </div>
    </div>
  )
}

export default AnalyticsPage