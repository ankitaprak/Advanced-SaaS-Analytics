import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { FiX } from "react-icons/fi";

import type { User, UserRole, UserStatus } from "../../types/user.types";

type UserFormModalProps = {
  isOpen: boolean;
  user: User | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    status: UserStatus;
  }) => void;
};

const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const UserFormModal = ({
  isOpen,
  user,
  loading,
  onClose,
  onSubmit,
}: UserFormModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Viewer");
  const [status, setStatus] = useState<UserStatus>("Active");
  const [error, setError] = useState("");

  const isEditMode = Boolean(user);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword("");
      setRole(user.role);
      setStatus(user.status);
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setRole("Viewer");
      setStatus("Active");
    }

    setError("");
  }, [isOpen, user]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    // Do not allow leading or trailing spaces
    if (name !== name.trim()) {
      setError("Name cannot start or end with a space");
      return;
    }

    if (email !== email.trim()) {
      setError("Email cannot start or end with a space");
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // Required fields
    if (!trimmedName || !trimmedEmail) {
      setError("Name and email are required");
      return;
    }

    // Minimum name length
    if (trimmedName.length < 3) {
      setError("Name must be at least 3 characters");
      return;
    }

    // Name validation
    if (!nameRegex.test(trimmedName)) {
      setError(
        "Name can contain only letters and single spaces between words",
      );
      return;
    }

    // Email validation
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    // Password required only when creating a user
    if (!isEditMode && !password) {
      setError("Password is required");
      return;
    }

    // Password length
    if (password && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    onSubmit({
      name: trimmedName,
      email: trimmedEmail,
      password: password || undefined,
      role,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditMode ? "Edit User" : "Add User"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditMode
                ? "Update user information"
                : "Create a new platform user"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter user name"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#020542] focus:ring-2 focus:ring-[#020542]/10"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter email address"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#020542] focus:ring-2 focus:ring-[#020542]/10"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password

              {isEditMode && (
                <span className="ml-2 text-xs font-normal text-slate-400">
                  Leave empty to keep current password
                </span>
              )}
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={
                isEditMode ? "Enter new password" : "Enter password"
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#020542] focus:ring-2 focus:ring-[#020542]/10"
            />
          </div>

          {/* Role + Status */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Role
              </label>

              <select
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as UserRole)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#020542]"
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as UserStatus)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#020542]"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#020542] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#03065c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Saving..."
                : isEditMode
                  ? "Update User"
                  : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;