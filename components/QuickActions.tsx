import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, Users, FileText, Search } from "lucide-react";
import Link from "next/link";

const QuickActions = () => {
  const actions = [
    {
      title: "Nuevo Paciente",
      description: "Registrar un nuevo paciente",
      icon: Plus,
      href: "/new-patient",
      className: "bg-inforia hover:bg-inforia/90 text-inforia-foreground"
    },
    {
      title: "Lista de Pacientes", 
      description: "Ver todos los pacientes",
      icon: Users,
      href: "/patient-list",
      className: "bg-burgundy hover:bg-burgundy/90 text-burgundy-foreground"
    },
    {
      title: "Espacio de Sesión",
      description: "Registrar nueva sesión",
      icon: FileText,
      href: "/session-workspace", 
      className: "bg-gold hover:bg-gold/90 text-gold-foreground"
    },
    {
      title: "FAQs",
      description: "Centro de ayuda",
      icon: Search,
      href: "/faqs",
      className: "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
    }
  ];

  return (
    <Card className="border-module-border animate-fade-in">
      <CardHeader>
        <CardTitle className="font-serif text-lg text-foreground">
          Acciones Rápidas
        </CardTitle>
        <CardDescription>
          Accede directamente a las funciones principales
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <Link 
            key={action.title} 
            href={action.href}
            className="block animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Button
              variant="outline"
              className={`w-full justify-start h-auto p-4 hover:scale-[1.02] transition-all duration-200 ${action.className} border-transparent`}
            >
              <action.icon className="mr-3 h-4 w-4 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs opacity-80 mt-1">
                  {action.description}
                </div>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickActions;