
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { EmployeeData } from "./types";

interface EmployeeFiltersProps {
  employees: EmployeeData[];
  onFilterChange: (filtered: EmployeeData[]) => void;
}

export function EmployeeFilters({ employees, onFilterChange }: EmployeeFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Filter employees based on search and status filter
  useEffect(() => {
    let filtered = employees;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(query) || 
        emp.id.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }
    
    onFilterChange(filtered);
  }, [searchQuery, statusFilter, employees, onFilterChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search employees"
        />
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant={statusFilter === "all" ? "default" : "outline"} 
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          All
        </Button>
        <Button 
          variant={statusFilter === "active" ? "default" : "outline"} 
          size="sm"
          onClick={() => setStatusFilter("active")}
          className={statusFilter === "active" ? "bg-green-600 hover:bg-green-700" : ""}
        >
          Active
        </Button>
        <Button 
          variant={statusFilter === "inactive" ? "default" : "outline"} 
          size="sm"
          onClick={() => setStatusFilter("inactive")}
          className={statusFilter === "inactive" ? "bg-gray-500 hover:bg-gray-600" : ""}
        >
          Inactive
        </Button>
      </div>
    </div>
  );
}
