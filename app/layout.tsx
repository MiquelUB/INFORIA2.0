import type { Metadata } from 'next';
import { Nunito_Sans, Lora } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import { Toaster } from "@/components/ui/toaster";
import CookieBanner from '@/components/CookieBanner';

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  weight: ['300', '400', '600', '700'],
  adjustFontFallback: false,
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ['400', '500', '600', '700'],
  adjustFontFallback: false,
});

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: {
    template: '%s | iNFORiA',
    default: 'iNFORiA',
  },
  description: 'Asistente clínico con IA para psicólogos. Informes automatizados y gestión segura.',
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${nunitoSans.variable} ${lora.variable}`}>
      <body className="font-sans">
        <QueryProvider>{children}</QueryProvider>
        <CookieBanner />
        <Toaster />
      </body>
    </html>
  );
}