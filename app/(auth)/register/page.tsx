import { AuthForm } from '@/components/auth/auth-form'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Header dengan TravelMate branding */}
      <div className="mb-8 text-center">
        <Link href="/">
          <h1 className="text-3xl font-fraunces font-semibold text-foreground mb-2">
            TravelMate
          </h1>
        </Link>
        <p className="text-sm text-muted-foreground font-space-grotesk">
          Bergabunglah dengan komunitas traveler Indonesia
        </p>
      </div>

      {/* Auth Form */}
      <AuthForm mode="register" />

      {/* Benefits section */}
      <div className="mt-12 max-w-md">
        <h3 className="text-sm font-semibold text-foreground mb-4 text-center font-space-grotesk uppercase tracking-wider">
          Manfaat Bergabung
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-card/50 rounded-tm-sm border border-border">
            <div className="text-primary mt-0.5">✓</div>
            <div>
              <p className="text-sm font-space-grotesk font-semibold">Itinerary Personal</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Simpan dan akses rencana perjalanan Anda kapan saja
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-card/50 rounded-tm-sm border border-border">
            <div className="text-primary mt-0.5">✓</div>
            <div>
              <p className="text-sm font-space-grotesk font-semibold">Rekomendasi Cerdas</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI yang memahami preferensi Anda sebagai traveler
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-card/50 rounded-tm-sm border border-border">
            <div className="text-primary mt-0.5">✓</div>
            <div>
              <p className="text-sm font-space-grotesk font-semibold">Gratis Selamanya</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tidak ada biaya berlangganan, fokus pada pengalaman Anda
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}