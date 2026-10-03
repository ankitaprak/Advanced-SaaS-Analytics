import api from './api'

import type {
  Transaction,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  GetTransactionsParams,
  TransactionsPagination,
} from '../types/transaction.types'

export type TransactionsResponse = {
  success: boolean
  message: string
  data: Transaction[]
  pagination: TransactionsPagination
}

export type TransactionResponse = {
  success: boolean
  message: string
  data: Transaction
}

export type DeleteTransactionResponse = {
  success: boolean
  message: string
}

export const getTransactions = async (
  params?: GetTransactionsParams,
): Promise<TransactionsResponse> => {
  const response =
    await api.get<TransactionsResponse>(
      '/transactions',
      {
        params,
      },
    )

  return response.data
}

export const getTransactionById = async (
  id: string,
): Promise<TransactionResponse> => {
  const response =
    await api.get<TransactionResponse>(
      `/transactions/${id}`,
    )

  return response.data
}

export const createTransaction = async (
  payload: CreateTransactionPayload,
): Promise<TransactionResponse> => {
  const response =
    await api.post<TransactionResponse>(
      '/transactions',
      payload,
    )

  return response.data
}

export const updateTransaction = async (
  id: string,
  payload: UpdateTransactionPayload,
): Promise<TransactionResponse> => {
  const response =
    await api.put<TransactionResponse>(
      `/transactions/${id}`,
      payload,
    )

  return response.data
}

export const deleteTransaction = async (
  id: string,
): Promise<DeleteTransactionResponse> => {
  const response =
    await api.delete<DeleteTransactionResponse>(
      `/transactions/${id}`,
    )

  return response.data
}