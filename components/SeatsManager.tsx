'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, Coins, Trash2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { teamsService, type TeamMember } from '@/lib/services/teams';
// import { useAuth } from '@/contexts/AuthContext'; // Removed
import { SUBSCRIPTION_PLANS } from '@/lib/services/stripe';
import { User } from '@supabase/supabase-js';

interface SeatsManagerProps {
  currentPlanId?: string;
  userCredits: number;
  onCreditsChange?: () => void; // Callback para recargar los créditos en el padre
  user: User | null; // [NUEVO] Prop user
}

export default function SeatsManager({ currentPlanId = 'professional', userCredits, onCreditsChange, user }: SeatsManagerProps) {
  // const { user } = useAuth(); // Removed
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [transferAmount, setTransferAmount] = useState(10);
  const [isInviting, setIsInviting] = useState(false);

  // Obtener configuración del plan actual
  const planConfig = SUBSCRIPTION_PLANS[currentPlanId] || SUBSCRIPTION_PLANS['professional'];
  const seatsLimit = planConfig.seats || 1;
  
  // Cálculo de asientos: Admin (1) + Miembros invitados
  const seatsUsed = members.length + 1;
  const isLimitReached = seatsUsed >= seatsLimit;
  // Asegurar que el porcentaje no supere 100 visualmente
  const progressPercentage = Math.min((seatsUsed / seatsLimit) * 100, 100);

  useEffect(() => {
    if (user) loadMembers();
  }, [user]);

  const loadMembers = async () => {
    if (!user) return;
    try {
      const data = await teamsService.getMembers(user.id);
      setMembers(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar equipo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error("Email inválido");
      return;
    }
    
    setIsInviting(true);
    try {
      await teamsService.inviteMember(newEmail);
      toast.success(`Invitación enviada a ${newEmail}`);
      setNewEmail('');
      loadMembers();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleTransfer = async (email: string) => {
    if (transferAmount <= 0) return toast.error("Cantidad inválida");
    if (userCredits < transferAmount) return toast.error("No tienes suficientes créditos para transferir");

    try {
      const result: any = await teamsService.allocateCredits(email, transferAmount);
      if (result.success) {
        toast.success(`Transferidos ${transferAmount} créditos correctamente`);
        loadMembers();
        onCreditsChange?.(); // Actualizar contador global del admin
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error en transferencia');
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar a este usuario? Liberarás un asiento.')) return;
    try {
      await teamsService.removeMember(id);
      toast.success('Usuario eliminado del equipo');
      loadMembers();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  return (
    <Card className="w-full border-t-4 border-t-primary shadow-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-5 h-5 text-primary" />
              Gestión de Equipo ({planConfig.name})
            </CardTitle>
            <CardDescription className="mt-1">
              Administra el acceso y distribuye créditos entre tus profesionales.
            </CardDescription>
          </div>

          <div className="w-full md:w-72 bg-secondary/10 p-4 rounded-lg border">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-muted-foreground">Ocupación de Seats</span>
              <span className={`font-bold ${isLimitReached ? 'text-amber-600' : 'text-primary'}`}>
                {seatsUsed} / {seatsLimit}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-right mt-1.5 text-muted-foreground">
              {isLimitReached 
                ? "Has alcanzado el límite de tu plan" 
                : `${seatsLimit - seatsUsed} asiento(s) disponible(s)`}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Barra de Invitación */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-muted/20 rounded-xl border border-dashed border-muted-foreground/25">
          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-sm font-semibold mb-1">Añadir Profesional</h4>
            <p className="text-xs text-muted-foreground">
              Invita a colaboradores usando su correo electrónico.
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button disabled={isLimitReached} variant={isLimitReached ? "outline" : "default"} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                {isLimitReached ? 'Límite Alcanzado' : 'Invitar Miembro'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invitar al equipo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email del profesional</label>
                  <Input 
                    placeholder="doctor@clinica.com" 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Se enviará una invitación. Si el usuario no tiene cuenta, deberá registrarse con este email.
                  </p>
                </div>
                <Button onClick={handleInvite} disabled={isInviting} className="w-full">
                  {isInviting ? 'Enviando...' : 'Enviar Invitación'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Miembros */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground px-1">Miembros del Equipo</h3>
          
          {/* Fila del Admin (Tú) */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm">
                TÚ
              </div>
              <div>
                <p className="font-medium text-sm">Administrador</p>
                <Badge variant="outline" className="text-[10px] mt-1 bg-background">Propietario</Badge>
              </div>
            </div>
            <div className="text-sm text-right">
              <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Tu Saldo</span>
              <span className="font-bold text-lg">{userCredits}</span>
            </div>
          </div>

          {/* Filas de Miembros */}
          {members.map((member) => (
            <div key={member.id} className="flex flex-col md:flex-row items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors gap-4">
              
              {/* Info Usuario */}
              <div className="flex items-center gap-4 flex-1 w-full">
                <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center text-muted-foreground shadow-sm">
                  <Mail className="w-5 h-5 opacity-70" />
                </div>
                <div>
                  <p className="font-medium text-sm">{member.member_email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="text-[10px] h-5">
                      {member.status === 'active' ? 'Activo' : 'Pendiente'}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 border-l pl-2">
                      <Coins className="w-3 h-3 text-yellow-500" />
                      {member.credits_allocated} asignados
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 mt-1 md:mt-0">
                <div className="flex items-center bg-background border rounded-md h-9 shadow-sm">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-full px-3 rounded-r-none border-r hover:bg-muted text-green-600 hover:text-green-700"
                    onClick={() => handleTransfer(member.member_email)}
                    title="Transferir créditos"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Input 
                    type="number" 
                    className="w-16 h-full border-0 text-center text-sm focus-visible:ring-0 p-0"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                  />
                  <span className="text-[10px] font-medium px-2 text-muted-foreground bg-muted/20 h-full flex items-center rounded-r-md">
                    CRÉDITOS
                  </span>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemove(member.id)}
                  title="Eliminar usuario"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
              <p>Aún no has invitado a nadie a tu equipo.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
