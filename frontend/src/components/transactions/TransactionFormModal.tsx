import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  FiCalendar,
  FiCreditCard,
  FiDollarSign,
  FiUser,
  FiX,
} from 'react-icons/fi'

import type {
  PaymentMethod,
  Transaction,
  TransactionStatus,
} from '../../types/transaction.types'

import { getUsers } from '../../services/userApi'
import type { User } from '../../types/user.types'

type TransactionFormModalProps = {
  isOpen: boolean
  transaction: Transaction | null
  loading: boolean
  onClose: () => void
  onSubmit: (data: {
    transactionId: string
    userId: string
    customer: string
    amount: number
    status: TransactionStatus
    paymentMethod: PaymentMethod
    date?: string
  }) => void
}

const transactionIdRegex =
  /^[A-Za-z0-9_-]+$/

const customerNameRegex =
  /^[A-Za-z]+(?: [A-Za-z]+)*$/

const TransactionFormModal = ({
  isOpen,
  transaction,
  loading,
  onClose,
  onSubmit,
}: TransactionFormModalProps) => {
  const [transactionId, setTransactionId] =
    useState('')

  const [userId, setUserId] =
    useState('')

  const [customer, setCustomer] =
    useState('')

  const [amount, setAmount] =
    useState('')

  const [status, setStatus] =
    useState<TransactionStatus>('pending')

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('card')

  const [date, setDate] =
    useState('')

  const [error, setError] =
    useState('')

  const [users, setUsers] =
    useState<User[]>([])

  const [loadingUsers, setLoadingUsers] =
    useState(false)

  const isEditMode =
    Boolean(transaction)

  // -----------------------------------------
  // Fetch users when modal opens
  // -----------------------------------------
  useEffect(() => {
    if (!isOpen) return

    const fetchUsers = async () => {
      try {
        setLoadingUsers(true)
        setError('')

        const response =
          await getUsers({
            page: 1,
            limit: 100,
          })

        if (response.success) {
          setUsers(response.data)
        } else {
          setUsers([])
          setError(
            'Failed to load users.',
          )
        }
      } catch (error) {
        console.error(
          'Failed to fetch users:',
          error,
        )

        setUsers([])
        setError(
          'Failed to load users.',
        )
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [isOpen])

  // -----------------------------------------
  // Load transaction data
  // -----------------------------------------
  useEffect(() => {
    if (!isOpen) return

    if (transaction) {
      setTransactionId(
        transaction.transactionId,
      )

      setUserId(
        transaction.userId,
      )

      setCustomer(
        transaction.customer,
      )

      setAmount(
        String(transaction.amount),
      )

      setStatus(
        transaction.status,
      )

      setPaymentMethod(
        transaction.paymentMethod,
      )

      setDate(
        transaction.date
          ? new Date(
              transaction.date,
            )
              .toISOString()
              .split('T')[0]
          : '',
      )
    } else {
      setTransactionId('')
      setUserId('')
      setCustomer('')
      setAmount('')
      setStatus('pending')
      setPaymentMethod('card')

      setDate(
        new Date()
          .toISOString()
          .split('T')[0],
      )
    }

    setError('')
  }, [isOpen, transaction])

  if (!isOpen) {
    return null
  }

  // -----------------------------------------
  // Form validation
  // -----------------------------------------
  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setError('')

    // Transaction ID
    if (
      !isEditMode &&
      !transactionId.trim()
    ) {
      setError(
        'Transaction ID is required',
      )
      return
    }

    if (
      !isEditMode &&
      transactionId !==
        transactionId.trim()
    ) {
      setError(
        'Transaction ID cannot start or end with a space',
      )
      return
    }

    const trimmedTransactionId =
      transactionId.trim()

    if (
      !isEditMode &&
      trimmedTransactionId.length < 3
    ) {
      setError(
        'Transaction ID must be at least 3 characters',
      )
      return
    }

    if (
      !isEditMode &&
      !transactionIdRegex.test(
        trimmedTransactionId,
      )
    ) {
      setError(
        'Transaction ID can contain only letters, numbers, hyphens and underscores',
      )
      return
    }

    // User
    if (!userId) {
      setError(
        'Please select a user',
      )
      return
    }

    // Customer
    if (!customer.trim()) {
      setError(
        'Customer name is required',
      )
      return
    }

    if (
      customer !== customer.trim()
    ) {
      setError(
        'Customer name cannot start or end with a space',
      )
      return
    }

    const trimmedCustomer =
      customer.trim()

    if (
      trimmedCustomer.length < 2
    ) {
      setError(
        'Customer name must be at least 2 characters',
      )
      return
    }

    if (
      !customerNameRegex.test(
        trimmedCustomer,
      )
    ) {
      setError(
        'Customer name can contain only letters and single spaces between words',
      )
      return
    }

    // Amount
    if (!amount.trim()) {
      setError(
        'Amount is required',
      )
      return
    }

    const numericAmount =
      Number(amount)

    if (
      !Number.isFinite(
        numericAmount,
      )
    ) {
      setError(
        'Please enter a valid amount',
      )
      return
    }

    if (numericAmount <= 0) {
      setError(
        'Amount must be greater than 0',
      )
      return
    }

    // Date
    if (!date) {
      setError(
        'Transaction date is required',
      )
      return
    }

    // Submit
    onSubmit({
      transactionId:
        trimmedTransactionId,

      userId,

      customer:
        trimmedCustomer,

      amount:
        numericAmount,

      status,

      paymentMethod,

      date:
        date || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl">

        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-3">

              <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#020542]/10 text-[#020542] sm:flex">
                <FiCreditCard size={20} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                  {isEditMode
                    ? 'Edit Transaction'
                    : 'Add Transaction'}
                </h2>

                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  {isEditMode
                    ? 'Update transaction information'
                    : 'Create a new transaction'}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close transaction modal"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
          >
            <FiX size={21} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <span className="mt-0.5 font-semibold">
                    !
                  </span>

                  <p>{error}</p>
                </div>
              )}

              {/* Transaction ID */}
              <div>
                <label
                  htmlFor="transaction-id"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Transaction ID
                </label>

                <input
                  id="transaction-id"
                  type="text"
                  value={transactionId}
                  onChange={(event) =>
                    setTransactionId(
                      event.target.value,
                    )
                  }
                  disabled={isEditMode}
                  placeholder="e.g. TXN-10001"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#020542] focus:ring-4 focus:ring-[#020542]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                />

                {isEditMode && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Transaction ID cannot be changed.
                  </p>
                )}
              </div>

              {/* User */}
              <div>
                <label
                  htmlFor="transaction-user"
                  className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700"
                >
                  <FiUser size={15} />
                  User
                </label>

                <select
                  id="transaction-user"
                  value={userId}
                  onChange={(event) => {
                    const selectedUserId =
                      event.target.value

                    setUserId(
                      selectedUserId,
                    )

                    const selectedUser =
                      users.find(
                        (user) =>
                          user._id ===
                          selectedUserId,
                      )

                    if (selectedUser) {
                      setCustomer(
                        selectedUser.name,
                      )
                    }
                  }}
                  disabled={loadingUsers}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-[#020542] focus:ring-4 focus:ring-[#020542]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">
                    {loadingUsers
                      ? 'Loading users...'
                      : users.length === 0
                        ? 'No users available'
                        : 'Select a user'}
                  </option>

                  {users.map((user) => (
                    <option
                      key={user._id}
                      value={user._id}
                    >
                      {user.name} —{' '}
                      {user.email}
                    </option>
                  ))}
                </select>

                <p className="mt-1.5 text-xs text-slate-400">
                  Select the user associated with this transaction.
                </p>
              </div>

              {/* Customer */}
              <div>
                <label
                  htmlFor="customer"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Customer
                </label>

                <input
                  id="customer"
                  type="text"
                  value={customer}
                  onChange={(event) =>
                    setCustomer(
                      event.target.value,
                    )
                  }
                  placeholder="Enter customer name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#020542] focus:ring-4 focus:ring-[#020542]/10"
                />
              </div>

              {/* Amount */}
              <div>
                <label
                  htmlFor="amount"
                  className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700"
                >
                  <FiDollarSign size={15} />
                  Amount
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                    $
                  </span>

                  <input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(event) =>
                      setAmount(
                        event.target.value,
                      )
                    }
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-9 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#020542] focus:ring-4 focus:ring-[#020542]/10"
                  />
                </div>
              </div>

              {/* Status + Payment */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Status
                  </label>

                  <select
                    id="status"
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target
                          .value as TransactionStatus,
                      )
                    }
                    className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-[#020542] focus:ring-4 focus:ring-[#020542]/10"
                  >
                    <option value="completed">
                      Completed
                    </option>

                    <option value="pending">
                      Pending
                    </option>

                    <option value="failed">
                      Failed
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="payment-method"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Payment Method
                  </label>

                  <select
                    id="payment-method"
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target
                          .value as PaymentMethod,
                      )
                    }
                    className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition hover:border-[#020542] focus:ring-4 focus:ring-[#020542]/10"
                  >
                    <option value="card">
                      Card
                    </option>

                    <option value="upi">
                      UPI
                    </option>

                    <option value="bank_transfer">
                      Bank Transfer
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="transaction-date"
                  className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700"
                >
                  <FiCalendar size={15} />
                  Date
                </label>

                <input
                  id="transaction-date"
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-[#020542] focus:ring-4 focus:ring-[#020542]/10"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                loadingUsers
              }
              className="w-full rounded-xl bg-[#020542] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#03065c] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading
                ? 'Saving...'
                : isEditMode
                  ? 'Update Transaction'
                  : 'Create Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TransactionFormModal