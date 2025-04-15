
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EmployeeFiltersProps {
  searchTerm: string;
  statusFilter: "all" | "active" | "inactive";
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: "all" | "active" | "inactive") => void;
}

export function EmployeeFilters({ 
  searchTerm, 
  statusFilter, 
  onSearchChange, 
  onStatusFilterChange 
}: EmployeeFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search employees"
        />
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant={statusFilter === "all" ? "default" : "outline"} 
          size="sm"
          onClick={() => onStatusFilterChange("all")}
        >
          All
        </Button>
        <Button 
          variant={statusFilter === "active" ? "default" : "outline"} 
          size="sm"
          onClick={() => onStatusFilterChange("active")}
          className={statusFilter === "active" ? "bg-green-600 hover:bg-green-700" : ""}
        >
          Active
        </Button>
        <Button 
          variant={statusFilter === "inactive" ? "default" : "outline"} 
          size="sm"
          onClick={() => onStatusFilterChange("inactive")}
          className={statusFilter === "inactive" ? "bg-gray-500 hover:bg-gray-600" : ""}
        >
          Inactive
        </Button>
      </div>
    </div>
  );
}
