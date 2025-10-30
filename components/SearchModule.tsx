import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Search,User, FileText, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useSearchPatients } from "@/lib/hooks/usePatients";
import { useReports } from "@/lib/hooks/useReports";
import Link from "next/link";
import { useDebounce } from "@/lib/hooks/useDebounce";

const SearchModule = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<'all' | 'patients' | 'reports'>('all');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { data: patients = [] } = useSearchPatients(debouncedQuery);
  const { data: allReports = [] } = useReports();
  
  // Filter reports by search query
  const reports = allReports.filter(report => 
    report.title?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
    report.content?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
    report.patients?.name?.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  const hasResults = patients.length > 0 || reports.length > 0;
  const showResults = debouncedQuery.length > 0 && (isExpanded || hasResults);

  const filteredResults = () => {
    switch (activeFilter) {
      case 'patients':
        return { patients, reports: [] };
      case 'reports':
        return { patients: [], reports };
      default:
        return { patients, reports };
    }
  };

  const { patients: filteredPatients, reports: filteredReports } = filteredResults();

  return (
    <Card className="border-module-border bg-module-background hover:shadow-md transition-calm">
      <CardHeader className="pb-3">
        <CardTitle className="module-title flex items-center">
          <Search className="mr-2 h-4 w-4" />
          Búsqueda Universal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pacientes, informes, citas..."
            className="pl-10 pr-4"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.length > 0) setIsExpanded(true);
            }}
            onFocus={() => setIsExpanded(true)}
          />
        </div>

        {/* Filters */}
        {showResults && (
          <div className="flex gap-2">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('all')}
              className="text-xs"
            >
              Todo ({patients.length + reports.length})
            </Button>
            <Button
              variant={activeFilter === 'patients' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('patients')}
              className="text-xs"
            >
              <User className="mr-1 h-3 w-3" />
              Pacientes ({patients.length})
            </Button>
            <Button
              variant={activeFilter === 'reports' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('reports')}
              className="text-xs"
            >
              <FileText className="mr-1 h-3 w-3" />
              Informes ({reports.length})
            </Button>
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
            {/* Patients Results */}
            {filteredPatients.map((patient) => (
              <Link
                key={patient.id}
                href={`/patient-detailed-profile?id=${patient.id}`}
                className="block p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-calm border border-transparent hover:border-primary/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {patient.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {patient.email || patient.phone}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}

            {/* Reports Results */}
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-calm border border-transparent hover:border-primary/20 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-burgundy/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-burgundy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {report.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {report.patients?.name} - {new Date(report.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {report.status === 'completed' ? 'Completado' : 'En proceso'}
                  </Badge>
                </div>
              </div>
            ))}

            {/* No Results */}
            {!hasResults && debouncedQuery.length > 0 && (
              <div className="text-center py-6">
                <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No se encontraron resultados para "{debouncedQuery}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Access when not searching */}
        {!searchQuery && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Acceso rápido
            </h3>
            <div className="space-y-2">
              <Link
                href="/patient-list"
                className="flex items-center space-x-3 p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-calm"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    Todos los pacientes
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              
              <div className="flex items-center space-x-3 p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-calm cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-burgundy/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-burgundy" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    Informes recientes
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { SearchModule };