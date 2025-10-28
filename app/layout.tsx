// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // (Cambiar por Lora/Nunito Sans luego)
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "iNFORiA SaaS",
  description: "Plataforma de generación de informes psiquiátricos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Aquí irán los Providers (React Query, etc.) */}
        {children}
      </body>
    </html>
  );
}