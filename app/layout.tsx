import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display' })

export const metadata: Metadata = {
  title: 'Benny & Blue Wedding - August 22, 2026 | RSVP',
  description: 'Join us for the wedding of Benny and Blue on August 22, 2026. Ceremony at Sunset Gardens, Reception at Grand Ballroom. RSVP by July 1st, 2026.',
  keywords: 'Benny Blue wedding, August 22 2026, wedding RSVP, Sunset Gardens, Grand Ballroom, Celebration City',
  authors: [{ name: 'Benny & Blue' }],
  openGraph: {
    title: 'Benny & Blue Wedding - August 22, 2026',
    description: 'Join us for our special day! RSVP for our wedding celebration.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${playfair.variable} font-sans`}>{children}</body>
    </html>
  )
}