import api from './api'

export type AnalyticsRange =
  | '7'
  | '30'
  | '90'
  | '365'

export type AnalyticsSummary = {
  totalUsers: number
  totalTransactions: number
  completedTransactions: number
  pendingTransactions: number
  failedTransactions: number
  revenue: number
  averageTransactionValue: number
  completionRate: number
}

export type AnalyticsSummaryResponse = {
  success: boolean
  message: string
  data: AnalyticsSummary
}

export const getAnalyticsSummary = async (
  range: AnalyticsRange,
): Promise<AnalyticsSummaryResponse> => {
  const response =
    await api.get<AnalyticsSummaryResponse>(
      '/analytics/summary',
      {
        params: {
          range,
        },
      },
    )

  return response.data
}

export type RevenueAnalyticsItem = {
  date: string
  revenue: number
}

export type RevenueAnalyticsResponse = {
  success: boolean
  message: string
  data: RevenueAnalyticsItem[]
}

export const getRevenueAnalytics = async (
  range: AnalyticsRange,
): Promise<RevenueAnalyticsResponse> => {
  const response =
    await api.get<RevenueAnalyticsResponse>(
      '/dashboard/revenue',
      {
        params: {
          range,
        },
      },
    )

  return response.data
}

export type UserAnalyticsItem = {
  date: string
  newUsers: number
  activeUsers: number
}

export type UserAnalyticsResponse = {
  success: boolean
  message: string
  data: UserAnalyticsItem[]
}

export const getUserAnalytics = async (
  range: AnalyticsRange,
): Promise<UserAnalyticsResponse> => {
  const response =
    await api.get<UserAnalyticsResponse>(
      '/analytics/users',
      {
        params: {
          range,
        },
      },
    )

  return response.data
}

export type ConversionFunnelItem = {
  stage: string
  users: number
}

export type ConversionFunnelResponse = {
  success: boolean
  message: string
  data: ConversionFunnelItem[]
}

export const getConversionFunnel = async (
  range: AnalyticsRange,
): Promise<ConversionFunnelResponse> => {
  const response =
    await api.get<ConversionFunnelResponse>(
      '/analytics/funnel',
      {
        params: {
          range,
        },
      },
    )

  return response.data
}