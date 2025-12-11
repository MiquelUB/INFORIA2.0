"use client";

import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

interface SearchModuleProps {
  placeholder?: string;
  onSearchChange: (query: string) => void;
}

export default function SearchModule({ 
  placeholder = "Buscar paciente por nombre, email o DNI...", 
  onSearchChange 
}: SearchModuleProps) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 w-full"
      />
    </div>
  );
}
