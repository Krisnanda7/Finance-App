'use client'
import { TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react'

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

interface Props {
  totalBalance: number
  monthIncome: number
  monthExpense: number
  accountCount: number
}

export default function SummaryCards({ totalBalance, monthIncome, monthExpense, accountCount }: Props) {
  const cards = [
    {
      label: 'Total Saldo',
      value: formatIDR(totalBalance),
      icon: Wallet,
      color: 'bg-blue-500',
      change: `${accountCount} akun aktif`,
    },
    {
      label: 'Pemasukan Bulan Ini',
      value: formatIDR(monthIncome),
      icon: TrendingUp,
      color: 'bg-emerald-500',
      change: '+12% dari bulan lalu',
    },
    {
      label: 'Pengeluaran Bulan Ini',
      value: formatIDR(monthExpense),
      icon: TrendingDown,
      color: 'bg-red-500',
      change: '-5% dari bulan lalu',
    },
    {
      label: 'Sisa Anggaran',
      value: formatIDR(monthIncome - monthExpense),
      icon: CreditCard,
      color: monthIncome - monthExpense >= 0 ? 'bg-purple-500' : 'bg-orange-500',
      change: monthIncome - monthExpense >= 0 ? 'Surplus' : 'Defisit',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">{card.label}</span>
            <div className={`${card.color} p-2 rounded-lg`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900">{card.value}</p>
          <p className="text-xs text-gray-400 mt-1">{card.change}</p>
        </div>
      ))}
    </div>
  )
}