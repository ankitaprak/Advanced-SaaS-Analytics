type DateRange = '7' | '30' | '90' | '365'

type DateRangeFilterProps = {
  value: DateRange
  onChange: (value: DateRange) => void
}

function DateRangeFilter({
  value,
  onChange,
}: DateRangeFilterProps) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value as DateRange)
      }
      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-blue-500"
    >
      <option value="7">Last 7 Days</option>
      <option value="30">Last 30 Days</option>
      <option value="90">Last 90 Days</option>
      <option value="365">This Year</option>
    </select>
  )
}

export default DateRangeFilter