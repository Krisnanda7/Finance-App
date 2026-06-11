'use client'
import { Bell, Search, Plus } from 'lucide-react'
import { Profile } from '@/types'
import { useState } from 'react'
import TransactionModal from '@/components/transactions/TransactionModal'

interface Props { profile: Profile | null }

export default function Header({ profile }: Props) {
  const [openModal, setOpenModal] = useState(false)

  const initials = profile?.full_name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U'

  return (
    <>
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Cari transaksi..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setOpenModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Transaksi
          </button>

          <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
        </div>
      </header>

      <TransactionModal open={openModal} onClose={() => setOpenModal(false)} />
    </>
  )
}