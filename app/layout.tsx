import type { Metadata } from 'next'
import { Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thegoldenmic.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "The Golden Mic | Karaoke Studio – Pune",
    template: "%s | The Golden Mic",
  },
  description:
    "Book your karaoke session at The Golden Mic — Pune's premium karaoke & live rehearsal studio. Solo, duet, group sessions and bulk plans available at Narayan Peth, Pune.",
  keywords: [
    "karaoke studio pune",
    "the golden mic pune",
    "karaoke booking pune",
    "live rehearsal studio pune",
    "karaoke narayan peth",
    "singing studio pune",
    "the golden mic",
  ],
  openGraph: {
    title: "The Golden Mic | Karaoke Studio – Pune",
    description:
      "Pune's premium karaoke & live rehearsal studio. Book online at Narayan Peth, Pune.",
    url: SITE_URL,
    siteName: "The Golden Mic",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Golden Mic | Karaoke Studio – Pune",
    description: "Pune's premium karaoke & live rehearsal studio. Book your slot online.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: SITE_URL },
};

// Local Business structured data — helps Google show your studio in local search
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "EntertainmentBusiness",
  name: "The Golden Mic",
  description:
    "Premium karaoke and live rehearsal studio in Pune offering solo, duet, group and bulk sessions.",
  url: SITE_URL,
  telephone: "+91-94227-89659",
  email: "thegoldenmicpune@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "401, Vidydhar Heights, 243 Narayan Peth, Laxmi Road",
    addressLocality: "Pune",
    addressRegion: "Maharashtra",
    postalCode: "411030",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 18.513739,
    longitude: 73.845868,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      opens: "10:00",
      closes: "20:00",
    },
  ],
  priceRange: "₹300 – ₹2400",
  hasMap: "https://maps.google.com/?q=18.513739,73.845868",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className={`${cormorant.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
