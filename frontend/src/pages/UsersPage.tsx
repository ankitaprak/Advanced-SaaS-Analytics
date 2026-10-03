import { useCallback, useEffect, useState } from 'react'
import {
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUsers,
} from 'react-icons/fi'

import UserFormModal from '../components/users/UserFormModal'
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from '../services/userApi'
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserRole,
  UserStatus,
} from '../types/user.types'
import { getUser } from '../utils/authStorage'

const UsersPage = () => {
  const currentUser = getUser()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] =
    useState<User | null>(null)

  const canCreateOrEdit =
    currentUser?.role === 'Admin' ||
    currentUser?.role === 'Manager'

  const canDelete = currentUser?.role === 'Admin'

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      })

      if (!response.success) {
        setError(response.message)
        return
      }

      setUsers(response.data)
      setTotalPages(response.pagination.totalPages)
      setTotalUsers(response.pagination.total)
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          'Failed to fetch users',
      )
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, statusFilter, page])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = (
    value: string,
  ) => {
    setSearch(value)
    setPage(1)
  }

  const handleRoleFilter = (
    value: string,
  ) => {
    setRoleFilter(value)
    setPage(1)
  }

  const handleStatusFilter = (
    value: string,
  ) => {
    setStatusFilter(value)
    setPage(1)
  }

  const openCreateModal = () => {
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (actionLoading) return

    setIsModalOpen(false)
    setSelectedUser(null)
  }

  const handleSubmit = async (data: {
    name: string
    email: string
    password?: string
    role: UserRole
    status: UserStatus
  }) => {
    try {
      setActionLoading(true)
      setError('')

      if (selectedUser) {
        const payload: UpdateUserPayload = {
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status,
        }

        if (data.password) {
          payload.password = data.password
        }

        const response = await updateUser(
          selectedUser._id,
          payload,
        )

        if (!response.success) {
          setError(response.message)
          return
        }
      } else {
        const payload: CreateUserPayload = {
          name: data.name,
          email: data.email,
          password: data.password || '',
          role: data.role,
          status: data.status,
        }

        const response = await createUser(payload)

        if (!response.success) {
          setError(response.message)
          return
        }
      }

      setIsModalOpen(false)
      setSelectedUser(null)

      await fetchUsers()
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          'Failed to save user',
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (user: User) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`,
    )

    if (!confirmed) return

    try {
      setActionLoading(true)
      setError('')

      const response = await deleteUser(user._id)

      if (!response.success) {
        setError(response.message)
        return
      }

      await fetchUsers()
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          'Failed to delete user',
      )
    } finally {
      setActionLoading(false)
    }
  }

  const getRoleBadgeClass = (
    role: UserRole,
  ) => {
    if (role === 'Admin') {
      return 'bg-purple-50 text-purple-700'
    }

    if (role === 'Manager') {
      return 'bg-blue-50 text-blue-700'
    }

    return 'bg-slate-100 text-slate-600'
  }

  const getStatusBadgeClass = (
    status: UserStatus,
  ) => {
    if (status === 'Active') {
      return 'bg-green-50 text-green-700'
    }

    return 'bg-red-50 text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Users
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage platform users and their access
          </p>
        </div>

        {canCreateOrEdit && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#020542] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#03065c]"
          >
            <FiPlus size={18} />
            Add User
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError('')}
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
              <p className="text-sm text-slate-500">
                Total Users
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalUsers}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FiUsers size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Current Page
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {page}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Role Filter
          </p>

          <p className="mt-2 text-lg font-semibold text-slate-900">
            {roleFilter || 'All Roles'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Status Filter
          </p>

          <p className="mt-2 text-lg font-semibold text-slate-900">
            {statusFilter || 'All Status'}
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
              onChange={(event) =>
                handleSearch(event.target.value)
              }
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#020542] focus:ring-2 focus:ring-[#020542]/10"
            />
          </div>

          {/* Role */}
          <select
            value={roleFilter}
            onChange={(event) =>
              handleRoleFilter(event.target.value)
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#020542]"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Viewer">Viewer</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(event) =>
              handleStatusFilter(event.target.value)
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#020542]"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-sm text-slate-500">
              Loading users...
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <FiUsers
                size={24}
                className="text-slate-400"
              />
            </div>

            <h3 className="text-base font-semibold text-slate-900">
              No users found
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
                      User
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Role
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Joined
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {user.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {user.email}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeClass(
                            user.role,
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                            user.status,
                          )}`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(
                          user.joinedDate,
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {canCreateOrEdit && (
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(user)
                              }
                              disabled={actionLoading}
                              title="Edit user"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                            >
                              <FiEdit2 size={17} />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(user)
                              }
                              disabled={actionLoading}
                              title="Delete user"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
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
                  onClick={() =>
                    setPage((current) =>
                      Math.max(current - 1, 1),
                    )
                  }
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    page >= totalPages || loading
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

      {/* Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        user={selectedUser}
        loading={actionLoading}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default UsersPage