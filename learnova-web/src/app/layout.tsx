import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learnova AI - The AI that studies with you and builds with you",
  description: "One powerful AI for students who want to ace every exam and builders who want to launch great ideas. Trusted by 50,000+ users.",
  keywords: ["AI tutor", "exam prep", "business validator", "AI writer", "student AI", "startup AI"],
  authors: [{ name: "Learnova AI" }],
  creator: "Learnova AI",
  publisher: "Learnova AI",
  metadataBase: new URL("https://learnova.ai"),
  manifest: '/manifest.json',
  themeColor: '#534AB7',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Learnova AI',
  },
  icons: {
    apple: '/icons/icon-192.png',
  },
  openGraph: {
    title: "Learnova AI - The AI that studies with you and builds with you",
    description: "One powerful AI for students and builders. Get personalized guidance, exam prep, and startup advice.",
    type: "website",
    locale: "en_US",
    siteName: "Learnova AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learnova AI",
    description: "The AI that studies with you and builds with you",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Learnova AI" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
