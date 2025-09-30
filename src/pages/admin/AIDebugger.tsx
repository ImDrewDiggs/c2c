import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bug, Search, Zap, AlertTriangle, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ReactMarkdown from "react-markdown";

export default function AIDebugger() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analysisType, setAnalysisType] = useState<string>("full_scan");
  const [customQuery, setCustomQuery] = useState("");
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        setIsCheckingAccess(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (error) {
          console.error('Error checking admin access:', error);
          setHasAdminAccess(false);
        } else {
          setHasAdminAccess(data === true);
        }
      } catch (error) {
        console.error('Failed to check admin access:', error);
        setHasAdminAccess(false);
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkAdminAccess();
  }, [user]);

  const gatherContext = async () => {
    const context: any = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Try to gather console logs from performance
    try {
      const perfEntries = performance.getEntriesByType("navigation");
      context.performance = perfEntries;
    } catch (e) {
      console.error("Could not gather performance data:", e);
    }

    return context;
  };

  const runAnalysis = async () => {
    if (!hasAdminAccess) {
      toast({
        title: "Access Denied",
        description: "You need admin access to use this feature",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis("");

    try {
      const context = await gatherContext();
      
      if (analysisType === "custom" && customQuery) {
        context.query = customQuery;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const { data, error } = await supabase.functions.invoke("ai-code-analyzer", {
        body: {
          analysisType,
          context,
        },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });

      if (error) {
        console.error('Function invocation error:', error);
        let serverMsg: string | undefined;
        try {
          if (error.context) {
            const parsed = JSON.parse(error.context as unknown as string);
            serverMsg = parsed?.error || parsed?.message;
          }
        } catch {}
        throw new Error(serverMsg || error.message || 'Failed to invoke AI analyzer');
      }

      if (data?.error) {
        console.error('Analysis error:', data.error);
        toast({
          title: "Analysis Failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (!data?.analysis) {
        throw new Error('No analysis data received');
      }

      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "AI has finished analyzing your application",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to run analysis";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isCheckingAccess) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-4">Checking access permissions...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to access the AI Code Analyzer.
            <Button 
              variant="link" 
              className="ml-2" 
              onClick={() => navigate('/admin/login')}
            >
              Go to Login
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have admin access to use the AI Code Analyzer.
            Only administrators can access this feature.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Code Analyzer & Debugger</h1>
        <p className="text-muted-foreground">
          AI-powered tool to find bugs, diagnose issues, and suggest fixes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Configuration</CardTitle>
          <CardDescription>
            Select the type of analysis you want to perform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Analysis Type</label>
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_scan">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Full Application Scan
                  </div>
                </SelectItem>
                <SelectItem value="error_diagnosis">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4" />
                    Error Diagnosis
                  </div>
                </SelectItem>
                <SelectItem value="missing_features">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Find Missing Features
                  </div>
                </SelectItem>
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Custom Query
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {analysisType === "custom" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Query</label>
              <Textarea
                placeholder="Describe what you want the AI to analyze..."
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                rows={4}
              />
            </div>
          )}

          <Button
            onClick={runAnalysis}
            disabled={isAnalyzing || (analysisType === "custom" && !customQuery)}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Run Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isAnalyzing && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            AI is analyzing your application. This may take a minute...
          </AlertDescription>
        </Alert>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Review the findings and suggested fixes below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
