'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TravelerType, BudgetRange, LanguageStyle, UserPreferences } from '@/types'
import { ArrowLeft, Save, User, Utensils, Wallet, MessageSquare, Check, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const [travelerType, setTravelerType] = useState<TravelerType>('umum')
  const [budgetRange, setBudgetRange] = useState<BudgetRange>('menengah')
  const [foodPref, setFoodPref] = useState<string>('')
  const [languageStyle, setLanguageStyle] = useState<LanguageStyle>('santai')

  const supabase = createClient()

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (preferences) {
        setTravelerType(preferences.traveler_type || 'umum')
        setBudgetRange(preferences.budget_range || 'menengah')
        setFoodPref(preferences.food_pref || '')
        setLanguageStyle(preferences.language_style || 'santai')
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSavedSuccess(false)

    try {
      const response = await fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traveler_type: travelerType,
          budget_range: budgetRange,
          food_pref: foodPref.trim() || null,
          language_style: languageStyle,
        }),
      })

      if (!response.ok) {
        throw new Error('Gagal menyimpan preferensi')
      }

      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Gagal menyimpan preferensi. Silakan coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-3"></div>
          <p className="text-sm text-muted-foreground font-space-grotesk">
            Memuat preferensi Anda...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/chat"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-tm-sm transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-fraunces font-semibold text-foreground">
                Pengaturan Preferensi
              </h1>
              <p className="text-xs text-muted-foreground font-space-grotesk">
                Personalisasi gaya rekomendasi AI TravelMate untuk perjalanan Anda
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main form container */}
      <main className="max-w-4xl mx-auto px-6 pt-8">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Notification success */}
          {savedSuccess && (
            <div className="p-4 bg-tm-success-600/10 border border-tm-success-600/30 rounded-tm-md flex items-center gap-3 text-tm-success-600 font-space-grotesk text-sm animate-card-unfold">
              <Check className="w-5 h-5 flex-shrink-0" />
              <span>Preferensi Anda berhasil disimpan! AI akan menyesuaikan rekomendasi berikutnya.</span>
            </div>
          )}

          {/* Section 1: Tipe Traveler */}
          <div className="bg-card border border-border rounded-tm-md p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-fraunces font-semibold text-foreground">
                  Tipe Traveler (Persona)
                </h2>
                <p className="text-xs text-muted-foreground font-space-grotesk">
                  Tentukan gaya perjalanan Anda agar AI menyesuaikan destinasi yang direkomendasikan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {[
                { id: 'backpacker', title: '🎒 Backpacker / Hemat', desc: 'Prioritaskan opsi hemat, transportasi umum, dan penginapan budget.' },
                { id: 'family', title: '👨‍👩‍👧‍👦 Keluarga / Family', desc: 'Prioritaskan lokasi ramah anak, keamanan, tempat nyaman, dan aksesibilitas.' },
                { id: 'honeymoon', title: '💑 Honeymoon / Romantis', desc: 'Prioritaskan suasana romantis, pemandangan indah, dan privasi.' },
                { id: 'kuliner', title: '🍲 Pemburu Kuliner', desc: 'Prioritaskan tempat makan otentik, pasar malam, dan kuliner khas daerah.' },
                { id: 'umum', title: '🧳 Umum / Standar', desc: 'Rekomendasi seimbang antara aktivitas populer, kenyamanan, dan budget.' },
              ].map((item) => (
                <label
                  key={item.id}
                  onClick={() => setTravelerType(item.id as TravelerType)}
                  className={`p-4 rounded-tm-sm border cursor-pointer transition-all flex flex-col justify-between ${
                    travelerType === item.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-background hover:border-primary/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-space-grotesk font-semibold text-foreground text-sm">
                        {item.title}
                      </span>
                      {travelerType === item.id && (
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      {item.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Section 2: Rentang Budget */}
          <div className="bg-card border border-border rounded-tm-md p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-fraunces font-semibold text-foreground">
                  Skala Budget Default
                </h2>
                <p className="text-xs text-muted-foreground font-space-grotesk">
                  Kategori perkiraan pengeluaran harian yang Anda harapkan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {[
                { id: 'hemat', title: '💚 Hemat', desc: 'Transport hemat & tempat makan terjangkau' },
                { id: 'menengah', title: '💙 Menengah', desc: 'Kenyamanan standar & kuliner populer' },
                { id: 'mewah', title: '💜 Mewah', desc: 'Pengalaman premium & resort berbintang' },
              ].map((item) => (
                <label
                  key={item.id}
                  onClick={() => setBudgetRange(item.id as BudgetRange)}
                  className={`p-4 rounded-tm-sm border cursor-pointer transition-all ${
                    budgetRange === item.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-background hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-space-grotesk font-semibold text-foreground text-sm">
                      {item.title}
                    </span>
                    {budgetRange === item.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.desc}
                  </p>
                </label>
              ))}
            </div>
          </div>

          {/* Section 3: Preferensi Makanan & Gaya Bahasa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preferensi Makanan */}
            <div className="bg-card border border-border rounded-tm-md p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-fraunces font-semibold text-foreground">
                    Preferensi Makanan
                  </h2>
                  <p className="text-xs text-muted-foreground font-space-grotesk">
                    Pantangan atau makanan favorit Anda
                  </p>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={foodPref}
                  onChange={(e) => setFoodPref(e.target.value)}
                  placeholder="Contoh: pedas, halal, vegetarian, no seafood..."
                  className="w-full px-4 py-3 bg-background border border-input rounded-tm-sm text-foreground text-sm font-space-grotesk placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  *Biarkan kosong jika tidak ada pembatasan khusus.
                </p>
              </div>
            </div>

            {/* Gaya Bahasa Chatbot */}
            <div className="bg-card border border-border rounded-tm-md p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-fraunces font-semibold text-foreground">
                    Gaya Bahasa Chatbot
                  </h2>
                  <p className="text-xs text-muted-foreground font-space-grotesk">
                    Pilih tone komunikasi TravelMate
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'santai', title: '🗣️ Santai & Ramah', desc: 'Ngobrol seperti dengan teman perjalanan.' },
                  { id: 'formal', title: '👔 Formal & Sopan', desc: 'Bahasa Indonesia baku dan terstruktur.' },
                ].map((item) => (
                  <label
                    key={item.id}
                    onClick={() => setLanguageStyle(item.id as LanguageStyle)}
                    className={`p-3 rounded-tm-sm border cursor-pointer transition-all flex items-center justify-between ${
                      languageStyle === item.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-background hover:border-primary/40'
                    }`}
                  >
                    <div>
                      <span className="font-space-grotesk font-semibold text-foreground text-sm block">
                        {item.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.desc}
                      </span>
                    </div>
                    {languageStyle === item.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-primary text-primary-foreground font-space-grotesk font-semibold rounded-tm-sm hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Preferensi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
