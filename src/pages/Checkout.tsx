import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { CreditCard, DollarSign, Smartphone, Phone, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { validateAndSanitizeCustomerInfo } from "@/utils/inputValidation";
import { useSecureErrorHandler } from "@/utils/secureErrorHandler";
import { supabase } from "@/integrations/supabase/client";

interface CheckoutData {
  subscriptionType: string;
  selectedTier?: string;
  selectedServiceTypes: string[];
  selectedCommunityTierId?: string;
  selectedServiceId?: string;
  unitCount: number;
  total: number;
  services: any[];
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceAddress: string;
  billingAddress: string;
  city: string;
  state: string;
  zipCode: string;
  specialInstructions: string;
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { handleError } = useSecureErrorHandler();
  
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    serviceAddress: "",
    billingAddress: "",
    city: "",
    state: "",
    zipCode: "",
    specialInstructions: ""
  });

  useEffect(() => {
    if (location.state) {
      setCheckoutData(location.state as CheckoutData);
    } else {
      // Redirect back to subscription page if no data
      navigate('/subscription');
    }
  }, [location.state, navigate]);

  const calculateSubtotal = () => {
    return checkoutData?.total || 0;
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    try {
      // Validate and sanitize customer information
      validateAndSanitizeCustomerInfo(customerInfo);

      if (!selectedPaymentMethod) {
        toast({
          variant: "destructive",
          title: "Payment Method Required",
          description: "Please select a payment method.",
        });
        return false;
      }

      return true;
    } catch (validationError: any) {
      toast({
        variant: "destructive",
        title: "Invalid Information",
        description: validationError.message || "Please check your information and try again.",
      });
      return false;
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    
    try {
      // Use Stripe for payment processing
      if (selectedPaymentMethod === "stripe") {
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: {
            subscriptionType: checkoutData?.subscriptionType,
            selectedTier: checkoutData?.selectedTier,
            selectedServiceTypes: checkoutData?.selectedServiceTypes || [],
            unitCount: checkoutData?.unitCount || 1,
            total: calculateTotal(),
            isSubscription: true,
            contractLength: "monthly",
            selectedServices: [`${checkoutData?.subscriptionType} ${checkoutData?.selectedTier || ''} Plan`]
          }
        });

        if (error) throw error;

        if (data?.url) {
          // Open Stripe checkout in a new tab
          window.open(data.url, '_blank');
        } else {
          throw new Error('No checkout URL received');
        }
      } else if (selectedPaymentMethod === "square") {
        // Square payment processing
        toast({
          title: "Square Payment",
          description: "Redirecting to Square checkout...",
        });
        
        // TODO: Integrate Square Checkout API
        // For now, simulate redirect
        setTimeout(() => {
          navigate('/checkout/success', { 
            state: { 
              orderData: { checkoutData, customerInfo, paymentMethod: selectedPaymentMethod, total: calculateTotal() }
            }
          });
        }, 2000);
      } else {
        // For other payment methods, show success (simulated)
        toast({
          title: "Order Placed Successfully",
          description: "Redirecting to confirmation page...",
        });
        
        setTimeout(() => {
          navigate('/checkout/success', { 
            state: { 
              orderData: { checkoutData, customerInfo, paymentMethod: selectedPaymentMethod, total: calculateTotal() }
            }
          });
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error placing order:', error);
      handleError(error, 'order_placement');
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "There was an issue processing your payment. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!checkoutData) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  return (
    <RequireAuth allowedRoles={['customer']}>
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground">Review your order and complete your purchase</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {checkoutData.subscriptionType === "single-family" 
                          ? "Single Family Service" 
                          : "Multi Family Service"
                        }
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Monthly subscription
                      </p>
                      {checkoutData.subscriptionType === "multi-family" && (
                        <p className="text-sm text-muted-foreground">
                          {checkoutData.unitCount} units
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">${calculateSubtotal().toFixed(2)}</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={customerInfo.firstName}
                      onChange={(e) => handleCustomerInfoChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={customerInfo.lastName}
                      onChange={(e) => handleCustomerInfoChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="serviceAddress">Service Address *</Label>
                  <Input
                    id="serviceAddress"
                    value={customerInfo.serviceAddress}
                    onChange={(e) => handleCustomerInfoChange('serviceAddress', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="billingAddress">Billing Address *</Label>
                  <Input
                    id="billingAddress"
                    value={customerInfo.billingAddress}
                    onChange={(e) => handleCustomerInfoChange('billingAddress', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={customerInfo.city}
                      onChange={(e) => handleCustomerInfoChange('city', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={customerInfo.state}
                      onChange={(e) => handleCustomerInfoChange('state', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={customerInfo.zipCode}
                      onChange={(e) => handleCustomerInfoChange('zipCode', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    value={customerInfo.specialInstructions}
                    onChange={(e) => handleCustomerInfoChange('specialInstructions', e.target.value)}
                    placeholder="Any special instructions for service delivery..."
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Method */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="stripe" className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Card
                    </TabsTrigger>
                    <TabsTrigger value="square" className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Square
                    </TabsTrigger>
                    <TabsTrigger value="paypal" className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      PayPal
                    </TabsTrigger>
                    <TabsTrigger value="digital" className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Digital
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="stripe" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input id="expiryDate" placeholder="MM/YY" />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input id="cardName" placeholder="John Doe" />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="square" className="space-y-4">
                    <div className="text-center py-8">
                      <CreditCard className="w-16 h-16 mx-auto mb-4 text-primary" />
                      <p className="text-muted-foreground">
                        You will be redirected to Square to complete your payment securely.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="paypal" className="space-y-4">
                    <div className="text-center py-8">
                      <Wallet className="w-16 h-16 mx-auto mb-4 text-primary" />
                      <p className="text-muted-foreground">
                        You will be redirected to PayPal to complete your payment securely.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="digital" className="space-y-4">
                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3"
                        onClick={() => setSelectedPaymentMethod("googlepay")}
                      >
                        <DollarSign className="w-5 h-5" />
                        Google Pay
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3"
                        onClick={() => setSelectedPaymentMethod("applepay")}
                      >
                        <Phone className="w-5 h-5" />
                        Apple Pay
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3"
                        onClick={() => setSelectedPaymentMethod("cashapp")}
                      >
                        <DollarSign className="w-5 h-5" />
                        Cash App
                      </Button>
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Zelle Instructions</h4>
                        <p className="text-sm text-muted-foreground">
                          Send payment to: payments@can2curb.com<br />
                          Reference: Order #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 pt-6 border-t">
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || !selectedPaymentMethod}
                  >
                    {isProcessing ? "Processing..." : `Place Order - $${calculateTotal().toFixed(2)}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </RequireAuth>
  );
}