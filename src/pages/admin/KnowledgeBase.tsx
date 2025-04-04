
import { useState } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search,
  FileText,
  FolderOpen,
  Plus,
  BookOpen,
  HelpCircle
} from "lucide-react";

export default function AdminKnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data for knowledge base categories
  const categories = [
    { id: 1, name: "Getting Started", icon: BookOpen, articles: 8 },
    { id: 2, name: "Customer Management", icon: FileText, articles: 12 },
    { id: 3, name: "Employee Procedures", icon: FileText, articles: 15 },
    { id: 4, name: "Vehicle Maintenance", icon: FileText, articles: 10 },
    { id: 5, name: "Safety Guidelines", icon: FileText, articles: 7 },
    { id: 6, name: "Software Usage", icon: FileText, articles: 14 },
  ];
  
  // Mock data for recent articles
  const recentArticles = [
    { id: 1, title: "Setting Up New Customer Accounts", category: "Customer Management", updated: "2025-04-01" },
    { id: 2, title: "Vehicle Pre-Trip Inspection Guide", category: "Safety Guidelines", updated: "2025-03-28" },
    { id: 3, title: "Using the Route Optimization Tool", category: "Software Usage", updated: "2025-03-25" },
    { id: 4, title: "Monthly Reporting Procedures", category: "Employee Procedures", updated: "2025-03-20" },
    { id: 5, title: "Troubleshooting GPS Tracking Issues", category: "Software Usage", updated: "2025-03-15" },
  ];
  
  const filteredArticles = recentArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <AdminPageLayout 
      title="Knowledge Base" 
      description="Documentation and training resources"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search knowledge base..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <category.icon className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="mb-2">{category.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{category.articles} articles</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recently Updated Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <div key={article.id} className="flex items-start gap-4 p-3 hover:bg-accent/50 rounded-md transition-colors cursor-pointer">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium">{article.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <span>{article.category}</span>
                        <span className="mx-2">•</span>
                        <span>Updated {article.updated}</span>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No articles found matching your search.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
}
