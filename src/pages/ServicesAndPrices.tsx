
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

interface ServiceTier {
  name: string;
  price: number;
  frequency: string;
  features: string[];
}

const singleFamilyTiers: ServiceTier[] = [
  {
    name: "Basic Weekly Service",
    price: 29.99,
    frequency: "weekly",
    features: [
      "Weekly cleaning service",
      "Standard disinfection",
      "Basic deodorizing",
    ],
  },
  {
    name: "Premium Weekly Service",
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
    name: "Bi-Weekly Service",
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
    name: "Community Basic",
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
    name: "Community Plus",
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
    name: "Community Premium",
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

export default function ServicesAndPrices() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Services & Prices</h1>
      
      <Tabs defaultValue="single-family" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="single-family">Single Family</TabsTrigger>
          <TabsTrigger value="multi-family">Multi-Family Communities</TabsTrigger>
        </TabsList>

        <TabsContent value="single-family">
          <div className="rounded-lg border">
            <Table>
              <TableCaption>Complete pricing for single-family residences</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Service Tier</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead className="w-[300px]">Features</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {singleFamilyTiers.map((tier) => (
                  <TableRow key={tier.name}>
                    <TableCell className="font-medium">{tier.name}</TableCell>
                    <TableCell>${tier.price}/service</TableCell>
                    <TableCell>{tier.frequency}</TableCell>
                    <TableCell>
                      <ul className="list-none">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="multi-family">
          <div className="rounded-lg border">
            <Table>
              <TableCaption>Complete pricing for multi-family communities</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Service Tier</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead className="w-[300px]">Features</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {multiFamilyTiers.map((tier) => (
                  <TableRow key={tier.name}>
                    <TableCell className="font-medium">{tier.name}</TableCell>
                    <TableCell>${tier.price}/month</TableCell>
                    <TableCell>{tier.frequency}</TableCell>
                    <TableCell>
                      <ul className="list-none">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <Button asChild size="lg">
          <Link to="/subscription">Subscribe Now</Link>
        </Button>
      </div>
    </div>
  );
}
