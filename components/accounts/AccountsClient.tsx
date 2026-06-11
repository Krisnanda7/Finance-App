'use client'
import { useState } from 'react'
import { Account, AccountType } from '@/types'
import { Plus, Wallet, CreditCard, TrendingUp, Smartphone, Banknote, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const accountIcons: Record<AccountType, React.ReactNode> = {
  cash: <Banknote className="w-5 h-5" />,
  bank: <Wallet className="w-5 h-5" />,
  credit: <CreditCard className="w-5 h-5" />,
  investment: <TrendingUp className="w-5 h-5" />,
  ewallet: <Smartphone className="w-5 h-5" />,
}

const accountColors: Record<AccountType, string> = {
  cash: 'bg-emerald-500',
  bank: 'bg-blue-500',
  credit: 'bg-red-500',
  investment: 'bg-purple-500',
  ewallet: 'bg-orange-500',
}

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  type: z.enum(['cash', 'bank', 'credit', 'investment', 'ewallet']),
  balance: z.number(),
  currency: z.string().default('IDR'),
  color: z.string().default('#3B82F6'),
})

type FormData = z.infer<typeof schema>

interface Props { initialAccounts: Account[] }

export default function AccountsClient({ initialAccounts }: Props) {
  const supabase = createClient()
  const [accounts, setAccounts] = useState(initialAccounts)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'bank', balance: 0, currency: 'IDR', color: '#3B82F6' }
  })

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: acc, error } = await supabase
      .from('accounts')
      .insert({ ...data, user_id: user!.id })
      .select().single()
    if (!error && acc) {
      setAccounts(prev => [...prev, acc])
      reset()
      setShowForm(false)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus akun ini? Semua transaksi terkait akan terputus.')) return
    await supabase.from('accounts').delete().eq('id', id)
    setAccounts(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Akun & Dompet</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Total saldo: <span className="font-semibold text-gray-800">{fmt(totalBalance)}</span>
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Tambah Akun
        </button>
      </div>

      {/* Account cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 group">
            <div className="flex items-start justify-between mb-4">
              <div className={`${accountColors[acc.type]} p-2.5 rounded-xl text-white`}>
                {accountIcons[acc.type]}
              </div>
              <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-all">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(acc.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 capitalize">
              {acc.type === 'bank' ? 'Rekening Bank' :
               acc.type === 'cash' ? 'Uang Tunai' :
               acc.type === 'credit' ? 'Kartu Kredit' :
               acc.type === 'investment' ? 'Investasi' : 'Dompet Digital'}
            </p>
            <p className="font-semibold text-gray-900 mt-0.5">{acc.name}</p>
            <p className={`text-xl font-bold mt-3 ${acc.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {fmt(acc.balance)}
            </p>
          </div>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Tambah Akun Baru</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Akun</label>
                <input {...register('name')} placeholder="BCA Utama, GoPay..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Akun</label>
                <select {...register('type')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="bank">Rekening Bank</option>
                  <option value="cash">Uang Tunai</option>
                  <option value="credit">Kartu Kredit</option>
                  <option value="ewallet">Dompet Digital</option>
                  <option value="investment">Investasi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Awal (Rp)</label>
                <input type="number" {...register('balance', { valueAsNumber: true })} defaultValue={0}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
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