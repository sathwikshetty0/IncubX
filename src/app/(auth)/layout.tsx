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
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left Column: Form */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Right Column: Brand / Image */}
      <div className="hidden lg:block relative overflow-hidden bg-indigo-900 text-white">
        <Image
          src="/auth_side_image_1775761844893.png"
          alt="INCUBX Workspace"
          fill
          className="object-cover opacity-60 grayscale-[40%] group-hover:scale-105 transition-transform duration-[20s]"
          priority
        />
        <div className="relative z-10 h-full flex flex-col justify-between p-16 bg-gradient-to-br from-indigo-900/40 to-black/60">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">INCUBX</span>
          </div>

          <div>
            <blockquote className="space-y-4">
              <p className="text-4xl font-light leading-tight tracking-tight">
                "INCUBX provided us not just capital, but the <span className="text-indigo-300 font-medium italic">operational backbone</span> to scale from zero to millions."
              </p>
              <footer className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500 overflow-hidden border-2 border-white/20">
                  {/* Mock Founder Avatar */}
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-400 to-violet-500" />
                </div>
                <div>
                  <p className="font-bold text-lg">Vikram Malhotra</p>
                  <p className="text-sm opacity-60">CEO, GreenHarvest AgriTech</p>
                </div>
              </footer>
            </blockquote>
          </div>

          <div className="flex items-center justify-between text-xs opacity-50 uppercase tracking-widest">
            <span>Cohort 4 Applications Open</span>
            <span>Join 500+ Founders</span>
          </div>
        </div>
      </div>
    </div>
  )
}

