import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { ThemeProvider } from "@/contexts/ThemeContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Thinkior AI - The AI built for India's students and builders",
  description: "Prepare for UPSC, JEE, NEET & CAT — or validate your startup idea — with AI that speaks your language. Currently in beta, free to use.",
  keywords: ["AI tutor", "exam prep", "business validator", "AI writer", "student AI", "startup AI", "UPSC", "JEE", "NEET", "CAT"],
  authors: [{ name: "Salman Memon" }],
  creator: "Thinkior AI",
  publisher: "Thinkior AI",
  metadataBase: new URL("https://learnova.ai"),
  manifest: '/manifest.json',
  themeColor: '#4f46e5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Thinkior AI',
  },
  icons: {
    apple: '/icons/icon-192.png',
  },
  openGraph: {
    title: "Thinkior AI - The AI built for India's students and builders",
    description: "Prepare for competitive exams or validate your startup idea with AI. Built for India, currently in beta.",
    type: "website",
    locale: "en_US",
    siteName: "Thinkior AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thinkior AI",
    description: "The AI built for India's students and builders",
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
      className={`${plusJakartaSans.variable} ${dmSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Thinkior AI" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col font-body">
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
