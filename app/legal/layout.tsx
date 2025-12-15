import React from 'react';
import Link from 'next/link';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
             iNFORiA
          </Link>
          <div className="ml-auto flex items-center gap-4 text-sm font-medium">
             <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">Volver</Link>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-background">
        {children}
      </main>
      <footer className="border-t py-6 bg-card text-center text-sm text-muted-foreground">
        <div className="container">
          &copy; {new Date().getFullYear()} INFORIA. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
