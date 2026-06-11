'use client'
import { useState } from 'react'
import { Profile } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { User, Bell, Shield, Palette, Check } from 'lucide-react'

interface Props { profile: Profile | null; userEmail: string }

export default function SettingsClient({ profile, userEmail }: Props) {
  const supabase = createClient()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [currency, setCurrency] = useState(profile?.currency ?? 'IDR')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('profiles').update({ full_name: fullName, currency }).eq('id', profile!.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'security', label: 'Keamanan', icon: Shield },
    { id: 'appearance', label: 'Tampilan', icon: Palette },
  ]

  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Pengaturan</h1>
        <p className="text-gray-500 text-sm mt-0.5">Kelola preferensi akun Anda</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-800">Informasi Profil</h2>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{fullName || 'Pengguna'}</p>
              <p className="text-xs text-gray-400">{userEmail}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={userEmail} disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mata Uang Utama</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="IDR">IDR — Rupiah Indonesia</option>
                <option value="USD">USD — US Dollar</option>
                <option value="SGD">SGD — Singapore Dollar</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-all">
            {saved ? <><Check className="w-4 h-4" /> Tersimpan!</> : saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-800">Notifikasi</h2>
          {[
            { label: 'Peringatan anggaran mendekati batas', desc: 'Notifikasi saat pengeluaran mencapai threshold' },
            { label: 'Ringkasan mingguan', desc: 'Laporan singkat setiap hari Minggu' },
            { label: 'Transaksi besar', desc: 'Notifikasi untuk transaksi di atas Rp 1.000.000' },
          ].map((item, i) => (
            <label key={i} className="flex items-start justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <div className="relative flex-shrink-0 ml-4">
                <input type="checkbox" defaultChecked={i === 0} className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
            </label>
          ))}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Keamanan</h2>
          <button className="w-full border border-gray-300 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 text-left px-4">
            Ubah Password
          </button>
          <button className="w-full border border-red-200 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 text-left px-4">
            Hapus Akun
          </button>
        </div>
      )}
    </div>
  )
}