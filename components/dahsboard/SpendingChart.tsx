'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Transaction } from '@/types'
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import { id } from 'date-fns/locale'

interface Props { transactions: Transaction[] }

export default function SpendingChart({ transactions }: Props) {
  const now = new Date()
  const days = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) })

  const data = days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const dayTx = transactions.filter(t => t.date === dayStr)
    return {
      date: format(day, 'd MMM', { locale: id }),
      pemasukan: dayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      pengeluaran: dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }
  }).filter(d => d.pemasukan > 0 || d.pengeluaran > 0)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(value)

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Arus Kas Bulan Ini</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
          <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}