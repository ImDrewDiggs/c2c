
import { useState } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Edit, Save, Plus } from "lucide-react";

export default function AdminPricing() {
  const [activePlan, setActivePlan] = useState<string | null>(null);
  
  // Mock data for pricing plans
  const singleFamilyPlans = [
    { id: 1, name: "Basic", price: 29.99, frequency: "Monthly", features: ["Weekly pickup", "One bin", "Customer support"] },
    { id: 2, name: "Standard", price: 49.99, frequency: "Monthly", features: ["Twice weekly pickup", "Two bins", "Priority support", "Recycling included"] },
    { id: 3, name: "Premium", price: 79.99, frequency: "Monthly", features: ["Three times weekly pickup", "Multiple bins", "24/7 Premium support", "Recycling & composting"] },
  ];
  
  const multiFamilyPlans = [
    { id: 4, name: "Small Complex", price: 199.99, frequency: "Monthly", features: ["Daily pickup", "Up to 10 units", "Dedicated account manager"] },
    { id: 5, name: "Medium Complex", price: 399.99, frequency: "Monthly", features: ["Twice daily pickup", "Up to 50 units", "Dedicated account manager", "Bulk item pickup"] },
    { id: 6, name: "Large Complex", price: 799.99, frequency: "Monthly", features: ["Custom schedule", "Unlimited units", "24/7 service", "Full waste management"] },
  ];
  
  const commercialPlans = [
    { id: 7, name: "Small Business", price: 149.99, frequency: "Monthly", features: ["Daily pickup", "Up to 3 bins", "Business support"] },
    { id: 8, name: "Medium Business", price: 299.99, frequency: "Monthly", features: ["Custom schedule", "Up to 10 bins", "Dedicated manager"] },
    { id: 9, name: "Enterprise", price: 999.99, frequency: "Monthly", features: ["24/7 service", "Unlimited bins", "Full waste management"] },
  ];
  
  const editPlan = (id: number) => {
    setActivePlan(id.toString());
  };
  
  return (
    <AdminPageLayout 
      title="Update Pricing" 
      description="Manage service pricing plans"
    >
      <Tabs defaultValue="single-family">
        <TabsList className="mb-6">
          <TabsTrigger value="single-family">Single Family</TabsTrigger>
          <TabsTrigger value="multi-family">Multi-Family</TabsTrigger>
          <TabsTrigger value="commercial">Commercial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single-family" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Single Family Plans</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {singleFamilyPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{plan.name}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => editPlan(plan.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {activePlan === plan.id.toString() ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`plan-${plan.id}-name`}>Plan Name</Label>
                        <Input id={`plan-${plan.id}-name`} defaultValue={plan.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`plan-${plan.id}-price`}>Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input id={`plan-${plan.id}-price`} defaultValue={plan.price} className="pl-8" />
                        </div>
                      </div>
                      <Button className="w-full">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold mb-2">${plan.price}</div>
                      <div className="text-muted-foreground mb-4">{plan.frequency}</div>
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center">
                            <span className="mr-2 text-green-500">✓</span> {feature}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="multi-family" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Multi-Family Plans</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {multiFamilyPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{plan.name}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => editPlan(plan.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">${plan.price}</div>
                  <div className="text-muted-foreground mb-4">{plan.frequency}</div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="mr-2 text-green-500">✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="commercial" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Commercial Plans</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {commercialPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{plan.name}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => editPlan(plan.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">${plan.price}</div>
                  <div className="text-muted-foreground mb-4">{plan.frequency}</div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="mr-2 text-green-500">✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
}
