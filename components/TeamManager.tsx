'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Plus, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { inviteTeamMember } from '@/app/actions/team'

interface TeamManagerProps {
  invitationsTotal: number
  invitationsSent: number
  sponsorId: string
}

export function TeamManager({ 
  invitationsTotal, 
  invitationsSent 
}: TeamManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  
  const available = invitationsTotal - invitationsSent
  const progress = invitationsTotal > 0 ? (invitationsSent / invitationsTotal) * 100 : 0
  const hasAvailable = available > 0

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Por favor ingresa un email')
      return
    }

    setIsLoading(true)
    
    const formData = new FormData()
    formData.append('email', email)
    
    const result = await inviteTeamMember(formData)
    
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else if (result.success) {
      toast.success('¡Invitación enviada correctamente!')
      setEmail('')
    }
  }

  // Si no tiene plan multi-usuario, no mostramos nada
  if (invitationsTotal <= 1) {
    return null
  }

  return (
    <Card className="mt-8 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Users className="h-5 w-5" />
          Gestión de Equipo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Estado de Licencias */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-blue-700">
            <span>Licencias ocupadas: {invitationsSent} de {invitationsTotal}</span>
            <span className="text-blue-600 font-semibold">{available} disponibles</span>
          </div>
          
          {/* Barra de progreso personalizada */}
          <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Formulario de Invitación */}
        <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-900">
            <Plus className="h-4 w-4 text-blue-600" /> 
            Invitar nuevo miembro
          </h4>
          
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input 
              name="email" 
              type="email" 
              placeholder="correo@psicologo.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="flex-1"
              disabled={isLoading || !hasAvailable}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !hasAvailable}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Enviando...' : 'Enviar'}
            </Button>
          </form>
          
          {!hasAvailable && (
            <div className="flex items-center gap-2 text-xs text-red-600 mt-3 p-2 bg-red-50 rounded">
              <AlertCircle className="h-4 w-4" />
              Has agotado tus licencias. Contacta para ampliar tu plan.
            </div>
          )}
        </div>

        {/* Info adicional */}
        <div className="bg-blue-100/50 border border-blue-200 rounded p-3 text-xs text-blue-900">
          <p>
            📧 Los miembros invitados recibirán un email con instrucciones para unirse a tu equipo.
            Tendrán acceso a todas las herramientas con un plan {available > 0 ? 'profesional' : 'limitado'}.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
