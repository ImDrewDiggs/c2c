import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ServiceTier {
  id: string;
  name: string;
  description: string;
  price: number;
  frequency: string;
  features: string[];
}

interface CommunityTier {
  id: string;
  unitRange: string;
  rangeStart: number;
  rangeEnd: number | null;
  discount: number;
  standardPrice: number;
  premiumPrice: number;
  comprehensivePrice: number;
  premierePrice: number;
}

const singleFamilyTiers: ServiceTier[] = [
  {
    id: "basic-weekly",
    name: "Basic Weekly Service",
    description: "Professional cleaning of your trash cans every week",
    price: 29.99,
    frequency: "weekly",
    features: [
      "Weekly cleaning service",
      "Standard disinfection",
      "Basic deodorizing",
    ],
  },
  {
    id: "premium-weekly",
    name: "Premium Weekly Service",
    description: "Enhanced weekly cleaning with premium features",
    price: 39.99,
    frequency: "weekly",
    features: [
      "Weekly cleaning service",
      "Premium disinfection",
      "Advanced deodorizing",
      "Priority scheduling",
    ],
  },
  {
    id: "bi-weekly",
    name: "Bi-Weekly Service",
    description: "Professional cleaning every two weeks",
    price: 44.99,
    frequency: "bi-weekly",
    features: [
      "Bi-weekly cleaning",
      "Premium disinfection",
      "Advanced deodorizing",
      "Flexible scheduling",
    ],
  },
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

const communityServiceTypes = [
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

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        {/* Running Total */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mb-8 p-6"
        >
          <h2 className="text-2xl font-bold text-center mb-2">
            Selected Services Total
          </h2>
          <p className="text-4xl font-bold text-primary text-center">
            ${calculateTotal().toFixed(2)}
            <span className="text-lg text-gray-400">/month</span>
          </p>
          {selectedTab === "multi-family" && getDiscount() > 0 && (
            <p className="text-center text-sm text-green-600 mt-2">
              Includes {getDiscount()}% volume discount
            </p>
          )}
        </motion.div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="single-family">Single Family</TabsTrigger>
            <TabsTrigger value="multi-family">Multi-Family Communities</TabsTrigger>
          </TabsList>

          <TabsContent value="single-family">
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4">Choose Your Service Plan</h3>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service tier" />
                </SelectTrigger>
                <SelectContent>
                  {singleFamilyTiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.name} - ${tier.price}/{tier.frequency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {getSelectedTier() && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6"
                >
                  <h4 className="font-semibold mb-2">Included Features:</h4>
                  <ul className="space-y-2">
                    {getSelectedTier()?.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="text-primary h-5 w-5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="multi-family">
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4">Choose Your Community Plan</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Units</label>
                  <Input
                    type="number"
                    min="0"
                    value={unitCount || ""}
                    onChange={(e) => setUnitCount(parseInt(e.target.value) || 0)}
                    placeholder="Enter number of units"
                  />
                  {unitCount > 0 && unitCount <= 10 && (
                    <p className="text-sm text-yellow-600 mt-1">
                      For communities with 10 or fewer units, please contact us for custom pricing.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Service Level</label>
                  <Select value={selectedCommunityService} onValueChange={setSelectedCommunityService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service level" />
                    </SelectTrigger>
                    <SelectContent>
                      {communityServiceTypes.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {unitCount > 10 && selectedCommunityService && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-secondary/10 rounded-lg"
                  >
                    <h4 className="font-semibold mb-2">Pricing Details:</h4>
                    <ul className="space-y-2">
                      <li>Price per unit: ${getPricePerUnit().toFixed(2)}</li>
                      <li>Number of units: {unitCount}</li>
                      <li>Volume discount: {getDiscount()}%</li>
                      <li className="font-semibold">Total monthly cost: ${calculateTotal().toFixed(2)}</li>
                    </ul>
                  </motion.div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Button
            size="lg"
            onClick={() => {
              alert("Please log in to complete your subscription");
            }}
          >
            Complete Subscription
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
