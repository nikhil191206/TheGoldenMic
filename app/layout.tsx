import type { Metadata } from 'next'
import { Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap"
})

export const metadata: Metadata = {
  title: 'The Golden Mic',
  description: 'Karaoke Studio',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${cormorant.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
