'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface AuthFormProps {
  mode: 'login' | 'register'
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'register' && formData.password !== formData.confirmPassword) {
        throw new Error('Password tidak cocok')
      }

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Email atau password salah. Jika Anda belum punya akun, silakan klik "Daftar" di bawah.')
          }
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Email belum dikonfirmasi. Silakan periksa kotak masuk email Anda atau matikan "Confirm Email" di Supabase Dashboard.')
          }
          throw error
        }
        
        router.refresh()
        router.push('/chat')
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })
        
        if (error) throw error

        router.refresh()
        if (data.session) {
          router.push('/chat')
        } else {
          setError('Pendaftaran berhasil! Jika Anda perlu konfirmasi email, silakan cek email Anda. Atau Anda dapat langsung mencoba masuk.')
          setTimeout(() => router.push('/login'), 3000)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat masuk')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto fade-in-up">
      {/* Boarding Pass Style Card */}
      <div className="boarding-pass-card p-8">
        {/* Header dengan perforation line */}
        <div className="mb-8">
          <h1 className="text-2xl font-fraunces font-semibold text-center text-foreground mb-2">
            {mode === 'login' ? 'Masuk ke TravelMate' : 'Daftar Akun Baru'}
          </h1>
          <p className="text-sm text-muted-foreground text-center font-space-grotesk">
            {mode === 'login' 
              ? 'Masuk untuk mulai merencanakan perjalanan' 
              : 'Buat akun untuk menyimpan itinerary Anda'}
          </p>
          <div className="perforation-line mt-4 mb-6" />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-tm-sm">
            <p className="text-sm text-destructive font-space-grotesk">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2 font-space-grotesk">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-input rounded-tm-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-150"
              placeholder="anda@email.com"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2 font-space-grotesk">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-input rounded-tm-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-150"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2 font-space-grotesk">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-input rounded-tm-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-150"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          )}

          {/* Submit Button dengan UI/UX Pro Max hover effect */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground font-space-grotesk font-semibold rounded-tm-sm hover:bg-primary/90 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            ) : (
              mode === 'login' ? 'Masuk' : 'Daftar'
            )}
          </button>
        </form>

        {/* Footer dengan link toggle */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground text-center font-space-grotesk">
            {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <Link 
              href={mode === 'login' ? '/register' : '/login'}
              className="text-primary font-semibold hover:text-primary/80 transition-colors"
            >
              {mode === 'login' ? 'Daftar' : 'Masuk'}
            </Link>
          </p>
        </div>
      </div>

      {/* Branding footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground font-ibm-plex-mono">
          TravelMate v1.0 • AI Travel Assistant
        </p>
      </div>
    </div>
  )
}