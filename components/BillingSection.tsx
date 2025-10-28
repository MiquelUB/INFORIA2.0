// Ruta: src/components/BillingSection.tsx
import React, { useState, } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, Calendar, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
  downloadUrl?: string;
}

interface BillingSectionProps {
  currentPlan: 'professional' | 'clinic';
  nextBillingDate: string;
  invoices: Invoice[];
  onDownloadInvoice: (invoiceId: string) => void;
  onEarlyRenewal?: () => void;
  canRenewEarly?: boolean;
}

export const BillingSection: React.FC<BillingSectionProps> = ({
  currentPlan,
  nextBillingDate,
  invoices,
  onDownloadInvoice,
  onEarlyRenewal,
  canRenewEarly = false
}) => {
  const [isRenewing, setIsRenewing] = useState(false);

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
        return <Calendar className="h-3 w-3" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const handleEarlyRenewal = async () => {
    setIsRenewing(true);
    try {
      await onEarlyRenewal?.();
    } finally {
      setIsRenewing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Billing Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Información de Facturación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-sans text-muted-foreground">Plan Actual</p>
              <p className="font-serif text-lg font-medium">
                {currentPlan === 'professional' ? 'Plan Profesional' : 'Plan Clínica'}
              </p>
            </div>
            <div>
              <p className="text-sm font-sans text-muted-foreground">Próxima Facturación</p>
              <p className="font-sans text-lg font-medium">{nextBillingDate}</p>
            </div>
          </div>

          {canRenewEarly && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-sans">
                Tienes pocos informes restantes. Puedes renovar tu plan anticipadamente para reiniciar tu cuota.
                <Button 
                  onClick={handleEarlyRenewal}
                  disabled={isRenewing}
                  className="ml-2 h-8 px-3 font-sans"
                  size="sm"
                >
                  {isRenewing ? 'Procesando...' : 'Renovar Ahora'}
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Invoices History */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Historial de Facturas</CardTitle>
          <CardDescription className="font-sans">
            Descarga tus facturas y consulta el historial de pagos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-sans text-muted-foreground">
                No hay facturas disponibles aún
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-sans">Factura</TableHead>
                  <TableHead className="font-sans">Fecha</TableHead>
                  <TableHead className="font-sans">Plan</TableHead>
                  <TableHead className="font-sans">Estado</TableHead>
                  <TableHead className="font-sans">Importe</TableHead>
                  <TableHead className="font-sans text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-sans font-medium">
                      {invoice.number}
                    </TableCell>
                    <TableCell className="font-sans">
                      {new Date(invoice.date).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell className="font-sans">{invoice.plan}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(invoice.status)} font-sans text-xs`}
                      >
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1">
                          {invoice.status === 'paid' ? 'Pagada' : 
                           invoice.status === 'pending' ? 'Pendiente' : 'Fallida'}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-sans font-medium">
                      {invoice.amount.toFixed(2)}€
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.status === 'paid' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDownloadInvoice(invoice.id)}
                          className="font-sans"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Descargar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};