import type { ReactNode } from 'react'
import Card from '../common/Card'

type StatCardProps = {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  icon: ReactNode
}

function StatCard({
  title,
  value,
  change,
  changeType,
  icon,
}: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>

      <h3 className="mt-4 text-2xl font-bold text-slate-900">
        {value}
      </h3>

      <p
        className={`mt-2 text-sm font-medium ${
          changeType === 'positive'
            ? 'text-emerald-600'
            : 'text-red-600'
        }`}
      >
        {change}
      </p>
    </Card>
  )
}

export default StatCard