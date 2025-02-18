
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
  features: string[];
  perk?: string;
}

interface CommunityTier {
  unitRange: string;
  discount: number;
  standardPrice: number;
  premiumPrice: number;
  comprehensivePrice: number;
  premierePrice: number;
}

const singleFamilyTiers: ServiceTier[] = [
  {
    name: "Standard Service",
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
    name: "Premium Service",
    price: 74.99,
    features: [
      "Everything in Standard Service",
      "Trash can cleaning service once per month",
      "Priority customer support for service requests or adjustments"
    ],
    perk: "Perfect for customers who value a clean and odor-free trash can with minimal effort"
  },
  {
    name: "Comprehensive Service",
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
    name: "Premiere Service",
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
  { unitRange: "11-25", discount: 0, standardPrice: 25.00, premiumPrice: 40.00, comprehensivePrice: 55.00, premierePrice: 75.00 },
  { unitRange: "26-50", discount: 5, standardPrice: 23.75, premiumPrice: 38.00, comprehensivePrice: 52.25, premierePrice: 71.25 },
  { unitRange: "51-75", discount: 10, standardPrice: 22.50, premiumPrice: 36.00, comprehensivePrice: 49.50, premierePrice: 67.50 },
  { unitRange: "76-100", discount: 15, standardPrice: 21.25, premiumPrice: 34.00, comprehensivePrice: 46.75, premierePrice: 63.75 },
  { unitRange: "101-125", discount: 20, standardPrice: 20.00, premiumPrice: 32.00, comprehensivePrice: 44.00, premierePrice: 60.00 },
  { unitRange: "126-150", discount: 25, standardPrice: 18.75, premiumPrice: 30.00, comprehensivePrice: 41.25, premierePrice: 56.25 },
  { unitRange: "151-175", discount: 30, standardPrice: 17.50, premiumPrice: 28.00, comprehensivePrice: 38.50, premierePrice: 52.50 },
  { unitRange: "176-200", discount: 35, standardPrice: 16.25, premiumPrice: 26.00, comprehensivePrice: 35.75, premierePrice: 48.75 },
  { unitRange: "201-225", discount: 40, standardPrice: 15.00, premiumPrice: 24.00, comprehensivePrice: 33.00, premierePrice: 45.00 },
  { unitRange: "226-250", discount: 45, standardPrice: 13.75, premiumPrice: 22.00, comprehensivePrice: 30.25, premierePrice: 41.25 },
  { unitRange: "251+", discount: 50, standardPrice: 12.50, premiumPrice: 20.00, comprehensivePrice: 27.50, premierePrice: 37.50 },
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
                  <TableHead className="w-[400px]">Features</TableHead>
                  <TableHead className="w-[300px]">Target Customer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {singleFamilyTiers.map((tier) => (
                  <TableRow key={tier.name}>
                    <TableCell className="font-medium">{tier.name}</TableCell>
                    <TableCell>${tier.price}/month</TableCell>
                    <TableCell>
                      <ul className="list-none space-y-1">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tier.perk}
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
              <TableCaption>
                Multi-family community pricing (per unit/month)
                <br />
                <span className="text-sm text-muted-foreground">
                  For communities with 10 or fewer units, please contact us for custom pricing
                </span>
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Units</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Standard</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Comprehensive</TableHead>
                  <TableHead>Premiere</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {communityTiers.map((tier) => (
                  <TableRow key={tier.unitRange}>
                    <TableCell className="font-medium">{tier.unitRange}</TableCell>
                    <TableCell>{tier.discount}%</TableCell>
                    <TableCell>${tier.standardPrice.toFixed(2)}</TableCell>
                    <TableCell>${tier.premiumPrice.toFixed(2)}</TableCell>
                    <TableCell>${tier.comprehensivePrice.toFixed(2)}</TableCell>
                    <TableCell>${tier.premierePrice.toFixed(2)}</TableCell>
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
