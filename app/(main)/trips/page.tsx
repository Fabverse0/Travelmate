'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TripSummaryCard } from '@/components/itinerary/TripSummaryCard'
import { Trip } from '@/types'
import { Plane, Plus, Filter, Search, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function TripsPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const tripsPerPage = 9

  const supabase = createClient()

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: tripsData, error } = await supabase
        .from('trips')
        .select(`
          *,
          days:trip_days(
            *,
            activities:trip_activities(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading trips:', error)
        return
      }

      // Sort days by day_number and activities by sequence
      const formattedTrips = (tripsData || []).map(trip => ({
        ...trip,
        days: (trip.days || [])
          .sort((a: any, b: any) => a.day_number - b.day_number)
          .map((day: any) => ({
            ...day,
            activities: (day.activities || []).sort((a: any, b: any) => a.sequence - b.sequence)
          }))
      }))

      setTrips(formattedTrips)
    } catch (error) {
      console.error('Error in loadTrips:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter trips
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = searchTerm === '' || 
      trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || trip.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage)
  const startIndex = (currentPage - 1) * tripsPerPage
  const endIndex = startIndex + tripsPerPage
  const currentTrips = filteredTrips.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-sm text-muted-foreground font-space-grotesk">
              Memuat perjalanan Anda...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-fraunces font-semibold text-foreground">
                Riwayat Perjalanan
              </h1>
              <p className="text-sm text-muted-foreground font-space-grotesk mt-2">
                Semua itinerary yang pernah Anda buat dengan TravelMate
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/chat"
                className="px-6 py-3 bg-primary text-primary-foreground font-space-grotesk font-semibold rounded-tm-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Buat Perjalanan Baru
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background border border-border rounded-tm-sm">
              <div className="text-2xl font-fraunces font-semibold text-foreground">
                {trips.length}
              </div>
              <div className="text-xs text-muted-foreground font-space-grotesk mt-1">
                Total Perjalanan
              </div>
            </div>
            <div className="text-center p-4 bg-background border border-border rounded-tm-sm">
              <div className="text-2xl font-fraunces font-semibold text-foreground">
                {trips.filter(t => t.status === 'final').length}
              </div>
              <div className="text-xs text-muted-foreground font-space-grotesk mt-1">
                Final
              </div>
            </div>
            <div className="text-center p-4 bg-background border border-border rounded-tm-sm">
              <div className="text-2xl font-fraunces font-semibold text-foreground">
                {trips.reduce((sum, trip) => sum + (trip.days?.length || 0), 0)}
              </div>
              <div className="text-xs text-muted-foreground font-space-grotesk mt-1">
                Total Hari
              </div>
            </div>
            <div className="text-center p-4 bg-background border border-border rounded-tm-sm">
              <div className="text-2xl font-fraunces font-semibold text-foreground">
                {trips.reduce((sum, trip) => sum + (trip.total_budget || 0), 0).toLocaleString('id-ID')}
              </div>
              <div className="text-xs text-muted-foreground font-space-grotesk mt-1">
                Total Budget
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari perjalanan berdasarkan judul atau destinasi..."
                className="w-full pl-10 pr-4 py-3 bg-card border border-input rounded-tm-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-space-grotesk"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-card border border-input rounded-tm-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-space-grotesk appearance-none"
                >
                  <option value="all">Semua Status</option>
                  <option value="draft">Draft</option>
                  <option value="final">Final</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentTrips.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-8 bg-card border border-border rounded-tm-md">
              <Plane className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-xl font-fraunces font-semibold text-foreground mb-3">
                Belum ada perjalanan tersimpan
              </h3>
              <p className="text-sm text-muted-foreground font-space-grotesk max-w-md mx-auto mb-6">
                Mulai ngobrol dengan TravelMate untuk membuat itinerary pertama Anda
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-space-grotesk font-semibold rounded-tm-sm hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Mulai Chat
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Grid of trips */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentTrips.map((trip) => (
                <TripSummaryCard key={trip.id} trip={trip} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-tm-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-tm-sm font-space-grotesk font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-tm-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground font-space-grotesk">
              <span className="font-ibm-plex-mono">{filteredTrips.length}</span> perjalanan ditemukan
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-space-grotesk">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>Draft</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Final</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}