
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

interface ServiceTier {
  id: string;
  name: string;
  description: string;
  price: number;
  frequency: string;
  features: string[];
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

const multiFamilyTiers: ServiceTier[] = [
  {
    id: "community-basic",
    name: "Community Basic",
    description: "Essential services for small communities",
    price: 199.99,
    frequency: "weekly",
    features: [
      "Up to 50 units",
      "Weekly service",
      "Basic sanitization",
      "Standard reporting",
    ],
  },
  {
    id: "community-plus",
    name: "Community Plus",
    description: "Enhanced services for medium-sized communities",
    price: 399.99,
    frequency: "weekly",
    features: [
      "Up to 100 units",
      "Weekly service",
      "Premium sanitization",
      "Detailed reporting",
      "Priority support",
    ],
  },
  {
    id: "community-premium",
    name: "Community Premium",
    description: "Premium services for large communities",
    price: 799.99,
    frequency: "weekly",
    features: [
      "Unlimited units",
      "Weekly service",
      "Premium sanitization",
      "24/7 support",
      "Custom scheduling",
      "Analytics dashboard",
    ],
  },
];

const Subscription = () => {
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("single-family");

  const getSelectedTier = (): ServiceTier | undefined => {
    const tiers = selectedTab === "single-family" ? singleFamilyTiers : multiFamilyTiers;
    return tiers.find((tier) => tier.id === selectedTier);
  };

  const calculateTotal = () => {
    const selected = getSelectedTier();
    return selected ? selected.price : 0;
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
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service tier" />
                </SelectTrigger>
                <SelectContent>
                  {multiFamilyTiers.map((tier) => (
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
        </Tabs>

        {/* CTA Button */}
        <div className="mt-8 text-center">
          <button
            className="btn-primary"
            onClick={() => {
              // This will be implemented when we add authentication
              alert("Please log in to complete your subscription");
            }}
          >
            Complete Subscription
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
