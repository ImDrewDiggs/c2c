import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, User, Home, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "customer" | "property" | "assignment";
  title: string;
  subtitle: string;
  status?: string;
  data: any;
}

interface QuickSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickSearchModal({ open, onOpenChange }: QuickSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const debounceTimer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const query = searchQuery.toLowerCase();
      const results: SearchResult[] = [];

      // Search customers
      const { data: customers, error: customerError } = await supabase
        .from("profiles")
        .select("*")
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(5);

      if (customerError) throw customerError;

      customers?.forEach(customer => {
        results.push({
          id: customer.id,
          type: "customer",
          title: customer.full_name || customer.email,
          subtitle: `${customer.email} • ${customer.role}`,
          status: customer.status,
          data: customer,
        });
      });

      // Search properties/houses
      const { data: houses, error: houseError } = await supabase
        .from("houses")
        .select("*")
        .ilike("address", `%${query}%`)
        .limit(5);

      if (houseError) throw houseError;

      houses?.forEach(house => {
        results.push({
          id: house.id,
          type: "property",
          title: house.address,
          subtitle: `Property • Lat: ${house.latitude}, Lng: ${house.longitude}`,
          data: house,
        });
      });

      // Search assignments/tasks
      const { data: assignments, error: assignmentError } = await supabase
        .from("assignments")
        .select(`
          *,
          houses!inner(address),
          profiles!inner(full_name, email)
        `)
        .or(`houses.address.ilike.%${query}%,profiles.full_name.ilike.%${query}%`)
        .limit(5);

      if (assignmentError) throw assignmentError;

      assignments?.forEach(assignment => {
        results.push({
          id: assignment.id,
          type: "assignment",
          title: `Assignment - ${(assignment as any).houses?.address}`,
          subtitle: `Assigned to: ${(assignment as any).profiles?.full_name || "Unknown"}`,
          status: assignment.status,
          data: assignment,
        });
      });

      setResults(results);
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "customer":
        return User;
      case "property":
        return Home;
      case "assignment":
        return Truck;
      default:
        return Search;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "suspended":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleResultClick = (result: SearchResult) => {
    toast({
      title: "Selected",
      description: `Selected ${result.type}: ${result.title}`,
    });
    // Here you could navigate to the specific item or open a detail modal
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Quick Search</DialogTitle>
          <DialogDescription>
            Search customers, properties, and assignments quickly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers, addresses, assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {isLoading && (
              <div className="text-center py-4 text-muted-foreground">
                Searching...
              </div>
            )}

            {!isLoading && searchQuery && results.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No results found for "{searchQuery}"
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="space-y-2">
                {results.map((result) => {
                  const IconComponent = getResultIcon(result.type);
                  return (
                    <Card 
                      key={`${result.type}-${result.id}`}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleResultClick(result)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-foreground truncate">
                                {result.title}
                              </p>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant="secondary"
                                  className="text-xs capitalize"
                                >
                                  {result.type}
                                </Badge>
                                {result.status && (
                                  <Badge 
                                    className={cn(
                                      "text-xs capitalize",
                                      getStatusColor(result.status)
                                    )}
                                  >
                                    {result.status}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {result.subtitle}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {!searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Start typing to search customers, properties, and assignments</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}