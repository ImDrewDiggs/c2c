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

  const getSelectedTier = (): ServiceTier | CommunityTier | null => {
    if (selectedTab === "single-family" && selectedTier) {
      return singleFamilyTiers.find(tier => tier.id === selectedTier) || null;
    }
    if (selectedTab === "multi-family" && selectedTier) {
      return multiFamilyTiers.find(tier => tier.id === selectedTier) || null;
    }
    return null;
  };

  const calculateTotal = (): number => {
    if (selectedTab === "single-family" && selectedTier) {
      const tier = singleFamilyTiers.find(t => t.id === selectedTier);
      return tier?.price || 0;
    }
    
    if (selectedTab === "multi-family") {
      // For multi-family, return a base calculation
      return selectedServiceTypes.length * 25; // Simplified calculation
    }
    
    return 0;
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
        description: "Please log in to continue to checkout.",
      });
      navigate("/customer/login");
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
                        <TableHead className="w-[150px]">Monthly Price</TableHead>
                        <TableHead className="w-[150px]">One-Time Price</TableHead>
                        <TableHead>Discounts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {category.services.map((service) => (
                        <TableRow key={service.name}>
                          <TableCell className="font-medium">{service.name}</TableCell>
                          <TableCell className="text-muted-foreground">{service.pricingModel}</TableCell>
                          <TableCell className="font-semibold">{service.subscriptionPrice || "—"}</TableCell>
                          <TableCell className="font-semibold">{service.oneTimePrice || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{service.description || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {(selectedTab === "single-family" || selectedTab === "multi-family") && (
          <PricingDisplay
            total={calculateTotal()}
            discount={0}
            subscriptionType={selectedTab}
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
              Continue to Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}