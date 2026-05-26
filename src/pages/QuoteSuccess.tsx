import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Seo from "@/components/seo/Seo";

type ProvisionResult = {
  status: string;
  provisioned: boolean;
  email?: string;
  service_address?: string;
  tier?: string;
  cans?: number;
  recycle?: boolean;
  monthly_price?: number;
  magic_link?: string | null;
};

export default function QuoteSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const sessionId = params.get("session_id");
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ProvisionResult | null>(null);

  useEffect(() => {
    if (!sessionId) {
      navigate("/", { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("provision-quote", {
          body: { sessionId },
        });
        if (error) throw error;
        if (!cancelled) setResult(data as ProvisionResult);
      } catch (e) {
        console.error("provision error:", e);
        if (!cancelled) {
          toast({
            variant: "destructive",
            title: "Provisioning issue",
            description: "Payment received but setup is taking longer than usual. Our team will reach out.",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId, navigate, toast]);

  return (
    <div className="container mx-auto py-12 px-4">
      <Seo title="Service Activated | Can2Curb" description="Your Can2Curb service is now active." path="/quote/success" />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
        {loading ? (
          <Card>
            <CardContent className="p-10 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Setting up your service…</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/30">
            <CardContent className="p-8 space-y-5 text-center">
              <CheckCircle2 className="w-14 h-14 text-primary mx-auto" />
              <div>
                <h1 className="text-2xl font-bold">You're all set!</h1>
                <p className="text-muted-foreground mt-1">
                  {result?.provisioned
                    ? `Your ${result.tier} plan is active for ${result.service_address}.`
                    : "Payment received. Your service will be activated shortly."}
                </p>
              </div>
              {result?.provisioned && (
                <div className="text-sm rounded-lg bg-muted/50 p-4 space-y-1 text-left">
                  <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span>{result.tier}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cans</span><span>{result.cans}{result.recycle ? " + recycle" : ""}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Monthly</span><span>${result.monthly_price?.toFixed(2)}</span></div>
                </div>
              )}
              <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                <Mail className="w-4 h-4" /> We've emailed a sign-in link to {result?.email || "your inbox"}.
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button className="flex-1" onClick={() => navigate("/customer/login")}>Sign in to dashboard</Button>
                <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>Back to home</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}