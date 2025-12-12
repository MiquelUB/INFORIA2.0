"use client";
import { Input } from "@/components/ui/input";
import { Search, User, FileText, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// 1. Definir las props
interface SearchModuleProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export function SearchModule({
  searchQuery,
  onSearchChange,
  placeholder = "Buscar paciente por nombre, DNI o email..."
}: SearchModuleProps) {
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
            placeholder={placeholder}
            className="pl-10 pr-4"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}