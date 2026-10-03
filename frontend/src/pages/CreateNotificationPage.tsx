import { useEffect, useState } from 'react'
import {
  FaBell,
  FaCheckCircle,
} from 'react-icons/fa'

import {
  createNotification,
} from '../services/notificationApi'

import type {
  NotificationType,
} from '../services/notificationApi'

import {
  getUsers,
} from '../services/userApi'

import type {
  User,
} from '../types/user.types'

function CreateNotificationPage() {
  const [users, setUsers] = useState<User[]>([])
  const [userId, setUserId] = useState('')

  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  const [type, setType] =
    useState<NotificationType>('info')

  const [loadingUsers, setLoadingUsers] =
    useState(true)

  const [loading, setLoading] =
    useState(false)

  const [successMessage, setSuccessMessage] =
    useState('')

  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true)

        const response = await getUsers({
          page: 1,
          limit: 100,
        })

        if (response.success) {
          setUsers(response.data)
        }
      } catch (error) {
        console.error(
          'Failed to fetch users:',
          error,
        )

        setError(
          'Failed to load users.',
        )
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [])

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault()

    setSuccessMessage('')
    setError('')

    if (!userId || !title || !message) {
      setError(
        'Please fill all required fields.',
      )
      return
    }

    try {
      setLoading(true)

      const response =
        await createNotification({
          userId,
          title,
          message,
          type,
        })

      if (!response.success) {
        setError(response.message)
        return
      }

      setSuccessMessage(
        'Notification created successfully.',
      )

      setUserId('')
      setTitle('')
      setMessage('')
      setType('info')
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          'Failed to create notification.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Create Notification
        </h1>

        <p className="mt-1 text-slate-500">
          Send a notification to a dashboard user.
        </p>
      </div>

      <div className="mt-6 max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <FaBell size={18} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              New Notification
            </h2>

            <p className="text-sm text-slate-500">
              Create an in-app notification.
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <FaCheckCircle />

            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Select User
            </label>

            <select
              value={userId}
              onChange={(event) =>
                setUserId(event.target.value)
              }
              disabled={loadingUsers}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">
                {loadingUsers
                  ? 'Loading users...'
                  : 'Select a user'}
              </option>

              {users.map((user) => (
                <option
                  key={user._id}
                  value={user._id}
                >
                  {user.name} — {user.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. New transaction received"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Message
            </label>

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Enter notification message"
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Notification Type
            </label>

            <select
              value={type}
              onChange={(event) =>
                setType(
                  event.target.value as NotificationType,
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="info">
                Information
              </option>

              <option value="success">
                Success
              </option>

              <option value="warning">
                Warning
              </option>

              <option value="error">
                Error
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={
              loading || loadingUsers
            }
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? 'Creating...'
              : 'Create Notification'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateNotificationPage