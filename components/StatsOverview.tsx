import { Card, CardContent } from "./ui/card";
import { Users, FileText, TrendingUp, Calendar } from "lucide-react";
import { useStats } from "@/hooks/useStats";
import { Skeleton } from "./ui/skeleton";

const StatsOverview = () => {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-4 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Pacientes",
      value: stats?.totalPatients || 0,
      icon: Users,
      color: "text-inforia",
      bgColor: "bg-inforia/10"
    },
    {
      title: "Informes",
      value: stats?.totalReports || 0,
      icon: FileText,
      color: "text-burgundy",
      bgColor: "bg-burgundy/10"
    },
    {
      title: "Este Mes",
      value: "12",
      icon: TrendingUp,
      color: "text-gold",
      bgColor: "bg-gold/10"
    },
    {
      title: "Citas Hoy",
      value: "5",
      icon: Calendar,
      color: "text-foreground",
      bgColor: "bg-muted/50"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-in">
      {statsData.map((stat, index) => (
        <Card 
          key={stat.title} 
          className="group hover:shadow-md transition-calm border-module-border hover-scale"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stat.value}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;