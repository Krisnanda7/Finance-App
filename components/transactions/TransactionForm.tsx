'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Account, Category } from '@/types'

const schema = z.object({
  amount: z.number().positive('Jumlah harus lebih dari 0'),
  type: z.enum(['income', 'expense', 'transfer']),
  account_id: z.string().min(1, 'Pilih akun'),
  category_id: z.string().optional(),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  date: z.string(),
  note: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  accounts: Account[]
  categories: Category[]
  onSuccess: () => void
}

export default function TransactionForm({ accounts, categories, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'expense', date: new Date().toISOString().split('T')[0] }
  })

  const selectedType = watch('type')
  const filteredCategories = categories.filter(c => c.type === selectedType)

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, amount: Number(data.amount) }),
      })
      if (!res.ok) throw new Error('Gagal menyimpan transaksi')
      onSuccess()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Tipe transaksi */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
        {(['expense', 'income', 'transfer'] as const).map(type => (
          <label key={type} className={`flex-1 py-2 text-center text-sm font-medium rounded-md cursor-pointer transition-all
            ${selectedType === type ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
            <input type="radio" value={type} {...register('type')} className="hidden" />
            {type === 'expense' ? 'Pengeluaran' : type === 'income' ? 'Pemasukan' : 'Transfer'}
          </label>
        ))}
      </div>

      {/* Jumlah */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
        <input
          type="number"
          {...register('amount', { valueAsNumber: true })}
          placeholder="0"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
      </div>

      {/* Akun */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dari Akun</label>
        <select {...register('account_id')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Pilih akun</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        {errors.account_id && <p className="text-red-500 text-xs mt-1">{errors.account_id.message}</p>}
      </div>

      {/* Kategori */}
      {selectedType !== 'transfer' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
          <select {...register('category_id')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Pilih kategori</option>
            {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {/* Deskripsi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
        <input
          {...register('description')}
          placeholder="Makan siang, bayar listrik..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
      </div>

      {/* Tanggal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
        <input
          type="date"
          {...register('date')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
      </button>
    </form>
  )
}