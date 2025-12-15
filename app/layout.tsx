import { Nunito_Sans, Lora } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import { Toaster } from "@/components/ui/toaster";

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

export const metadata = { title: "INFORIA" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${nunitoSans.variable} ${lora.variable}`}>
      <body className="font-sans">
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}