import { AuthForm } from '@/components/auth/auth-form'
import Link from 'next/link'

export default function LoginPage() {
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
          AI Travel Assistant — Rencanakan perjalanan dengan percakapan
        </p>
      </div>

      {/* Auth Form */}
      <AuthForm mode="login" />

      {/* Feature highlights */}
      <div className="mt-12 max-w-md">
        <h3 className="text-sm font-semibold text-foreground mb-4 text-center font-space-grotesk uppercase tracking-wider">
          Fitur TravelMate
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-card rounded-tm-sm border border-border">
            <div className="text-2xl mb-2">🤖</div>
            <p className="text-xs font-space-grotesk font-semibold">AI Chatbot</p>
            <p className="text-xs text-muted-foreground mt-1">Rencanakan dengan ngobrol</p>
          </div>
          <div className="text-center p-4 bg-card rounded-tm-sm border border-border">
            <div className="text-2xl mb-2">🗺️</div>
            <p className="text-xs font-space-grotesk font-semibold">Peta & Cuaca</p>
            <p className="text-xs text-muted-foreground mt-1">Visualisasi real-time</p>
          </div>
          <div className="text-center p-4 bg-card rounded-tm-sm border border-border">
            <div className="text-2xl mb-2">💾</div>
            <p className="text-xs font-space-grotesk font-semibold">Simpan Itinerary</p>
            <p className="text-xs text-muted-foreground mt-1">Akses kapan saja</p>
          </div>
        </div>
      </div>
    </div>
  )
}