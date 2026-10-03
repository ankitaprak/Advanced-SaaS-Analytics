import type { ReactNode } from "react"

type EmptyStateProps = {
  title?: string
  message?: string
  icon?: ReactNode
}

function EmptyState({
  title = 'No data found',
  message = 'There is no data available to display.',
  icon,
}: EmptyStateProps) {

    return(
        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            {icon && (
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">{icon}
                </div>
            )}

            <h3 className="text-base font-semibold text-slate-800">
                {title}
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
                {message}
            </p>
        </div>
    )
}

export default EmptyState