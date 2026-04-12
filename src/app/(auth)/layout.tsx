import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    default: 'Sign In — INCUBX',
    template: '%s | INCUBX',
  },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#FBFBFA]">
      {/* Left Column: Form */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-16 relative">
        <div className="absolute top-8 left-8 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">I</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">INCUBX</span>
          </div>
        </div>
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Right Column: Brand / Image */}
      <div className="hidden lg:block relative overflow-hidden bg-indigo-950 text-white">
        <Image
          src="/auth_side_image_1775761844893.png"
          alt="INCUBX Workspace"
          fill
          className="object-cover opacity-50 grayscale-[20%] transition-transform duration-[30s] hover:scale-110"
          priority
        />
        <div className="relative z-10 h-full flex flex-col justify-between p-16 bg-gradient-to-br from-indigo-950/80 via-indigo-900/40 to-black/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl">
              <span className="text-white font-bold text-2xl">I</span>
            </div>
            <span className="text-3xl font-bold tracking-tighter">INCUBX</span>
          </div>

          <div className="max-w-xl">
            <blockquote className="space-y-8">
              <p className="text-5xl font-light leading-[1.1] tracking-tight text-indigo-50">
                &ldquo;INCUBX provided us not just capital, but the <span className="text-indigo-400 font-medium font-serif italic">operational backbone</span> to scale from zero to millions.&rdquo;
              </p>
              <footer className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-indigo-500 overflow-hidden border-2 border-white/30 shadow-xl">
                  {/* Mock Founder Avatar */}
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-400 to-violet-500" />
                </div>
                <div>
                  <p className="font-bold text-xl">Vikram Malhotra</p>
                  <p className="text-indigo-300/80 font-medium">CEO, GreenHarvest AgriTech</p>
                </div>
              </footer>
            </blockquote>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
            <div className="flex items-center gap-4">
              <span>Cohort 4 Applications Open</span>
              <div className="w-1 h-1 rounded-full bg-white/40" />
              <span>Join 500+ Founders</span>
            </div>
            <span>&copy; 2026 IncubX Inc.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

