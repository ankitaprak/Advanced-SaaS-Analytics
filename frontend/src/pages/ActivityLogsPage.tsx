import { useCallback, useEffect, useState } from 'react'
import {
  FiActivity,
  FiFilter,
  FiRefreshCw,
} from 'react-icons/fi'

import {
  getActivityLogs,
  type GetActivityLogsParams,
} from '../services/activityLogApi'

import type {
  ActivityAction,
  ActivityLog,
  ActivityModule,
} from '../types/activityLog.types'

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [moduleFilter, setModuleFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const params: GetActivityLogsParams = {
        module: moduleFilter || undefined,
        action: actionFilter || undefined,
        page,
        limit: 10,
      }

      const response = await getActivityLogs(params)

      if (!response.success) {
        setError(response.message)
        return
      }

      setLogs(response.data)
      setTotalPages(response.pagination.totalPages)
      setTotalLogs(response.pagination.total)
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          'Failed to fetch activity logs',
      )
    } finally {
      setLoading(false)
    }
  }, [moduleFilter, actionFilter, page])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleModuleChange = (
    value: string,
  ) => {
    setModuleFilter(value)
    setPage(1)
  }

  const handleActionChange = (
    value: string,
  ) => {
    setActionFilter(value)
    setPage(1)
  }

  const getActionClass = (
    action: ActivityAction,
  ) => {
    if (action === 'create') {
      return 'bg-green-50 text-green-700'
    }

    if (action === 'update') {
      return 'bg-blue-50 text-blue-700'
    }

    if (action === 'delete') {
      return 'bg-red-50 text-red-700'
    }

    return 'bg-slate-100 text-slate-600'
  }

  const getModuleClass = (
    module: ActivityModule,
  ) => {
    if (module === 'user') {
      return 'bg-purple-50 text-purple-700'
    }

    if (module === 'transaction') {
      return 'bg-blue-50 text-blue-700'
    }

    if (module === 'notification') {
      return 'bg-orange-50 text-orange-700'
    }

    return 'bg-slate-100 text-slate-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Activity Logs
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track user actions across the platform
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <FiRefreshCw
            size={17}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FiActivity size={21} />
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Total Activities
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {totalLogs}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <FiFilter size={17} />
          Filters
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <select
            value={moduleFilter}
            onChange={(event) =>
              handleModuleChange(
                event.target.value,
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#020542]"
          >
            <option value="">
              All Modules
            </option>
            <option value="user">User</option>
            <option value="transaction">
              Transaction
            </option>
            <option value="notification">
              Notification
            </option>
            <option value="report">Report</option>
            <option value="analytics">
              Analytics
            </option>
            <option value="dashboard">
              Dashboard
            </option>
          </select>

          <select
            value={actionFilter}
            onChange={(event) =>
              handleActionChange(
                event.target.value,
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#020542]"
          >
            <option value="">
              All Actions
            </option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="view">View</option>
            <option value="export">Export</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-sm text-slate-500">
              Loading activity logs...
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <FiActivity
                size={24}
                className="text-slate-400"
              />
            </div>

            <h3 className="text-base font-semibold text-slate-900">
              No activity logs found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              User and transaction actions will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      User
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Module
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Description
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr
                      key={log._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {log.userId?.name ||
                              'Unknown User'}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {log.userId?.email ||
                              '-'}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getActionClass(
                            log.action,
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getModuleClass(
                            log.module,
                          )}`}
                        >
                          {log.module}
                        </span>
                      </td>

                      <td className="max-w-md px-6 py-4 text-sm text-slate-600">
                        {log.description}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {new Date(
                          log.createdAt,
                        ).toLocaleString()}
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

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={
                    page <= 1 || loading
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.max(
                        current - 1,
                        1,
                      ),
                    )
                  }
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    page >= totalPages ||
                    loading
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        current + 1,
                        totalPages,
                      ),
                    )
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
    </div>
  )
}

export default ActivityLogsPage