
import { useState } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search,
  FileText,
  Plus,
  X,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Clock
} from "lucide-react";
import { knowledgeCategories, knowledgeArticles, KnowledgeArticle } from "@/data/knowledgeBaseArticles";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function AdminKnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [viewingArticle, setViewingArticle] = useState<KnowledgeArticle | null>(null);
  
  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setViewingArticle(null);
  };
  
  const handleArticleSelect = (article: KnowledgeArticle) => {
    setViewingArticle(article);
  };
  
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setViewingArticle(null);
  };
  
  const handleBackToArticles = () => {
    setViewingArticle(null);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "book-open":
        return <BookOpen />;
      case "file-text":
        return <FileText />;
      case "clipboard-list":
        return <FileText />;
      case "truck":
        return <FileText />;
      case "shield":
        return <FileText />;
      case "laptop":
        return <FileText />;
      case "users":
        return <FileText />;
      default:
        return <FileText />;
    }
  };
  
  // Filter articles based on search and selected category
  const filteredArticles = knowledgeArticles.filter(
    (article) => {
      const matchesSearch = searchTerm === "" || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === null || article.categoryId === selectedCategory;
      
      return matchesSearch && matchesCategory;
    }
  );
  
  // Get category name for display
  const getCategoryName = (categoryId: number): string => {
    const category = knowledgeCategories.find(c => c.id === categoryId);
    return category ? category.name : "Uncategorized";
  };
  
  return (
    <AdminPageLayout 
      title="Knowledge Base" 
      description="Documentation and training resources"
    >
      <div className="space-y-6">
        {/* Search and navigation controls */}
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
          
          <div className="flex gap-2">
            {(selectedCategory || viewingArticle) && (
              <Button variant="outline" onClick={handleBackToCategories}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Categories
              </Button>
            )}
            {viewingArticle && (
              <Button variant="outline" onClick={handleBackToArticles}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Articles
              </Button>
            )}
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Article
            </Button>
          </div>
        </div>
        
        {/* Category grid - show when no category or article is selected */}
        {!selectedCategory && !viewingArticle && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {knowledgeCategories.map((category) => (
              <Card 
                key={category.id} 
                className="hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 text-primary mb-4 flex items-center justify-center">
                    {getIconComponent(category.icon)}
                  </div>
                  <CardTitle className="mb-2">{category.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                  <Badge variant="outline">{category.articles} articles</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Articles list - show when a category is selected but no article is being viewed */}
        {selectedCategory && !viewingArticle && (
          <Card>
            <CardHeader>
              <CardTitle>
                {getCategoryName(selectedCategory)} Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => (
                    <div 
                      key={article.id} 
                      className="flex items-start gap-4 p-3 hover:bg-accent/50 rounded-md transition-colors cursor-pointer"
                      onClick={() => handleArticleSelect(article)}
                    >
                      <FileText className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-medium">{article.title}</h3>
                        <p className="text-sm text-muted-foreground">{article.summary}</p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
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
        )}
        
        {/* Article content view - show when an article is selected */}
        {viewingArticle && (
          <Card className="relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{viewingArticle.category}</Badge>
                    {viewingArticle.tags?.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <CardTitle>{viewingArticle.title}</CardTitle>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={handleBackToArticles}
                  className="absolute top-4 right-4"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Clock className="h-3 w-3 mr-1" />
                <span>Updated {viewingArticle.updated}</span>
                {viewingArticle.author && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Author: {viewingArticle.author}</span>
                  </>
                )}
              </div>
              <Separator className="mt-4" />
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>
                    {viewingArticle.content}
                  </ReactMarkdown>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
        
        {/* Recent articles - only show on main page */}
        {!selectedCategory && !viewingArticle && (
          <Card>
            <CardHeader>
              <CardTitle>Recently Updated Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {knowledgeArticles
                  .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
                  .slice(0, 5)
                  .map((article) => (
                    <div 
                      key={article.id} 
                      className="flex items-start gap-4 p-3 hover:bg-accent/50 rounded-md transition-colors cursor-pointer"
                      onClick={() => handleArticleSelect(article)}
                    >
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
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminPageLayout>
  );
}
