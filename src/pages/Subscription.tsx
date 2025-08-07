import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PricingDisplay from "@/components/subscription/PricingDisplay";
import SingleFamilyPlans, { ServiceTier } from "@/components/subscription/SingleFamilyPlans";
import MultiFamilyPlans, { CommunityTier, ServiceType } from "@/components/subscription/MultiFamilyPlans";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const singleFamilyTiers: ServiceTier[] = [
  {
    id: "standard",
    name: "Standard Service",
    description: "Basic convenience for trash management",
    price: 49.99,
    features: [
      "Moving one trash can and one recycling bin to and from the curb weekly",
      "Additional cans: $5/month each",
      "Driveways over 50 feet: Additional $10/month",
      "No additional services included"
    ],
    perk: "Budget-conscious customers who want basic convenience for trash management"
  },
  {
    id: "premium",
    name: "Premium Service",
    description: "Enhanced service with monthly cleaning",
    price: 74.99,
    features: [
      "Moving one trash can and one recycling bin to and from the curb weekly",
      "Monthly pressure washing of bins (exterior only)",
      "Additional cans: $5/month each",
      "Driveways over 50 feet: Additional $10/month"
    ],
    perk: "Customers who value cleanliness and want an enhanced experience"
  },
  {
    id: "deluxe",
    name: "Deluxe Service",
    description: "Complete care with interior and exterior cleaning",
    price: 99.99,
    features: [
      "Moving one trash can and one recycling bin to and from the curb weekly",
      "Bi-weekly pressure washing of bins (interior and exterior)",
      "Additional cans: $5/month each",
      "Driveways over 50 feet: Additional $10/month"
    ],
    perk: "Premium customers who want the highest level of service and cleanliness"
  }
];

const multiFamilyTiers: CommunityTier[] = [
  {
    id: "basic-community",
    unitRange: "1-50 units",
    rangeStart: 1,
    rangeEnd: 50,
    discount: 0,
    standardPrice: 199.99,
    premiumPrice: 299.99,
    comprehensivePrice: 399.99,
    premierePrice: 499.99
  },
  {
    id: "standard-community",
    unitRange: "51-100 units",
    rangeStart: 51,
    rangeEnd: 100,
    discount: 10,
    standardPrice: 179.99,
    premiumPrice: 269.99,
    comprehensivePrice: 359.99,
    premierePrice: 449.99
  },
  {
    id: "premium-community",
    unitRange: "100+ units",
    rangeStart: 101,
    rangeEnd: null,
    discount: 20,
    standardPrice: 159.99,
    premiumPrice: 239.99,
    comprehensivePrice: 319.99,
    premierePrice: 399.99
  }
];

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single-family">Single Family</TabsTrigger>
            <TabsTrigger value="multi-family">Multi Family</TabsTrigger>
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
        </Tabs>

        <PricingDisplay
          total={calculateTotal()}
          discount={0}
          subscriptionType={selectedTab}
        />
        
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
      </div>
    </div>
  );
}