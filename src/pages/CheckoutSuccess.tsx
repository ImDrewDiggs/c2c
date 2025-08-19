import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Home, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  
  const orderData = location.state?.orderData;
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (sessionId) {
        try {
          const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: { sessionId }
          });

          if (error) throw error;

          setPaymentData(data);
          setPaymentVerified(true);
          
          if (data.status === 'paid') {
            toast({
              title: "Payment Verified",
              description: "Your payment has been processed successfully.",
            });
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          toast({
            variant: "destructive",
            title: "Verification Error",
            description: "Could not verify payment status.",
          });
        }
      } else if (!orderData) {
        navigate('/');
      }
    };

    verifyPayment();
  }, [sessionId, orderData, navigate, toast]);

  if (!orderData) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  const { checkoutData, customerInfo, paymentMethod, total } = orderData;

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-green-600">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground mt-2">
            Thank you for your subscription. Your service will begin shortly.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-medium">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium">${total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Service Type</p>
                <p className="font-medium capitalize">
                  {checkoutData.subscriptionType.replace('_', ' ')} Service
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <Badge variant="secondary" className="capitalize">
                  {paymentMethod}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Service Address</p>
              <p className="font-medium">
                {customerInfo.serviceAddress}<br />
                {customerInfo.city}, {customerInfo.state} {customerInfo.zipCode}
              </p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Contact Information</p>
              <p className="font-medium">
                {customerInfo.firstName} {customerInfo.lastName}<br />
                {customerInfo.email}<br />
                {customerInfo.phone}
              </p>
            </div>

            {customerInfo.specialInstructions && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Special Instructions</p>
                <p className="font-medium">{customerInfo.specialInstructions}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            What happens next?
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
            <li>• You'll receive a confirmation email within 5 minutes</li>
            <li>• Our team will contact you within 24 hours to schedule your first service</li>
            <li>• Service will begin according to your selected schedule</li>
            <li>• You can manage your subscription anytime from your dashboard</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate('/')}
            className="flex-1"
            variant="outline"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button 
            onClick={() => navigate('/customer/dashboard')}
            className="flex-1"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}