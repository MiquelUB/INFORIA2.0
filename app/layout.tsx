import { Nunito_Sans, Lora } from "next/font/google";
import "./globals.css";
<<<<<<< HEAD
import QueryProvider from "@/components/QueryProvider"; // Corrected import path
=======

>>>>>>> feature/stripe-integration

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  weight: ['300', '400', '600', '700'],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ['400', '500', '600', '700'],
});

export const runtime = "nodejs";

export const metadata = { title: "INFORIA" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
<<<<<<< HEAD
    <html lang="es" className={`${nunitoSans.variable} ${lora.variable}`}>
      <body className="font-sans">
        <QueryProvider>{children}</QueryProvider>
=======
    <html lang="en">
      <body className={inter.className}>
        {children}
>>>>>>> feature/stripe-integration
      </body>
    </html>
  );
}