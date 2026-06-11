import { Budget } from '@/types'
import Link from 'next/link'

interface Props { budgets: Budget[] }

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(n)

export default function BudgetOverview({ budgets }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">Anggaran</h3>
        <Link href="/budgets" className="text-sm text-blue-600 hover:underline font-medium">Kelola</Link>
      </div>

      {budgets.length === 0 ? (
        <div className="px-5 py-10 text-center text-gray-400 text-sm">
          Belum ada anggaran aktif
        </div>
      ) : (
        <div className="px-5 py-4 space-y-4">
          {budgets.map(b => {
            const pct = Math.min((b.spent / b.amount) * 100, 100)
            const over = b.spent > b.amount
            const warn = pct >= b.alert_threshold
            return (
              <div key={b.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700 truncate flex-1">{b.name}</span>
                  <span className={`text-xs font-semibold ml-2 ${over ? 'text-red-600' : warn ? 'text-amber-600' : 'text-gray-500'}`}>
                    {Math.round(pct)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      over ? 'bg-red-500' : warn ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">Rp {fmt(b.spent)}</span>
                  <span className="text-xs text-gray-400">Rp {fmt(b.amount)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}