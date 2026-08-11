import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import CopyGuard from "@/components/CopyGuard";

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

export const metadata: Metadata = {
  title: "PSMF Family — Peculiar Single and Married Forum",
  description:
    "PSMF: a relationship platform where singles and married members come together to learn and talk about relationships — keep your profile current and never miss a birthday or anniversary in the family.",
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
        {children}
      </body>
    </html>
  );
}
