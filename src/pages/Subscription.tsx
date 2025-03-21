import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PricingDisplay from "@/components/subscription/PricingDisplay";
import SingleFamilyPlans, { ServiceTier } from "@/components/subscription/SingleFamilyPlans";
import MultiFamilyPlans, { CommunityTier, ServiceType } from "@/components/subscription/MultiFamilyPlans";
import { useAuth, useToast, useNavigate } from "@/hooks";
import { supabase } from "@/lib/supabase";

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
      "Everything in Standard Service",
      "Trash can cleaning service once per month",
      "Priority customer support for service requests or adjustments"
    ],
    perk: "Perfect for customers who value a clean and odor-free trash can with minimal effort"
  },
  {
    id: "comprehensive",
    name: "Comprehensive Service",
    description: "Complete service package with additional benefits",
    price: 99.99,
    features: [
      "Everything in Premium Service",
      "Bulk trash removal (up to 3 large items per quarter)",
      "Pet waste pickup service once per week",
      "Discounts on junk removal services (10% off standard rates)"
    ],
    perk: "Designed for busy households needing additional cleanup assistance and value-added services"
  },
  {
    id: "premiere",
    name: "Premiere Service",
    description: "Ultimate convenience and personalized service",
    price: 149.99,
    features: [
      "Everything in Comprehensive Service",
      "Unlimited bulk trash removal (up to 1 item per week)",
      "Twice-monthly trash can cleaning",
      "Daily trash removal service (on demand, up to 5 pickups per week)",
      "Access to a personal account manager for custom needs and special requests"
    ],
    perk: "Ultimate convenience for clients who prioritize time and an immaculate environment"
  }
];

const communityTiers: CommunityTier[] = [
  { 
    id: "11-25",
    unitRange: "11-25",
    rangeStart: 11,
    rangeEnd: 25,
    discount: 0,
    standardPrice: 25.00,
    premiumPrice: 40.00,
    comprehensivePrice: 55.00,
    premierePrice: 75.00
  },
  {
    id: "26-50",
    unitRange: "26-50",
    rangeStart: 26,
    rangeEnd: 50,
    discount: 5,
    standardPrice: 23.75,
    premiumPrice: 38.00,
    comprehensivePrice: 52.25,
    premierePrice: 71.25
  },
  {
    id: "51-75",
    unitRange: "51-75",
    rangeStart: 51,
    rangeEnd: 75,
    discount: 10,
    standardPrice: 22.50,
    premiumPrice: 36.00,
    comprehensivePrice: 49.50,
    premierePrice: 67.50
  },
  {
    id: "76-100",
    unitRange: "76-100",
    rangeStart: 76,
    rangeEnd: 100,
    discount: 15,
    standardPrice: 21.25,
    premiumPrice: 34.00,
    comprehensivePrice: 46.75,
    premierePrice: 63.75
  },
  {
    id: "101-125",
    unitRange: "101-125",
    rangeStart: 101,
    rangeEnd: 125,
    discount: 20,
    standardPrice: 20.00,
    premiumPrice: 32.00,
    comprehensivePrice: 44.00,
    premierePrice: 60.00
  },
  {
    id: "126-150",
    unitRange: "126-150",
    rangeStart: 126,
    rangeEnd: 150,
    discount: 25,
    standardPrice: 18.75,
    premiumPrice: 30.00,
    comprehensivePrice: 41.25,
    premierePrice: 56.25
  },
  {
    id: "151-175",
    unitRange: "151-175",
    rangeStart: 151,
    rangeEnd: 175,
    discount: 30,
    standardPrice: 17.50,
    premiumPrice: 28.00,
    comprehensivePrice: 38.50,
    premierePrice: 52.50
  },
  {
    id: "176-200",
    unitRange: "176-200",
    rangeStart: 176,
    rangeEnd: 200,
    discount: 35,
    standardPrice: 16.25,
    premiumPrice: 26.00,
    comprehensivePrice: 35.75,
    premierePrice: 48.75
  },
  {
    id: "201-225",
    unitRange: "201-225",
    rangeStart: 201,
    rangeEnd: 225,
    discount: 40,
    standardPrice: 15.00,
    premiumPrice: 24.00,
    comprehensivePrice: 33.00,
    premierePrice: 45.00
  },
  {
    id: "226-250",
    unitRange: "226-250",
    rangeStart: 226,
    rangeEnd: 250,
    discount: 45,
    standardPrice: 13.75,
    premiumPrice: 22.00,
    comprehensivePrice: 30.25,
    premierePrice: 41.25
  },
  {
    id: "251+",
    unitRange: "251+",
    rangeStart: 251,
    rangeEnd: null,
    discount: 50,
    standardPrice: 12.50,
    premiumPrice: 20.00,
    comprehensivePrice: 27.50,
    premierePrice: 37.50
  }
];

const communityServiceTypes: ServiceType[] = [
  { id: "standard", name: "Standard Service" },
  { id: "premium", name: "Premium Service" },
  { id: "comprehensive", name: "Comprehensive Service" },
  { id: "premiere", name: "Premiere Service" }
];

