import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Saribudolok — Jelajahi 3D Geo Experience",
  description: "Platform interaktif untuk menjelajahi Desa Saribudolok, Kecamatan Silimakuta, Kabupaten Simalungun. Temukan informasi geografi, wisata, budaya, dan potensi daerah melalui peta 3D yang imersif.",
  keywords: ["Saribudolok", "Simalungun", "peta 3D", "wisata Sumatera Utara", "Danau Toba", "geografi"],
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
