import api from './api'

export type ReportRange =
  | '7'
  | '30'
  | '90'
  | '365'

export type ReportSummary = {
  totalUsers: number
  totalTransactions: number
  completedTransactions: number
  pendingTransactions: number
  failedTransactions: number
  totalRevenue: number
  averageTransactionValue: number
}

export type ReportSummaryResponse = {
  success: boolean
  message: string
  data: ReportSummary
}

export const getReportSummary = async (
  range: ReportRange,
): Promise<ReportSummaryResponse> => {
  const response =
    await api.get<ReportSummaryResponse>(
      '/reports/summary',
      {
        params: {
          range,
        },
      },
    )

  return response.data
}

export type ReportTransaction = {
  _id: string
  transactionId: string
  customer: string
  amount: number
  status:
    | 'completed'
    | 'pending'
    | 'failed'
  paymentMethod:
    | 'card'
    | 'upi'
    | 'bank_transfer'
    | 'other'
  date: string
}

export type ReportUser = {
  _id: string
  name: string
  email: string
  role: 'Admin' | 'Manager' | 'Viewer'
  status: 'Active' | 'Inactive'
  joinedDate: string
  createdAt: string
}

export type GeneratedReport = {
  range: ReportRange
  generatedAt: string
  summary: ReportSummary
  transactions: ReportTransaction[]
  users: ReportUser[]
}

export type GenerateReportResponse = {
  success: boolean
  message: string
  data: GeneratedReport
}

export const generateReport = async (
  range: ReportRange,
): Promise<GenerateReportResponse> => {
  const response =
    await api.get<GenerateReportResponse>(
      '/reports/generate',
      {
        params: {
          range,
        },
      },
    )

  return response.data
}