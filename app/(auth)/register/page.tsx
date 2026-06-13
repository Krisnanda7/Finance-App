'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Cek email Anda!</h2>
        <p className="text-gray-500 text-sm mb-4">Link konfirmasi dikirim ke <strong>{email}</strong></p>
        <Link href="/login" className="text-blue-600 font-medium hover:underline text-sm">Kembali ke login</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Buat akun baru</h1>
        <p className="text-gray-500 text-sm mb-6">Mulai kelola keuangan Anda</p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Nama Lengkap</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="John Doe" required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="nama@email.com" required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 text-sm">
            {loading ? 'Mendaftar...' : 'Buat Akun'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  )
}