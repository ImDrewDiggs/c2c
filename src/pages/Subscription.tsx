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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

export default function Subscription() {
  const [selectedTab, setSelectedTab] = useState("single-family");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
  const [unitCount, setUnitCount] = useState(1);
  const [selectedCommunityTierId, setSelectedCommunityTierId] = useState("basic-community");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [contractLength, setContractLength] = useState<"1" | "6" | "12">("1");
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleServiceTypeSelect = (serviceTypeId: string) => {
    setSelectedServiceTypes(prev => 
      prev.includes(serviceTypeId)
        ? prev.filter(id => id !== serviceTypeId)
        : [...prev, serviceTypeId]
    );
  };

  const handleAddOnToggle = (addOnName: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addOnName)
        ? prev.filter(name => name !== addOnName)
        : [...prev, addOnName]
    );
  };

  const getContractLengthDiscount = (): number => {
    if (contractLength === "6") return 0.05; // 5% off
    if (contractLength === "12") return 0.10; // 10% off
    return 0;
  };

  const getAddOnPrice = (addOn: any): number => {
    const priceStr = addOn.price.toString();
    // Handle different price formats: "+$9.99", "$45 – $99", "$35/month", etc.
    const match = priceStr.match(/\$?(\d+(?:\.\d{2})?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const calculateAddOnsTotal = (): number => {
    let total = 0;
    selectedAddOns.forEach((addOnName, index) => {
      const addOn = addOnServices[0].services.find(s => s.name === addOnName);
      if (addOn) {
        let price = getAddOnPrice(addOn);
        // Apply 25% off to the second add-on
        if (index === 1 && selectedAddOns.length >= 2) {
          price = price * 0.75;
        }
        total += price;
      }
    });
    return total;
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

  const getBasePrice = (): number => {
    if (selectedTab === "single-family" && selectedTier) {
      const tier = singleFamilyTiers.find(t => t.id === selectedTier);
      return tier?.price || 0;
    } else if (selectedTab === "multi-family") {
      return selectedServiceTypes.length * 25; // Simplified calculation
    }
    return 0;
  };

  const calculateTotal = (): number => {
    const basePrice = getBasePrice();
    const addOnsTotal = calculateAddOnsTotal();
    const monthlySubtotal = basePrice + addOnsTotal;
    
    // Apply contract length discount
    const discount = getContractLengthDiscount();
    const discountedMonthlyPrice = monthlySubtotal * (1 - discount);
    
    // Multiply by number of months for full contract price
    const months = parseInt(contractLength);
    const finalPrice = discountedMonthlyPrice * months;
    
    return finalPrice;
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
      total: calculateTotal(),
      contractLength,
      monthlyPrice: getBasePrice() + calculateAddOnsTotal(),
      services: services.filter(service => 
        selectedTab === "single-family" 
          ? service.category === 'single_family' && service.id === selectedTier
          : service.category === 'multi_family'
      )
    };

    // Navigate to checkout with data
    navigate('/checkout', { state: checkoutData });
  };

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

        {/* Contract Length Selection */}
        {(selectedTab === "single-family" || selectedTab === "multi-family") && selectedTier && (
          <Card>
            <CardHeader>
              <CardTitle>Contract Length</CardTitle>
              <CardDescription>Choose your contract length and save more</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={contractLength} onValueChange={(value: any) => setContractLength(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="1month" />
                  <Label htmlFor="1month">1 Month (Monthly)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="6" id="6months" />
                  <Label htmlFor="6months">6 Months (5% discount)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="12" id="12months" />
                  <Label htmlFor="12months">12 Months (10% discount)</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Add-Ons Selection */}
        {(selectedTab === "single-family" || selectedTab === "multi-family") && selectedTier && (
          <Card>
            <CardHeader>
              <CardTitle>Select Add-Ons</CardTitle>
              <CardDescription>Enhance your service with optional add-ons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {addOnServices[0].services.map((addOn) => (
                  <div key={addOn.name} className="flex items-center space-x-2">
                    <Checkbox 
                      id={addOn.name}
                      checked={selectedAddOns.includes(addOn.name)}
                      onCheckedChange={() => handleAddOnToggle(addOn.name)}
                    />
                    <Label htmlFor={addOn.name} className="flex-1 cursor-pointer">
                      <div className="flex justify-between">
                        <span>{addOn.name}</span>
                        <span className="text-muted-foreground">{addOn.price}</span>
                      </div>
                      {addOn.description && (
                        <p className="text-xs text-muted-foreground">{addOn.description}</p>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {(selectedTab === "single-family" || selectedTab === "multi-family") && selectedTier && (
          <PricingDisplay
            total={calculateTotal()}
            discount={getContractLengthDiscount() * 100}
            subscriptionType={selectedTab}
            selectedPlan={
              selectedTab === "single-family" 
                ? singleFamilyTiers.find(t => t.id === selectedTier)?.name
                : multiFamilyTiers.find(t => t.id === selectedTier)?.unitRange
            }
            contractLength={contractLength === "1" ? "Monthly" : contractLength === "6" ? "6 Months" : "12 Months"}
            selectedServices={selectedAddOns}
            basePrice={getBasePrice()}
            addOnsTotal={calculateAddOnsTotal()}
            bundleDiscount={selectedAddOns.length >= 2 ? 25 : 0}
            contractMonths={parseInt(contractLength)}
          />
        )}
        
        {(selectedTab === "single-family" || selectedTab === "multi-family") && (
          <div className="flex justify-center">
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
              Subscribe Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}