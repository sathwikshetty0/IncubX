import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'INCUBX — Where Startups Are Built',
    template: '%s | INCUBX',
  },
  description:
    'INCUBX is a full-stack startup incubation platform connecting founders, mentors, and investors to accelerate startup growth.',
  keywords: ['startup', 'incubator', 'accelerator', 'mentorship', 'funding'],
  authors: [{ name: 'INCUBX' }],
  openGraph: {
    title: 'INCUBX — Where Startups Are Built',
    description: 'A full-stack startup incubation platform.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#F8F7F4] text-gray-900">{children}</body>
    </html>
  )
}
