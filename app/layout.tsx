import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Findkar - Find Trusted Service Vendors Nearby",
    template: "%s | Findkar",
  },
  description:
    "Discover local vendors, street food sellers, and service providers near you. Real-time availability, verified services, ratings, and instant contact. Connect with your community today!",
  keywords: [
    "local vendors",
    "service providers",
    "street food",
    "nearby services",
    "local business directory",
    "vendor finder",
    "local marketplace",
    "India",
  ],
  applicationName: "Findkar",
  authors: [{ name: "Findkar Team" }],
  creator: "Findkar",
  publisher: "Findkar",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Findkar",
    title: "Findkar - Find Trusted Service Vendors Nearby",
    description:
      "Discover local vendors, street food sellers, and service providers near you. Real-time availability, verified services, and instant contact.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Findkar - Local Vendor Discovery Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Findkar - Find Trusted Service Vendors Nearby",
    description:
      "Discover local vendors and service providers near you. Real-time availability and instant contact.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Findkar",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  category: "business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
