import type { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
}

function Button({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
}: ButtonProps) {
  const variantClasses = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700',
    secondary:
      'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    danger:
      'bg-red-600 text-white hover:bg-red-700',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]}`}
    >
      {children}
    </button>
  )
}

export default Button