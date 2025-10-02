import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PricingDisplay from "@/components/subscription/PricingDisplay";
import SingleFamilyPlans from "@/components/subscription/SingleFamilyPlans";
import MultiFamilyPlans, { ServiceType } from "@/components/subscription/MultiFamilyPlans";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { singleFamilyTiers, multiFamilyTiers, businessTiers, singleFamilyServices, multiFamilyServices, businessServices, addOnServices, ServiceTier, CommunityTier, BusinessTier, multiFamilyServiceDetails, businessServiceDetails } from "@/data/services";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTermsAcceptance } from "@/hooks/useTermsAcceptance";

const serviceTypes: ServiceType[] = [
  {
    id: "trash-management",
    name: "Trash Management"
  },
  {
    id: "recycling-service",
    name: "Recycling Service"
  },
  {
    id: "bulk-pickup",
    name: "Bulk Item Pickup"
  },
  {
    id: "organic-waste",
    name: "Organic Waste Collection"
  },
  {
    id: "hazardous-disposal",
    name: "Hazardous Waste Disposal"
  }
];

interface SelectedAddOn {
  id: string;
  name: string;
  price: number;
  discountedPrice: number;
}

export default function Subscription() {
  const [selectedTab, setSelectedTab] = useState("single-family");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
  const [unitCount, setUnitCount] = useState(1);
  const [selectedCommunityTierId, setSelectedCommunityTierId] = useState("basic-community");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([]);
  const [contractDuration, setContractDuration] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [paymentType, setPaymentType] = useState<"one-time" | "recurring">("recurring");
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasAccepted, loading } = useTermsAcceptance();

  // Redirect to terms page if terms not accepted
  useEffect(() => {
    if (!loading && !hasAccepted) {
      navigate('/terms');
    }
  }, [hasAccepted, loading, navigate]);

  const handleServiceTypeSelect = (serviceTypeId: string) => {
    setSelectedServiceTypes(prev => 
      prev.includes(serviceTypeId)
        ? prev.filter(id => id !== serviceTypeId)
        : [...prev, serviceTypeId]
    );
  };

  const getSelectedTier = (): ServiceTier | CommunityTier | null => {
    if (selectedTab === "single-family" && selectedTier) {
      return singleFamilyTiers.find(tier => tier.id === selectedTier) || null;
    }
    if (selectedTab === "multi-family" && selectedTier) {
      return multiFamilyTiers.find(tier => tier.id === selectedTier) || null;
    }
    return null;
  };

  const getAddOnDiscount = (): number => {
    if (selectedTab === "single-family" && selectedTier) {
      const tier = singleFamilyTiers.find(t => t.id === selectedTier);
      if (!tier) return 0;
      
      // Extract discount from features
      if (tier.id === "standard") return 0.05;
      if (tier.id === "premium") return 0.07;
      if (tier.id === "comprehensive") return 0.10;
    }
    
    if (selectedTab === "multi-family" && selectedCommunityTierId) {
      // Multi-family gets 5% discount on add-ons
      return 0.05;
    }
    
    return 0;
  };

  const toggleAddOn = (addOn: { name: string; price: string }) => {
    const basePrice = parseFloat(addOn.price.replace(/[^0-9.]/g, ''));
    const discount = getAddOnDiscount();
    const discountedPrice = basePrice * (1 - discount);
    
    const addOnId = addOn.name.toLowerCase().replace(/\s+/g, '-');
    const existingIndex = selectedAddOns.findIndex(a => a.id === addOnId);
    
    if (existingIndex >= 0) {
      setSelectedAddOns(prev => prev.filter((_, idx) => idx !== existingIndex));
    } else {
      setSelectedAddOns(prev => [...prev, {
        id: addOnId,
        name: addOn.name,
        price: basePrice,
        discountedPrice
      }]);
    }
  };

  const calculateTotal = (): number => {
    let baseTotal = 0;
    
    if (selectedTab === "single-family" && selectedTier) {
      const tier = singleFamilyTiers.find(t => t.id === selectedTier);
      baseTotal = tier?.price || 0;
    }
    
    if (selectedTab === "multi-family") {
      baseTotal = selectedServiceTypes.length * 25;
    }
    
    // Add add-ons with discounts applied
    const addOnsTotal = selectedAddOns.reduce((sum, addOn) => sum + addOn.discountedPrice, 0);
    
    let monthlyTotal = baseTotal + addOnsTotal;
    
    // Apply contract duration multiplier
    let totalAmount = monthlyTotal;
    if (contractDuration === "quarterly") {
      totalAmount = monthlyTotal * 3;
    } else if (contractDuration === "yearly") {
      totalAmount = monthlyTotal * 12;
      // Apply 10% discount for annual prepay if one-time payment
      if (paymentType === "one-time") {
        totalAmount = totalAmount * 0.9;
      }
    }
    
    return totalAmount;
  };
  
  const getContractDurationLabel = (): string => {
    switch (contractDuration) {
      case "monthly": return "Monthly";
      case "quarterly": return "3 Months";
      case "yearly": return "12 Months";
      default: return "";
    }
  };

  // Load services from database
  useEffect(() => {
    const loadServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        
        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error loading services:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load services. Please refresh the page.",
        });
      }
    };
    
    loadServices();
  }, [toast]);

  const handleContinueToCheckout = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please create an account to continue to checkout.",
      });
      navigate("/customer/register");
      return;
    }

    // Validate selections
    if (selectedTab === "single-family" && !selectedTier) {
      toast({
        variant: "destructive",
        title: "Selection Required",
        description: "Please select a service tier to continue.",
      });
      return;
    }

    if (selectedTab === "multi-family" && (!selectedCommunityTierId || !selectedServiceId)) {
      toast({
        variant: "destructive",
        title: "Selection Required",
        description: "Please select both a community tier and service to continue.",
      });
      return;
    }

    // Prepare checkout data
    const checkoutData = {
      subscriptionType: selectedTab,
      selectedTier,
      selectedServiceTypes,
      selectedCommunityTierId,
      selectedServiceId,
      unitCount,
      selectedAddOns,
      addOnDiscount: getAddOnDiscount(),
      contractDuration,
      paymentType,
      total: calculateTotal(),
      services: services.filter(service => 
        selectedTab === "single-family" 
          ? service.category === 'single_family' && service.id === selectedTier
          : service.category === 'multi_family'
      )
    };

    // Navigate to checkout with data
    navigate('/checkout', { state: checkoutData });
  };

  // Show loading while checking terms acceptance
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // This should not render if terms not accepted due to redirect effect
  if (!hasAccepted) {
    return null;
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Select the perfect waste management solution for your needs
        </p>
      </div>

      <div className="grid gap-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="single-family">Single Family</TabsTrigger>
            <TabsTrigger value="multi-family">Multi Family</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="add-ons">Add-Ons</TabsTrigger>
          </TabsList>

          <TabsContent value="single-family" className="space-y-6">
            <SingleFamilyPlans
              tiers={singleFamilyTiers}
              selectedTier={selectedTier || ''}
              onTierSelect={setSelectedTier}
            />
            
            {/* Add-Ons Section - Integrated with main subscription */}
            {selectedTier && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Add Optional Services</CardTitle>
                  <CardDescription>
                    Select additional services to enhance your plan
                    {getAddOnDiscount() > 0 && (
                      <span className="block mt-1 text-primary font-semibold">
                        Your {singleFamilyTiers.find(t => t.id === selectedTier)?.name} plan includes {Math.round(getAddOnDiscount() * 100)}% off all add-ons!
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {addOnServices[0].services.map((addOn) => {
                      const basePrice = parseFloat(addOn.price.replace(/[^0-9.]/g, ''));
                      const discount = getAddOnDiscount();
                      const discountedPrice = basePrice * (1 - discount);
                      const isSelected = selectedAddOns.some(a => a.name === addOn.name);
                      
                      return (
                        <div 
                          key={addOn.name}
                          onClick={() => toggleAddOn(addOn)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/5 shadow-md' 
                              : 'border-border hover:border-primary/50 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-base flex items-center gap-2">
                                {addOn.name}
                                {isSelected && <Check className="h-4 w-4 text-primary" />}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">{addOn.description}</p>
                            </div>
                            <div className="text-right ml-4">
                              {discount > 0 ? (
                                <div>
                                  <p className="text-sm text-muted-foreground line-through">{addOn.price}</p>
                                  <p className="font-bold text-primary">${discountedPrice.toFixed(2)}/mo</p>
                                  <p className="text-xs text-green-600">Save {Math.round(discount * 100)}%</p>
                                </div>
                              ) : (
                                <p className="font-bold">{addOn.price}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Single Family Discounts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Available Discounts</CardTitle>
                <CardDescription>Save money with these residential discounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Neighborhood Cluster Discount</h4>
                    <p className="text-sm text-muted-foreground">$5/mo off per household when 5+ homes on same street sign up for Standard or higher</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Annual Prepay</h4>
                    <p className="text-sm text-muted-foreground">10% off when you prepay 12 months (Save 1.5 months)</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">New Customer Intro</h4>
                    <p className="text-sm text-muted-foreground">50% off first month or $10 off Basic tier for new customers</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Referral Reward</h4>
                    <p className="text-sm text-muted-foreground">$25 credit for referrer after 2 months, $10 off first month for referee</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">AutoPay Discount</h4>
                    <p className="text-sm text-muted-foreground">$3/mo off with AutoPay or early payment within 7 days</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Special Discounts</h4>
                    <p className="text-sm text-muted-foreground">10% off for seniors (65+), military/veterans, and verified nonprofits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multi-family" className="space-y-6">
            <MultiFamilyPlans
              unitCount={unitCount}
              onUnitCountChange={setUnitCount}
              communityTiers={multiFamilyTiers}
              serviceTypes={serviceTypes}
              selectedCommunityTierId={selectedCommunityTierId}
              selectedServiceId={selectedServiceId}
              onCommunityTierSelect={setSelectedCommunityTierId}
              onServiceSelect={setSelectedServiceId}
              pricePerUnit={2.5}
              totalPrice={calculateTotal()}
              discount={0}
            />
            
            {/* Add-Ons Section for Multi-Family */}
            {selectedCommunityTierId && selectedServiceId && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Add Optional Services</CardTitle>
                  <CardDescription>
                    Enhance your multi-family property service
                    <span className="block mt-1 text-primary font-semibold">
                      Multi-family properties get 5% off all add-ons!
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {addOnServices[0].services.map((addOn) => {
                      const basePrice = parseFloat(addOn.price.replace(/[^0-9.]/g, ''));
                      const discount = getAddOnDiscount();
                      const discountedPrice = basePrice * (1 - discount);
                      const isSelected = selectedAddOns.some(a => a.name === addOn.name);
                      
                      return (
                        <div 
                          key={addOn.name}
                          onClick={() => toggleAddOn(addOn)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/5 shadow-md' 
                              : 'border-border hover:border-primary/50 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-base flex items-center gap-2">
                                {addOn.name}
                                {isSelected && <Check className="h-4 w-4 text-primary" />}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">{addOn.description}</p>
                            </div>
                            <div className="text-right ml-4">
                              <div>
                                <p className="text-sm text-muted-foreground line-through">{addOn.price}</p>
                                <p className="font-bold text-primary">${discountedPrice.toFixed(2)}/mo</p>
                                <p className="text-xs text-green-600">Save {Math.round(discount * 100)}%</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Multi-Family Discounts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Multi-Family Discounts</CardTitle>
                <CardDescription>Volume and contract discounts for property managers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Volume Discount</h4>
                    <p className="text-sm text-muted-foreground">5-9 units: 5% off • 10-49 units: 8% off • 50+ units: 12% off (6+ month contract required)</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Annual Prepay</h4>
                    <p className="text-sm text-muted-foreground">10% off total contract when you prepay 12 months</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">AutoPay Discount</h4>
                    <p className="text-sm text-muted-foreground">2% invoice discount with AutoPay or early payment</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Freemium Trial</h4>
                    <p className="text-sm text-muted-foreground">30-day free service trial with 6-month contract signup</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Large Property Bonus</h4>
                    <p className="text-sm text-muted-foreground">$500 credit for 100+ unit properties with 12-month contract</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Referral Program</h4>
                    <p className="text-sm text-muted-foreground">$25 credit for referrer, $10 off for new property</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Business Services</h2>
              <p className="text-muted-foreground">Custom solutions for offices, retail, and restaurants with flexible pricing models</p>
            </div>
            
            <div className="space-y-4">
              {businessServiceDetails.map((service) => (
                <Card key={service.tier}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{service.tier}</CardTitle>
                        <CardDescription>{service.description}</CardDescription>
                      </div>
                      <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded">
                        Contact for Quote
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {service.services.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground italic">
                      {service.pricing}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Business Discounts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Business Discounts</CardTitle>
                <CardDescription>Commercial service bundles and loyalty rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Bundle Discounts</h4>
                    <p className="text-sm text-muted-foreground">Restaurant: $50/mo • Property Manager: $75/mo • Corporate: $150/mo (2+ services, 6-month min)</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Annual Prepay</h4>
                    <p className="text-sm text-muted-foreground">10% off total contract when you prepay 12 months</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">AutoPay Discount</h4>
                    <p className="text-sm text-muted-foreground">2% invoice discount with AutoPay or payment within 7 days</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Loyalty Credit</h4>
                    <p className="text-sm text-muted-foreground">After 12 months: 1-month credit equal to 10% of monthly average spend</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Special Discounts</h4>
                    <p className="text-sm text-muted-foreground">10% off for verified nonprofits</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Seasonal Specials</h4>
                    <p className="text-sm text-muted-foreground">Limited-time campaign offers and seasonal bundle deals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-ons" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Add-On Services</h2>
              <p className="text-muted-foreground">Additional services for all customer types</p>
            </div>
            
            {addOnServices.map((category) => (
              <Card key={category.name}>
                <CardHeader>
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Service</TableHead>
                        <TableHead className="w-[200px]">Pricing Model</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {category.services.map((service) => (
                        <TableRow key={service.name}>
                          <TableCell className="font-medium">{service.name}</TableCell>
                          <TableCell className="text-muted-foreground">{service.pricingModel}</TableCell>
                          <TableCell className="font-semibold">{service.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
            
            {/* Add-On Discounts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Add-On Discounts</CardTitle>
                <CardDescription>Save when you bundle multiple add-on services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Bundle Discount</h4>
                    <p className="text-sm text-muted-foreground">Get 25% off your 2nd add-on service when purchasing 2+ add-ons at signup</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Example</h4>
                    <p className="text-sm text-muted-foreground">Extra can + cleaning service: pay full price for first service, get 25% off the second</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {(selectedTab === "single-family" || selectedTab === "multi-family") && (
          <div className="space-y-4">
            <PricingDisplay
              total={calculateTotal()}
              discount={0}
              subscriptionType={selectedTab}
            />
            
            {selectedAddOns.length > 0 && (
              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Selected Add-Ons</CardTitle>
                  <CardDescription>Additional services with applied discounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedAddOns.map((addOn) => (
                      <li key={addOn.id} className="flex justify-between items-center">
                        <span className="font-medium">{addOn.name}</span>
                        <div className="text-right">
                          <span className="font-bold text-primary">
                            ${addOn.discountedPrice.toFixed(2)}/mo
                          </span>
                          {addOn.discountedPrice < addOn.price && (
                            <span className="block text-xs text-green-600">
                              Save ${(addOn.price - addOn.discountedPrice).toFixed(2)}/mo
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center font-bold">
                    <span>Total Add-Ons:</span>
                    <span className="text-primary">
                      ${selectedAddOns.reduce((sum, a) => sum + a.discountedPrice, 0).toFixed(2)}/mo
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Contract Duration and Payment Type Selection */}
            {(selectedTier || (selectedCommunityTierId && selectedServiceId)) && (
              <Card>
                <CardHeader>
                  <CardTitle>Contract Terms & Payment Options</CardTitle>
                  <CardDescription>Choose your contract length and payment preference</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contract Duration */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold">Contract Duration</label>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        type="button"
                        variant={contractDuration === "monthly" ? "default" : "outline"}
                        onClick={() => setContractDuration("monthly")}
                        className="h-auto py-4 flex flex-col items-center gap-1"
                      >
                        <span className="font-semibold">Monthly</span>
                        <span className="text-xs opacity-80">Pay as you go</span>
                      </Button>
                      <Button
                        type="button"
                        variant={contractDuration === "quarterly" ? "default" : "outline"}
                        onClick={() => setContractDuration("quarterly")}
                        className="h-auto py-4 flex flex-col items-center gap-1"
                      >
                        <span className="font-semibold">3 Months</span>
                        <span className="text-xs opacity-80">Quarterly billing</span>
                      </Button>
                      <Button
                        type="button"
                        variant={contractDuration === "yearly" ? "default" : "outline"}
                        onClick={() => setContractDuration("yearly")}
                        className="h-auto py-4 flex flex-col items-center gap-1"
                      >
                        <span className="font-semibold">12 Months</span>
                        <span className="text-xs opacity-80">Best value</span>
                      </Button>
                    </div>
                  </div>

                  {/* Payment Type */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold">Payment Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={paymentType === "recurring" ? "default" : "outline"}
                        onClick={() => setPaymentType("recurring")}
                        className="h-auto py-4 flex flex-col items-center gap-1"
                      >
                        <span className="font-semibold">Auto-Pay</span>
                        <span className="text-xs opacity-80">Recurring billing</span>
                        <span className="text-xs text-green-600 font-semibold">$3/mo discount</span>
                      </Button>
                      <Button
                        type="button"
                        variant={paymentType === "one-time" ? "default" : "outline"}
                        onClick={() => setPaymentType("one-time")}
                        className="h-auto py-4 flex flex-col items-center gap-1"
                      >
                        <span className="font-semibold">One-Time</span>
                        <span className="text-xs opacity-80">Pay upfront</span>
                        {contractDuration === "yearly" && (
                          <span className="text-xs text-green-600 font-semibold">10% off yearly</span>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Contract Duration:</span>
                      <span className="font-semibold">{getContractDurationLabel()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Payment Type:</span>
                      <span className="font-semibold">
                        {paymentType === "recurring" ? "Auto-Pay (Recurring)" : "One-Time Payment"}
                      </span>
                    </div>
                    {paymentType === "recurring" && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Auto-Pay Discount:</span>
                        <span className="font-semibold">-$3/mo</span>
                      </div>
                    )}
                    {contractDuration === "yearly" && paymentType === "one-time" && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Annual Prepay Discount:</span>
                        <span className="font-semibold">-10%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">Total: ${calculateTotal().toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {paymentType === "recurring" 
                    ? `Billed ${contractDuration === "monthly" ? "monthly" : contractDuration === "quarterly" ? "every 3 months" : "annually"}`
                    : `One-time payment for ${getContractDurationLabel().toLowerCase()}`
                  }
                </p>
              </div>
              <Button 
                size="lg"
                onClick={handleContinueToCheckout}
                disabled={
                  (selectedTab === "single-family" && !selectedTier) ||
                  (selectedTab === "multi-family" && (!selectedCommunityTierId || !selectedServiceId)) ||
                  isProcessing
                }
                className="w-full max-w-md"
              >
                {isProcessing ? "Processing..." : "Continue to Checkout"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}