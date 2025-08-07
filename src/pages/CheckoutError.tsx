import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function CheckoutError() {
  const location = useLocation();
  const navigate = useNavigate();
  const errorMessage = location.state?.error || "An unexpected error occurred during checkout.";

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
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-red-600">
            Payment Failed
          </h1>
          <p className="text-muted-foreground mt-2">
            We encountered an issue processing your payment.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Error Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">
                {errorMessage}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            Common solutions:
          </h3>
          <ul className="space-y-2 text-yellow-800 dark:text-yellow-200 text-sm">
            <li>• Check that your payment information is correct</li>
            <li>• Ensure your card has sufficient funds</li>
            <li>• Verify that your card is not expired</li>
            <li>• Try a different payment method</li>
            <li>• Contact your bank if the issue persists</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate('/subscription')}
            className="flex-1"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Subscription
          </Button>
          <Button 
            onClick={() => navigate('/checkout', { state: location.state?.checkoutData })}
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Contact our support team at{" "}
            <a href="mailto:support@can2curb.com" className="text-primary hover:underline">
              support@can2curb.com
            </a>{" "}
            or call{" "}
            <a href="tel:+1234567890" className="text-primary hover:underline">
              (123) 456-7890
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}