import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Home, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Seo } from "@/components/seo/Seo";

type PaymentData = {
  status?: string;
  customerEmail?: string;
  amountTotal?: number | null;
  metadata?: Record<string, string>;
};

export default function CheckoutSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const orderData = location.state?.orderData;
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    let active = true;
    const verifyPayment = async () => {
      if (!sessionId) {
        setLoading(false);
        if (!orderData) navigate("/", { replace: true });
        return;
      }
      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { sessionId },
        });
        if (error) throw error;
        if (!active) return;
        setPaymentData(data as PaymentData);
        if ((data as PaymentData)?.status === "paid") {
          toast({ title: "Payment Verified", description: "Your payment was processed successfully." });
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        toast({
          variant: "destructive",
          title: "Verification Error",
          description: "We couldn't verify your payment status. Please contact support if you were charged.",
        });
      } finally {
        if (active) setLoading(false);
      }
    };
    verifyPayment();
    return () => {
      active = false;
    };
  }, [sessionId, orderData, navigate, toast]);

  const amount =
    paymentData?.amountTotal != null
      ? (paymentData.amountTotal / 100).toFixed(2)
      : orderData?.total != null
      ? Number(orderData.total).toFixed(2)
      : null;
  const email = paymentData?.customerEmail || orderData?.customerInfo?.email;
  const tier = paymentData?.metadata?.selectedTier || orderData?.checkoutData?.selectedTier;
  const subType = paymentData?.metadata?.subscriptionType || orderData?.checkoutData?.subscriptionType;
  const paid = paymentData?.status === "paid" || !!orderData;

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <Seo
        title="Order Confirmed | Can2Curb"
        description="Your Can2Curb subscription is confirmed. Service will begin shortly."
        path="/checkout/success"
       
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
            {loading ? (
              <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            ) : (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            )}
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-green-600">
            {loading ? "Verifying payment…" : paid ? "Order Confirmed!" : "Payment Pending"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {loading
              ? "Hang tight while we confirm your payment with Stripe."
              : paid
              ? "Thank you for your subscription. Your service will begin shortly."
              : "Your payment is still processing. You'll get an email once it's complete."}
          </p>
        </div>

        {!loading && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle as="h2">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {amount && (
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium">${amount}</p>
                  </div>
                )}
                {paymentData?.status && (
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={paid ? "default" : "secondary"} className="capitalize">
                      {paymentData.status}
                    </Badge>
                  </div>
                )}
                {subType && (
                  <div>
                    <p className="text-sm text-muted-foreground">Service Type</p>
                    <p className="font-medium capitalize">{String(subType).replace("_", " ")}</p>
                  </div>
                )}
                {tier && (
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="font-medium capitalize">{tier}</p>
                  </div>
                )}
              </div>
              {email && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Receipt sent to</p>
                  <p className="font-medium">{email}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-2">What happens next?</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• You'll receive a confirmation email within 5 minutes</li>
            <li>• Our team will contact you within 24 hours to schedule your first service</li>
            <li>• Manage your subscription anytime from your billing dashboard</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => navigate("/")} className="flex-1" variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button onClick={() => navigate("/customer/billing")} className="flex-1">
            <FileText className="w-4 h-4 mr-2" />
            View Billing
          </Button>
        </div>
      </motion.div>
    </div>
  );
}