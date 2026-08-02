'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import nextDynamic from 'next/dynamic'
import { ItineraryCard } from '@/components/itinerary/ItineraryCard'
import { Trip } from '@/types'
import { ArrowLeft, Download, Share2, Edit, Trash2, Calendar, MapPin, Users, Heart } from 'lucide-react'
import Link from 'next/link'

const TripMap = nextDynamic(() => import('@/components/map/TripMap').then(mod => mod.TripMap), {
  ssr: false,
})

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'itinerary' | 'map'>('itinerary')

  const supabase = createClient()

  useEffect(() => {
    loadTrip()
  }, [params.id])

  const loadTrip = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const res = await fetch(`/api/trips/${params.id}`)
      if (!res.ok) {
        if (res.status === 404) {
          setTrip(null)
          return
        }
        throw new Error('Failed to fetch trip')
      }

      const data = await res.json()
      setTrip(data.trip)
    } catch (error) {
      console.error('Error loading trip:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTrip = async () => {
    if (!trip) return
    try {
      const res = await fetch(`/api/trips/${trip.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'final' }),
      })
      if (!res.ok) throw new Error('Failed to save trip status')
      
      setTrip(prev => prev ? { ...prev, status: 'final' } : null)
      alert('Status perjalanan berhasil diperbarui menjadi Final!')
    } catch (error) {
      console.error('Error saving trip:', error)
      alert('Gagal memperbarui status perjalanan')
    }
  }

  const handleShareTrip = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Tautan halaman ini telah berhasil disalin ke clipboard!')
    } catch (error) {
      console.error('Error copying link:', error)
      alert('Gagal menyalin tautan.')
    }
  }

  const handleEditTrip = () => {
    router.push('/chat')
  }

  const handleDeleteTrip = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus perjalanan ini?')) {
      try {
        const res = await fetch(`/api/trips/${params.id}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete trip')

        router.push('/trips')
      } catch (error) {
        console.error('Error deleting trip:', error)
        alert('Gagal menghapus perjalanan')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-sm text-muted-foreground font-space-grotesk">
              Memuat detail perjalanan...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">😕</div>
            <h2 className="text-2xl font-fraunces font-semibold text-foreground mb-3">
              Perjalanan tidak ditemukan
            </h2>
            <p className="text-sm text-muted-foreground font-space-grotesk mb-6">
              Perjalanan yang Anda cari tidak ditemukan atau telah dihapus
            </p>
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-space-grotesk font-semibold rounded-tm-sm hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Riwayat
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Back button and title */}
            <div className="flex items-center gap-4">
              <Link
                href="/trips"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-tm-sm transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-fraunces font-semibold text-foreground">
                  {trip.title}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{trip.destination}</span>
                  </div>
                  {trip.start_date && trip.end_date && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{trip.start_date} - {trip.end_date}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    {trip.status === 'final' ? (
                      <>
                        <Heart className="w-3 h-3" />
                        <span>Final</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-3 h-3" />
                        <span>Draft</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveTrip}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-space-grotesk font-semibold rounded-tm-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Simpan
              </button>
              <button
                onClick={handleShareTrip}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-tm-sm transition-colors"
                title="Bagikan"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleEditTrip}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-tm-sm transition-colors"
                title="Edit"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={handleDeleteTrip}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-tm-sm transition-colors"
                title="Hapus"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`px-6 py-3 text-sm font-space-grotesk font-medium transition-colors border-b-2 ${
                activeTab === 'itinerary'
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              Itinerary
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-6 py-3 text-sm font-space-grotesk font-medium transition-colors border-b-2 ${
                activeTab === 'map'
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              Peta Perjalanan
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'itinerary' ? (
          <div className="space-y-8">
            {/* Itinerary card */}
            <ItineraryCard
              trip={trip}
              onSave={handleSaveTrip}
              onShare={handleShareTrip}
              onEdit={handleEditTrip}
            />

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-tm-sm p-4">
                <div className="text-xs text-muted-foreground font-space-grotesk mb-1">Hari</div>
                <div className="text-2xl font-fraunces font-semibold text-foreground">
                  {trip.days?.length || 0}
                </div>
              </div>
              <div className="bg-card border border-border rounded-tm-sm p-4">
                <div className="text-xs text-muted-foreground font-space-grotesk mb-1">Aktivitas</div>
                <div className="text-2xl font-fraunces font-semibold text-foreground">
                  {trip.days?.reduce((sum, day) => sum + day.activities.length, 0) || 0}
                </div>
              </div>
              <div className="bg-card border border-border rounded-tm-sm p-4">
                <div className="text-xs text-muted-foreground font-space-grotesk mb-1">Budget</div>
                <div className="text-2xl font-fraunces font-semibold text-foreground">
                  Rp {trip.total_budget?.toLocaleString('id-ID') || '0'}
                </div>
              </div>
              <div className="bg-card border border-border rounded-tm-sm p-4">
                <div className="text-xs text-muted-foreground font-space-grotesk mb-1">Status</div>
                <div className="text-2xl font-fraunces font-semibold text-foreground capitalize">
                  {trip.status}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Map */}
            <TripMap trip={trip} height="500px" />

            {/* Location details */}
            <div className="bg-card border border-border rounded-tm-md p-6">
              <h3 className="text-lg font-fraunces font-semibold text-foreground mb-4">
                Detail Lokasi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trip.days?.map(day => (
                  <div key={day.id} className="space-y-3">
                    <h4 className="text-base font-space-grotesk font-semibold text-foreground">
                      Hari {day.day_number}
                    </h4>
                    <div className="space-y-2">
                      {day.activities.map(activity => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 bg-background border border-border rounded-tm-sm">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-ibm-plex-mono font-medium text-primary">
                                {activity.time}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-space-grotesk font-semibold text-foreground">
                              {activity.location_name}
                            </h5>
                            <p className="text-xs text-muted-foreground mt-1">
                              {activity.activity_description}
                            </p>
                            {activity.latitude && activity.longitude && (
                              <div className="text-xs font-ibm-plex-mono text-muted-foreground mt-2">
                                {activity.latitude.toFixed(4)}, {activity.longitude.toFixed(4)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground font-space-grotesk">
              Generated by TravelMate AI • Last updated: {new Date().toLocaleDateString('id-ID')}
            </div>
            <div className="text-xs text-muted-foreground font-space-grotesk">
              ID: {trip.id.slice(0, 8)}...
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}