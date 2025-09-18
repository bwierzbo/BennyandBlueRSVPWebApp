import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Benny & Blue Wedding - June 15, 2024 | RSVP',
  description: 'Join us for the wedding of Benny and Blue on June 15, 2024. Ceremony at Sunset Gardens, Reception at Grand Ballroom. RSVP by May 1st, 2024.',
  keywords: 'Benny Blue wedding, June 15 2024, wedding RSVP, Sunset Gardens, Grand Ballroom, Celebration City',
  authors: [{ name: 'Benny & Blue' }],
  openGraph: {
    title: 'Benny & Blue Wedding - June 15, 2024',
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
      <body className={inter.className}>{children}</body>
    </html>
  )
}