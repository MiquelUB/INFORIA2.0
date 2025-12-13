'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, UserPlus, Trash2, ShieldAlert, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { PlanAssignment } from '@/lib/types';

interface TeamManagementProps {
    currentProfile: any; // Se pasa el perfil actual para saber límites
}

export function TeamManagement({ currentProfile }: TeamManagementProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [assignments, setAssignments] = useState<PlanAssignment[]>([]);

    // Estado del formulario
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteCredits, setInviteCredits] = useState<number>(0);

    // Cálculos
    const totalSeats = currentProfile?.seats_allowed || 1;
    const usedSeats = 1 + assignments.length; // 1 (Owner) + Invitados
    const seatsAvailable = totalSeats - usedSeats;

    const totalCredits = currentProfile?.credits_limit || 0;
    const distributedCredits = assignments.reduce((acc, curr) => acc + curr.allocated_credits, 0);
    const availableToDistribute = totalCredits - distributedCredits;

    // Cargar asignaciones al iniciar
    useEffect(() => {
        fetchAssignments();
    }, [currentProfile?.id]);

    const fetchAssignments = async () => {
        if (!currentProfile?.id) return;

        const { data, error } = await (supabase
            .from('plan_assignments') as any)
            .select('*')
            .eq('owner_id', currentProfile.id);

        if (error) {
            console.error('Error fetching team:', error);
        } else {
            setAssignments(data || []);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail || inviteCredits <= 0) {
            toast.error('Por favor introduce un email y una cantidad de créditos válida');
            return;
        }

        // Validación Cliente: Asientos
        if (usedSeats >= totalSeats) {
            toast.error(`Has alcanzado el límite de ${totalSeats} usuarios de tu plan.`);
            return;
        }

        // Validación Cliente: Créditos
        if (inviteCredits > availableToDistribute) {
            toast.error(`Solo tienes ${availableToDistribute} créditos disponibles para repartir.`);
            return;
        }

        setLoading(true);
        try {
            const { error } = await (supabase.from('plan_assignments') as any).insert({
                owner_id: currentProfile.id,
                email: inviteEmail.trim().toLowerCase(),
                allocated_credits: inviteCredits,
                status: 'active'
            });

            if (error) throw error;

            toast.success(`Invitación enviada a ${inviteEmail}`);
            setInviteEmail('');
            setInviteCredits(0);
            fetchAssignments(); // Recargar lista
        } catch (error: any) {
            console.error('Error inviting:', error);
            toast.error(error.message || 'Error al enviar invitación');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (assignmentId: string, email: string) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar a ${email}? Perderá el acceso premium inmediatamente.`)) return;

        try {
            const { error } = await (supabase
                .from('plan_assignments') as any)
                .delete()
                .eq('id', assignmentId);

            if (error) throw error;

            toast.success('Miembro eliminado correctamente');
            fetchAssignments();
        } catch (error) {
            toast.error('Error al eliminar miembro');
        }
    };

    // Si no tienes asientos permitidos (Plan Free/Single), mostramos upsell o nada
    if (totalSeats <= 1) {
        return (
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Gestión de Equipo
                    </CardTitle>
                    <CardDescription>
                        Tu plan actual es individual. Actualiza al Plan Clínica para invitar a otros profesionales y compartir créditos.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl font-serif text-primary">Gestión de Equipo</CardTitle>
                        <CardDescription>Administra el acceso y distribuye créditos a tus colaboradores.</CardDescription>
                    </div>
                    <Badge variant={seatsAvailable > 0 ? "default" : "destructive"}>
                        {seatsAvailable} Asientos Disponibles
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Estadísticas de Reparto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Ocupación del Plan</span>
                            <span>{usedSeats} / {totalSeats} Usuarios</span>
                        </div>
                        <Progress value={(usedSeats / totalSeats) * 100} className="h-2" />
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="flex items-center gap-1">
                                <Coins className="h-4 w-4 text-yellow-600" />
                                Distribución de Créditos
                            </span>
                            <span>{distributedCredits} repartidos / {availableToDistribute} libres</span>
                        </div>
                        <Progress value={(distributedCredits / totalCredits) * 100} className="h-2 bg-yellow-100" />
                        <p className="text-xs text-muted-foreground text-right">Total Plan: {totalCredits}</p>
                    </div>
                </div>

                {/* Formulario de Invitación */}
                <div className="p-4 border rounded-lg bg-card">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Invitar Nuevo Miembro
                    </h3>
                    <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid gap-2 flex-1 w-full">
                            <Label htmlFor="email">Email del Colaborador</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="colaborador@clinica.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                disabled={seatsAvailable === 0}
                            />
                        </div>

                        <div className="grid gap-2 w-full md:w-40">
                            <Label htmlFor="credits">Asignar Créditos</Label>
                            <Input
                                id="credits"
                                type="number"
                                min="0"
                                max={availableToDistribute}
                                placeholder="Ej. 100"
                                value={inviteCredits || ''}
                                onChange={(e) => setInviteCredits(parseInt(e.target.value) || 0)}
                                disabled={seatsAvailable === 0}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || seatsAvailable === 0}
                            className="w-full md:w-auto"
                        >
                            {loading ? 'Invitando...' : 'Invitar'}
                        </Button>
                    </form>
                    {seatsAvailable === 0 && (
                        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" />
                            No tienes asientos libres. Elimina un miembro o mejora tu plan.
                        </p>
                    )}
                </div>

                {/* Lista de Miembros */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Miembro</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Créditos Asignados</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Renderizar al Dueño (Opcional, para visualizarse a uno mismo) */}
                            <TableRow className="bg-muted/20">
                                <TableCell className="font-medium">
                                    {currentProfile?.full_name} (Tú)
                                    <Badge variant="outline" className="ml-2 text-xs">Administrador</Badge>
                                </TableCell>
                                <TableCell><Badge className="bg-green-500">Activo</Badge></TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    Globales ({availableToDistribute})
                                </TableCell>
                                <TableCell></TableCell>
                            </TableRow>

                            {/* Renderizar Hijos */}
                            {assignments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No has invitado a ningún miembro todavía.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assignments.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{member.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {member.allocated_credits}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleRemoveMember(member.id, member.email)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
