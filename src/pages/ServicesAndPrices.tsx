
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
import { serviceCategories, pricingPolicy, singleFamilyTiers } from "@/data/services";

export default function ServicesAndPrices() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Services & Prices</h1>
      
      <Tabs defaultValue="subscription-plans" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="subscription-plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="all-services">All Services</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription-plans">
          <div className="space-y-8">
            <h2 className="text-3xl font-semibold text-center mb-6">Single Family Plans</h2>
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
                          <TableCell className="font-semibold">{service.price}</TableCell>
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
