'use client'
import { useState, useMemo } from 'react'
import { Transaction, Account, Category } from '@/types'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Plus, Filter, Trash2, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react'
import TransactionModal from './TransactionModal'
import { createClient } from '@/lib/supabase/client'

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

interface Props {
  initialTransactions: Transaction[]
  accounts: Account[]
  categories: Category[]
}

export default function TransactionListClient({ initialTransactions, accounts, categories }: Props) {
  const supabase = createClient()
  const [transactions, setTransactions] = useState(initialTransactions)
  const [openModal, setOpenModal] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCat, setFilterCat] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => transactions.filter(tx => {
    if (filterType !== 'all' && tx.type !== filterType) return false
    if (filterCat !== 'all' && tx.category_id !== filterCat) return false
    if (search && !tx.description?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [transactions, filterType, filterCat, search])

  const grouped = useMemo(() => {
    const map: Record<string, Transaction[]> = {}
    filtered.forEach(tx => {
      const key = tx.date
      if (!map[key]) map[key] = []
      map[key].push(tx)
    })
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return
    await supabase.from('transactions').delete().eq('id', id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Transaksi</h1>
          <p className="text-gray-500 text-sm mt-0.5">{transactions.length} transaksi total</p>
        </div>
        <button onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari deskripsi..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-40 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="all">Semua tipe</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
          <option value="transfer">Transfer</option>
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="all">Semua kategori</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Grouped list */}
      <div className="space-y-4">
        {grouped.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">
            Tidak ada transaksi ditemukan
          </div>
        )}
        {grouped.map(([date, txs]) => {
          const dayTotal = txs.reduce((s, t) => t.type === 'income' ? s + t.amount : t.type === 'expense' ? s - t.amount : s, 0)
          return (
            <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">
                  {format(new Date(date), 'EEEE, d MMMM yyyy', { locale: id })}
                </span>
                <span className={`text-sm font-semibold ${dayTotal >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {dayTotal >= 0 ? '+' : ''}{fmt(dayTotal)}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {txs.map(tx => (
                  <div key={tx.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 group">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      tx.type === 'income' ? 'bg-emerald-50' :
                      tx.type === 'expense' ? 'bg-red-50' : 'bg-blue-50'
                    }`}>
                      {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4 text-emerald-600" /> :
                       tx.type === 'expense' ? <ArrowDownLeft className="w-4 h-4 text-red-500" /> :
                       <ArrowLeftRight className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{tx.description}</p>
                      <p className="text-xs text-gray-400">{tx.category?.name ?? '—'} · {tx.account?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${
                        tx.type === 'income' ? 'text-emerald-600' :
                        tx.type === 'expense' ? 'text-red-500' : 'text-blue-500'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                      </span>
                      <button onClick={() => handleDelete(tx.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <TransactionModal open={openModal} onClose={() => setOpenModal(false)} />
    </div>
  )
}