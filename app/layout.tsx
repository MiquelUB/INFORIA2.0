import AutoLogout from "@/components/AutoLogout";
import QueryProvider from "@/components/QueryProvider";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from 'next';
import { Lora, Nunito_Sans } from "next/font/google";
import "./globals.css";

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
        <Toaster />
        <AutoLogout />
      </body>
    </html>
  );
}