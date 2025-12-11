"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";

// 1. Definir el esquema (solo el nombre)
const formSchema = z.object({
  full_name: z.string().min(3, "Tu nombre debe tener al menos 3 caracteres."),
});

export function OnboardingForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
    },
  });

  // 2. Función de guardado
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.full_name,
        onboarding_completed: true, // ¡Marcar como completado!
      })
      .eq("id", userId);

    setIsSaving(false);

    if (error) {
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar tu nombre. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "¡Bienvenido!",
        description: "Perfil actualizado.",
      });
      router.push("/dashboard"); // 3. Redirigir al dashboard
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Tu nombre y apellido" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Continuar al Dashboard"
          )}
        </Button>
      </form>
    </Form>
  );
}