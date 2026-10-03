export type TransactionStatus =
  | 'completed'
  | 'pending'
  | 'failed'

export type PaymentMethod =
  | 'card'
  | 'upi'
  | 'bank_transfer'
  | 'other'

export type Transaction = {
  _id: string
  transactionId: string
  userId: string
  customer: string
  amount: number
  status: TransactionStatus
  paymentMethod: PaymentMethod
  date: string
  createdAt: string
  updatedAt: string
}

export type CreateTransactionPayload = {
  transactionId: string
  userId: string
  customer: string
  amount: number
  status: TransactionStatus
  paymentMethod: PaymentMethod
  date?: string
}

export type UpdateTransactionPayload = {
  customer?: string
  amount?: number
  status?: TransactionStatus
  paymentMethod?: PaymentMethod
  date?: string
}

export type TransactionsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type GetTransactionsParams = {
  search?: string
  status?: string
  paymentMethod?: string
  page?: number
  limit?: number
}