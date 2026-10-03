import { useCallback, useEffect, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiTrendingUp,
} from "react-icons/fi";

import TransactionFormModal from "../components/transactions/TransactionFormModal";

import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../services/transactionApi";

import type {
  CreateTransactionPayload,
  PaymentMethod,
  Transaction,
  TransactionStatus,
  UpdateTransactionPayload,
} from "../types/transaction.types";

import { getUser } from "../utils/authStorage";

const RevenuePage = () => {
  const currentUser = getUser();

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const canCreateOrEdit =
    currentUser?.role === "Admin" || currentUser?.role === "Manager";

  const canDelete = currentUser?.role === "Admin";

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getTransactions({
        search: search || undefined,
        status: statusFilter || undefined,
        paymentMethod: paymentMethodFilter || undefined,
        page,
        limit: 10,
      });

      if (!response.success) {
        setError(response.message);
        return;
      }

      setTransactions(response.data);

      setTotalTransactions(response.pagination.total);

      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "Failed to fetch transactions",
      );
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, paymentMethodFilter, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handlePaymentMethodFilter = (value: string) => {
    setPaymentMethodFilter(value);
    setPage(1);
  };

  const openCreateModal = () => {
    setSelectedTransaction(null);
    setIsModalOpen(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (actionLoading) return;

    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleSubmit = async (data: {
    transactionId: string;
    userId: string;
    customer: string;
    amount: number;
    status: TransactionStatus;
    paymentMethod: PaymentMethod;
    date?: string;
  }) => {
    try {
      setActionLoading(true);
      setError("");

      if (selectedTransaction) {
        const payload: UpdateTransactionPayload = {
          customer: data.customer,
          amount: data.amount,
          status: data.status,
          paymentMethod: data.paymentMethod,
          date: data.date,
        };

        const response = await updateTransaction(
          selectedTransaction._id,
          payload,
        );

        if (!response.success) {
          setError(response.message);
          return;
        }
      } else {
        const payload: CreateTransactionPayload = {
          transactionId: data.transactionId,
          userId: data.userId,
          customer: data.customer,
          amount: data.amount,
          status: data.status,
          paymentMethod: data.paymentMethod,
          date: data.date,
        };

        const response = await createTransaction(payload);

        if (!response.success) {
          setError(response.message);
          return;
        }
      }

      setIsModalOpen(false);
      setSelectedTransaction(null);

      await fetchTransactions();
    } catch (error: any) {
      setError(error?.response?.data?.message || "Failed to save transaction");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (transaction: Transaction) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete transaction ${transaction.transactionId}?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await deleteTransaction(transaction._id);

      if (!response.success) {
        setError(response.message);
        return;
      }

      await fetchTransactions();
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "Failed to delete transaction",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatPaymentMethod = (method: PaymentMethod) => {
    if (method === "bank_transfer") {
      return "Bank Transfer";
    }

    if (method === "upi") {
      return "UPI";
    }

    if (method === "card") {
      return "Card";
    }

    return "Other";
  };

  const getStatusClass = (status: TransactionStatus) => {
    if (status === "completed") {
      return "bg-green-50 text-green-700";
    }

    if (status === "pending") {
      return "bg-yellow-50 text-yellow-700";
    }

    return "bg-red-50 text-red-600";
  };

  const formatStatus = (status: TransactionStatus) => {
    if (status === "completed") {
      return "Completed";
    }

    if (status === "pending") {
      return "Pending";
    }

    return "Failed";
  };

  const totalAmount = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

  const completedAmount = transactions
    .filter((transaction) => transaction.status === "completed")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const pendingAmount = transactions
    .filter((transaction) => transaction.status === "pending")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Revenue</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage transactions and revenue activity
          </p>
        </div>

        {canCreateOrEdit && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#020542] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#03065c]"
          >
            <FiPlus size={18} />
            Add Transaction
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="font-medium hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Transactions</p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalTransactions}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FiTrendingUp size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Current Page Revenue</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            $
            {totalAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Completed</p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            $
            {completedAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Pending</p>

          <p className="mt-2 text-2xl font-bold text-yellow-600">
            $
            {pendingAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <FiSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search transaction or customer..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#020542] focus:ring-2 focus:ring-[#020542]/10"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(event) => handleStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#020542]"
          >
            <option value="">All Status</option>

            <option value="completed">Completed</option>

            <option value="pending">Pending</option>

            <option value="failed">Failed</option>
          </select>

          {/* Payment */}
          <select
            value={paymentMethodFilter}
            onChange={(event) => handlePaymentMethodFilter(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#020542]"
          >
            <option value="">All Payment Methods</option>

            <option value="card">Card</option>

            <option value="upi">UPI</option>

            <option value="bank_transfer">Bank Transfer</option>

            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-sm text-slate-500">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <FiTrendingUp size={24} className="text-slate-400" />
            </div>

            <h3 className="text-base font-semibold text-slate-900">
              No transactions found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Transaction
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Payment
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-900">
                          {transaction.transactionId}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700">
                          {transaction.customer}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-900">
                          $
                          {transaction.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            transaction.status,
                          )}`}
                        >
                          {formatStatus(transaction.status)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatPaymentMethod(transaction.paymentMethod)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {canCreateOrEdit && (
                            <button
                              type="button"
                              onClick={() => openEditModal(transaction)}
                              disabled={actionLoading}
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                              title="Edit transaction"
                            >
                              <FiEdit2 size={17} />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDelete(transaction)}
                              disabled={actionLoading}
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              title="Delete transaction"
                            >
                              <FiTrash2 size={17} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row">
              <p className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() =>
                    setPage((current) => Math.min(current + 1, totalPages))
                  }
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionFormModal
        isOpen={isModalOpen}
        transaction={selectedTransaction}
        loading={actionLoading}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default RevenuePage;
