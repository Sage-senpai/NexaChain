// src/app/layout.tsx - UPDATED WITH TRANSLATION
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.scss";
import TranslationProvider from "@/components/TranslationProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexachain - Premium Cryptocurrency Investment Platform",
  description:
    "Secure cryptocurrency investments with daily returns. Join thousands of investors building wealth together.",
  keywords:
    "cryptocurrency, investment, bitcoin, ethereum, crypto trading, passive income",
  authors: [{ name: "Nexachain" }],
  openGraph: {
    title: "Nexachain - Premium Cryptocurrency Investment Platform",
    description: "Secure cryptocurrency investments with daily returns",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TranslationProvider>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}