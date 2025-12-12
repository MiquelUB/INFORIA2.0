// en app/(app)/(auth)/blocked/page.tsx

export default function BlockedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <h1 className="text-3xl font-bold">Has agotado tus créditos</h1>
      <p className="text-muted-foreground">
        Por favor, recarga tu cuenta para continuar usando el servicio.
      </p>
    </div>
  );
}