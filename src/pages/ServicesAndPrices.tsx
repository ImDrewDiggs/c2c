
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
import { Check, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { serviceCategories, pricingPolicy, singleFamilyTiers, multiFamilyServiceDetails, businessServiceDetails } from "@/data/services";
import { useAuth } from "@/components/auth/SecureAuthProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";

export default function ServicesAndPrices() {
  const { user } = useAuth();
  
  // Security enhancement: Restrict detailed pricing access
  const showDetailedPricing = user !== null;
  
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Services & Prices</h1>
      
      {!showDetailedPricing && (
        <Alert className="mb-6">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Detailed pricing information is available to registered users only. 
            <Link to="/auth" className="text-primary underline ml-1">Sign in</Link> to view complete pricing details.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="subscription-plans" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="subscription-plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="all-services">All Services</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription-plans">
          <div className="space-y-12">
            {/* Single Family Plans */}
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-center mb-6">Single Family Plans</h2>
              <div className="rounded-lg border">
                <Table>
                  <TableCaption>Complete pricing for single-family residences</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Service Tier</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="w-[400px]">Features</TableHead>
                      <TableHead className="w-[300px]">Competitive Edge & Profit Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {singleFamilyTiers.map((tier) => (
                      <TableRow key={tier.name}>
                        <TableCell className="font-medium">{tier.name}</TableCell>
                        <TableCell>
                          {showDetailedPricing ? `$${tier.price}/month` : "Contact for pricing"}
                        </TableCell>
                        <TableCell>
                          <ul className="list-none space-y-1">
                            {tier.features.map((feature) => (
                              <li key={feature} className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
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
            </div>

            {/* Multi-Family Plans */}
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-center mb-6">Multi-Family Plans</h2>
              <p className="text-center text-muted-foreground mb-4">
                Targets apartment/condo complexes (50+ units; per-unit pricing for property managers)
              </p>
              <div className="rounded-lg border">
                <Table>
                  <TableCaption>Pricing for multi-family properties (per unit pricing)</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Service Tier</TableHead>
                      <TableHead>Monthly Pricing (Per Unit)</TableHead>
                      <TableHead className="w-[400px]">Services Included</TableHead>
                      <TableHead className="w-[300px]">Key Competitive Edge & Profit Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {multiFamilyServiceDetails.map((service) => (
                      <TableRow key={service.tier}>
                        <TableCell className="font-medium">{service.tier}</TableCell>
                        <TableCell className="font-semibold">
                          {showDetailedPricing ? service.price : "Contact for pricing"}
                        </TableCell>
                        <TableCell>
                          <ul className="list-none space-y-1">
                            {service.services.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {service.competitiveEdge}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Business/Commercial Plans */}
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-center mb-6">Business/Commercial Plans</h2>
              <p className="text-center text-muted-foreground mb-4">
                Targets offices, retail, restaurants (custom quotes; per location or sq ft)
              </p>
              <div className="rounded-lg border">
                <Table>
                  <TableCaption>Custom business solutions with flexible pricing</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Business Size</TableHead>
                      <TableHead>Starting Price</TableHead>
                      <TableHead className="w-[400px]">Services Included</TableHead>
                      <TableHead className="w-[300px]">Pricing Model</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businessServiceDetails.map((service) => (
                      <TableRow key={service.tier}>
                        <TableCell className="font-medium">{service.tier}</TableCell>
                        <TableCell className="font-semibold">Contact for Quote</TableCell>
                        <TableCell>
                          <ul className="list-none space-y-1">
                            {service.services.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {service.pricing}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="all-services">
          <div className="space-y-12">
            {serviceCategories.map((category) => (
              <div key={category.name} className="space-y-6">
                <h2 className="text-3xl font-semibold text-center">{category.name}</h2>
                <div className="rounded-lg border">
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
                          <TableCell className="font-semibold">
                            {showDetailedPricing ? service.price : "Contact for pricing"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
            
            <div className="mt-12 p-6 bg-muted rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Pricing Policy</h3>
              <p className="text-muted-foreground mb-2">
                <strong>Minimum service charge:</strong> ${pricingPolicy.minimumCharge} per job if stand-alone (excludes subscription-based trash concierge)
              </p>
              <p className="text-muted-foreground">
                <strong>Bundling discount:</strong> {pricingPolicy.bundlingDiscount} off if customer books {pricingPolicy.bundlingThreshold}+ services in a single visit
              </p>
            </div>
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