const Subscription = () => {
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("single-family");
  const [unitCount, setUnitCount] = useState<number>(0);
  const [selectedCommunityService, setSelectedCommunityService] = useState<string>("");
  const [selectedCommunityTier, setSelectedCommunityTier] = useState<string>("");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const getSelectedTier = (): ServiceTier | undefined => {
    if (selectedTab === "single-family") {
      return singleFamilyTiers.find((tier) => tier.id === selectedTier);
    }
    return undefined;
  };

  const getPricePerUnit = () => {
    if (selectedTab === "multi-family" && unitCount > 0) {
      const tier = communityTiers.find(tier => 
        unitCount >= tier.rangeStart && (!tier.rangeEnd || unitCount <= tier.rangeEnd)
      );
      
      if (!tier || !selectedCommunityService) return 0;

      switch (selectedCommunityService) {
        case "standard":
          return tier.standardPrice;
        case "premium":
          return tier.premiumPrice;
        case "comprehensive":
          return tier.comprehensivePrice;
        case "premiere":
          return tier.premierePrice;
        default:
          return 0;
      }
    }
    return 0;
  };

  const calculateTotal = () => {
    if (selectedTab === "single-family") {
      const selected = getSelectedTier();
      return selected ? selected.price : 0;
    } else {
      const pricePerUnit = getPricePerUnit();
      return pricePerUnit * unitCount;
    }
  };

  const getDiscount = () => {
    if (selectedTab === "multi-family" && unitCount > 0) {
      const tier = communityTiers.find(tier => 
        unitCount >= tier.rangeStart && (!tier.rangeEnd || unitCount <= tier.rangeEnd)
      );
      return tier?.discount || 0;
    }
    return 0;
  };

  const handleCompleteSubscription = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to complete your subscription",
        variant: "destructive"
      });
      navigate("/customer/login");
      return;
    }

    try {
      let planId = null;
      const total = calculateTotal();
      
      if (selectedTab === "single-family" && selectedTier) {
        const { data: existingPlans, error: planQueryError } = await supabase
          .from('service_plans')
          .select('id')
          .eq('name', getSelectedTier()?.name || 'Standard Service')
          .limit(1);
        
        if (planQueryError) throw planQueryError;
        
        if (existingPlans && existingPlans.length > 0) {
          planId = existingPlans[0].id;
        } else {
          const selectedTierData = getSelectedTier();
          if (selectedTierData) {
            const { data: newPlan, error: planError } = await supabase
              .from('service_plans')
              .insert({
                name: selectedTierData.name,
                price: selectedTierData.price,
                frequency: 'monthly',
                description: selectedTierData.description
              })
              .select('id')
              .single();
            
            if (planError) throw planError;
            planId = newPlan.id;
          }
        }
      } else if (selectedTab === "multi-family" && selectedCommunityService) {
        const tier = communityTiers.find(tier => 
          unitCount >= tier.rangeStart && (!tier.rangeEnd || unitCount <= tier.rangeEnd)
        );
        if (!tier || !selectedCommunityService) return;

        const { data: newPlan, error: planError } = await supabase
          .from('service_plans')
          .insert({
            name: selectedCommunityService,
            price: tier[selectedCommunityService],
            frequency: 'monthly',
            description: `Monthly ${selectedCommunityService} service`
          })
          .select('id')
          .single();
        
        if (planError) throw planError;
        planId = newPlan.id;
      }
      
      if (planId) {
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .insert({
            plan_id: planId,
            user_id: user.id,
            start_date: new Date().toISOString().split('T')[0],
            status: 'active',
            next_service_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 week from now
          })
          .select('id')
          .single();
        
        if (subError) throw subError;
        
        const { error: linkError } = await supabase
          .from('customer_subscriptions')
          .insert({
            customer_id: user.id,
            subscription_id: subscription.id
          });
        
        if (linkError) throw linkError;
        
        toast({
          title: "Subscription Created",
          description: "Your subscription has been successfully created!",
        });
        
        navigate("/customer/dashboard");
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem creating your subscription. Please try again."
      });
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        <PricingDisplay 
          total={calculateTotal()} 
          discount={getDiscount()} 
          subscriptionType={selectedTab} 
        />

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="single-family">Single Family</TabsTrigger>
            <TabsTrigger value="multi-family">Multi-Family Communities</TabsTrigger>
          </TabsList>

          <TabsContent value="single-family">
            <SingleFamilyPlans
              tiers={singleFamilyTiers}
              selectedTier={selectedTier}
              onTierSelect={setSelectedTier}
            />
          </TabsContent>

          <TabsContent value="multi-family">
            <MultiFamilyPlans
              unitCount={unitCount}
              onUnitCountChange={setUnitCount}
              communityTiers={communityTiers}
              serviceTypes={communityServiceTypes}
              selectedCommunityTierId={selectedCommunityTier}
              selectedServiceId={selectedCommunityService}
              onCommunityTierSelect={setSelectedCommunityTier}
              onServiceSelect={setSelectedCommunityService}
              pricePerUnit={getPricePerUnit()}
              totalPrice={calculateTotal()}
              discount={getDiscount()}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Button
            size="lg"
            onClick={handleCompleteSubscription}
            disabled={!selectedTier && (!selectedCommunityService || unitCount <= 0)}
          >
            Complete Subscription
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
