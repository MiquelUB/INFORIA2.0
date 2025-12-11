"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Briefcase, Building } from "lucide-react";

// This is a placeholder component.
// Its props and state would be managed by the parent `MyAccountClient`.
export default function ProfessionalDataSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Briefcase className="mr-2" />
          Datos Profesionales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nombre Completo</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="fullName" placeholder="Tu nombre completo" className="pl-10" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="license">Nº de Colegiado</Label>
          <Input id="license" placeholder="12345" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clinicName">Nombre de la Clínica/Consulta</Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="clinicName" placeholder="Nombre de tu lugar de trabajo" className="pl-10" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button>Guardar Cambios</Button>
        </div>
      </CardContent>
    </Card>
  );
}
