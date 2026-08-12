import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import CopyGuard from "@/components/CopyGuard";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Set this to your real domain once you have one — it's what turns
// relative Open Graph/Twitter image paths into the absolute URLs
// crawlers and link-preview bots require.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://psmf-app.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PSMF Family — Peculiar Single and Married Forum",
    template: "%s · PSMF Family",
  },
  description:
    "PSMF: a relationship platform where singles and married members come together to learn and talk about relationships — keep your profile current and never miss a birthday or anniversary in the family.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "PSMF Family — Peculiar Single and Married Forum",
    description:
      "A relationship platform where singles and married members come together to learn and talk about relationships.",
    url: siteUrl,
    siteName: "PSMF Family",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PSMF Family — Peculiar Single and Married Forum",
    description:
      "A relationship platform where singles and married members come together to learn and talk about relationships.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#241726",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${inter.variable} antialiased no-copy`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.setAttribute('data-theme', localStorage.getItem('psmf-theme') === 'light' ? 'light' : 'dark');}catch(e){}`,
          }}
        />
        <CopyGuard />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
