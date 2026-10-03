import api from './api'

export type DashboardRange =
  | '7'
  | '30'
  | '90'
  | '365'

export type DashboardSummary = {
  totalUsers: number
  totalTransactions: number
  completedTransactions: number
  pendingTransactions: number
  failedTransactions: number
  totalRevenue: number
}

export type DashboardSummaryResponse = {
  success: boolean
  message: string
  data: DashboardSummary
}

export type RevenueChartItem = {
  date: string
  revenue: number
}

export type RevenueChartResponse = {
  success: boolean
  message: string
  data: RevenueChartItem[]
}

export type UserGrowthChartItem = {
  date: string
  users: number
}

export type UserGrowthChartResponse = {
  success: boolean
  message: string
  data: UserGrowthChartItem[]
}

export type TrafficChartItem = {
  date: string
  transactions: number
}

export type TrafficChartResponse = {
  success: boolean
  message: string
  data: TrafficChartItem[]
}

export const getDashboardSummary = async (
  range: DashboardRange,
): Promise<DashboardSummaryResponse> => {
  const response =
    await api.get<DashboardSummaryResponse>(
      '/dashboard/summary',
      {
        params: {
          range,
        },
      },
    )

  return response.data
}

export const getRevenueChart = async (
  range: DashboardRange,
): Promise<RevenueChartResponse> => {
  const response =
    await api.get<RevenueChartResponse>(
      '/dashboard/revenue',
      {
        params: {
          range,
        },
      },
    )

  return response.data
}

export const getUserGrowthChart = async (
  range: DashboardRange,
): Promise<UserGrowthChartResponse> => {
  const response =
    await api.get<UserGrowthChartResponse>(
      '/dashboard/user-growth',
      {
        params: {
          range,
        },
      },
    )

  return response.data
}

export const getTrafficChart = async (
  range: DashboardRange,
): Promise<TrafficChartResponse> => {
  const response =
    await api.get<TrafficChartResponse>(
      '/dashboard/traffic',
      {
        params: {
          range,
        },
      },
    )

  return response.data
}