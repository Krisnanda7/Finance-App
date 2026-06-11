'use client'
import { useState } from 'react'
import { Budget, Category } from '@/types'
import { Plus, AlertTriangle, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, startOfMonth, endOfMonth } from 'date-fns'

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const schema = z.object({
  name: z.string().min(1),
  category_id: z.string().optional(),
  amount: z.number().positive(),
  period: z.enum(['monthly', 'weekly', 'yearly']),
  alert_threshold: z.number().min(1).max(100).default(80),
  start_date: z.string(),
  end_date: z.string(),
})

type FormData = z.infer<typeof schema>

interface Props { initialBudgets: Budget[]; categories: Category[] }

export default function BudgetsClient({ initialBudgets, categories }: Props) {
  const supabase = createClient()
  const [budgets, setBudgets] = useState(initialBudgets)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const now = new Date()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      period: 'monthly',
      alert_threshold: 80,
      start_date: format(startOfMonth(now), 'yyyy-MM-dd'),
      end_date: format(endOfMonth(now), 'yyyy-MM-dd'),
    }
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: budget, error } = await supabase
      .from('budgets')
      .insert({ ...data, user_id: user!.id, spent: 0 })
      .select('*, category(*)').single()
    if (!error && budget) { setBudgets(prev => [budget, ...prev]); reset(); setShowForm(false) }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus anggaran ini?')) return
    await supabase.from('budgets').delete().eq('id', id)
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Anggaran</h1>
          <p className="text-gray-500 text-sm mt-0.5">{budgets.length} anggaran aktif</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Buat Anggaran
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {budgets.length === 0 && (
          <div className="col-span-full bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">
            Belum ada anggaran. Buat anggaran pertama Anda!
          </div>
        )}
        {budgets.map(b => {
          const pct = Math.min((b.spent / b.amount) * 100, 100)
          const over = b.spent > b.amount
          const warn = pct >= b.alert_threshold && !over
          const ok = !over && !warn
          const StatusIcon = over ? XCircle : warn ? AlertTriangle : CheckCircle
          const statusColor = over ? 'text-red-500' : warn ? 'text-amber-500' : 'text-emerald-500'
          return (
            <div key={b.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{b.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{b.category?.name ?? 'Semua kategori'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                  <button onClick={() => handleDelete(b.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={`font-semibold ${over ? 'text-red-600' : 'text-gray-800'}`}>{fmt(b.spent)}</span>
                  <span className="text-gray-400">dari {fmt(b.amount)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${over ? 'bg-red-500' : warn ? 'bg-amber-400' : 'bg-emerald-500'}`}
                    style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{Math.round(pct)}% terpakai</span>
                  <span>Sisa {fmt(Math.max(b.amount - b.spent, 0))}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span className="capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                  {b.period === 'monthly' ? 'Bulanan' : b.period === 'weekly' ? 'Mingguan' : 'Tahunan'}
                </span>
                <span>{format(new Date(b.start_date), 'd MMM')} – {format(new Date(b.end_date), 'd MMM yyyy')}</span>
              </div>
            </div>
          )
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Buat Anggaran Baru</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Anggaran</label>
                <input {...register('name')} placeholder="Makan bulan ini, Transportasi..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori (opsional)</label>
                <select {...register('category_id')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Semua pengeluaran</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batas Anggaran (Rp)</label>
                <input type="number" {...register('amount', { valueAsNumber: true })} placeholder="1000000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mulai</label>
                  <input type="date" {...register('start_date')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selesai</label>
                  <input type="date" {...register('end_date')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batas peringatan: <span className="text-blue-600">{80}%</span>
                </label>
                <input type="range" {...register('alert_threshold', { valueAsNumber: true })}
                  min="50" max="95" step="5"
                  className="w-full accent-blue-600" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}