
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

export default function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string>("monthly");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscribe = () => {
    if (!selectedPlan) {
      toast({
        variant: "destructive",
        title: "No plan selected",
        description: "Please select a plan before continuing.",
      });
      return;
    }

    // Navigate to registration with plan info
    toast({
      title: "Great choice!",
      description: `You selected the ${selectedPlan} plan. Let's get you registered.`,
    });
    navigate("/customer/register");
  };

  // Plan data
  const plans = [
    {
      id: "basic",
      name: "Basic",
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
      description: "Perfect for single-family homes with one or two bins",
      features: [
        "Monthly bin cleaning",
        "Standard sanitization",
        "Email notifications",
        "Online account access"
      ],
      recommended: false
    },
    {
      id: "premium",
      name: "Premium",
      monthlyPrice: 29.99,
      yearlyPrice: 299.99,
      description: "Our most popular option for regular maintenance",
      features: [
        "Bi-weekly bin cleaning",
        "Deep sanitization & deodorizing",
        "Text & email notifications",
        "Priority scheduling",
        "Extended service warranty"
      ],
      recommended: true
    },
    {
      id: "ultimate",
      name: "Ultimate",
      monthlyPrice: 49.99,
      yearlyPrice: 499.99,
      description: "The complete package for maximum cleanliness",
      features: [
        "Weekly bin cleaning",
        "Premium sanitization & deodorizing",
        "Real-time service tracking",
        "Bin replacement assistance",
        "Seasonal deep cleaning",
        "24/7 customer support"
      ],
      recommended: false
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    if (selectedDuration === "monthly") {
      return `$${plan.monthlyPrice.toFixed(2)}/month`;
    } else {
      return `$${plan.yearlyPrice.toFixed(2)}/year`;
    }
  };

  const getDiscount = () => {
    return selectedDuration === "yearly" ? "Save 15%" : "";
  };

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto mb-12 text-center">
        <h1 className="text-3xl font-bold mb-2">Choose Your Subscription Plan</h1>
        <p className="text-muted-foreground mb-6">
          Select the plan that best suits your needs and enjoy clean, fresh bins all year round.
        </p>

        <div className="inline-flex items-center rounded-lg border p-1 mb-8">
          <Button 
            variant={selectedDuration === "monthly" ? "default" : "ghost"} 
            className="rounded-md"
            onClick={() => setSelectedDuration("monthly")}
          >
            Monthly Billing
          </Button>
          <Button 
            variant={selectedDuration === "yearly" ? "default" : "ghost"}
            className="rounded-md"
            onClick={() => setSelectedDuration("yearly")}
          >
            Yearly Billing
            <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
              Save 15%
            </span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${
              selectedPlan === plan.id ? "border-2 border-primary" : ""
            } ${plan.recommended ? "shadow-xl" : "shadow-sm"}`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-0 right-0 mx-auto w-fit px-3 py-1 text-xs font-medium text-white bg-primary rounded-full">
                MOST POPULAR
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-3">
                <span className="text-3xl font-bold">
                  {selectedDuration === "monthly" 
                    ? `$${plan.monthlyPrice.toFixed(2)}` 
                    : `$${plan.yearlyPrice.toFixed(2)}`}
                </span>
                <span className="text-muted-foreground ml-1">
                  /{selectedDuration === "monthly" ? "month" : "year"}
                </span>
                {selectedDuration === "yearly" && (
                  <div className="text-sm text-green-600 font-medium mt-1">
                    Save 15% with annual billing
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <RadioGroup 
                className="w-full" 
                value={selectedPlan || undefined}
                onValueChange={setSelectedPlan}
              >
                <div className="flex items-center space-x-2 w-full">
                  <RadioGroupItem value={plan.id} id={`plan-${plan.id}`} />
                  <Label 
                    htmlFor={`plan-${plan.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <Button 
                      variant={plan.recommended ? "default" : "outline"} 
                      className="w-full"
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      Select Plan
                    </Button>
                  </Label>
                </div>
              </RadioGroup>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button 
          size="lg" 
          onClick={handleSubscribe}
          disabled={!selectedPlan}
          className="px-8"
        >
          Continue with {selectedPlan ? plans.find(p => p.id === selectedPlan)?.name : "Selected"} Plan
        </Button>
        <p className="mt-2 text-sm text-muted-foreground">
          No credit card required to sign up. Cancel anytime.
        </p>
      </div>

      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-6">Frequently Asked Questions</h2>
        <div className="grid gap-4">
          {[
            {
              q: "Can I change my plan later?",
              a: "Yes! You can upgrade, downgrade, or cancel your plan at any time from your account dashboard."
            },
            {
              q: "How often will my bins be cleaned?",
              a: "It depends on your plan. Basic includes monthly cleanings, Premium includes bi-weekly cleanings, and Ultimate includes weekly cleanings."
            },
            {
              q: "Is there a contract or commitment?",
              a: "No long-term contracts. You can cancel your subscription at any time without penalty."
            }
          ].map((faq, i) => (
            <Card key={i} className="p-4">
              <h3 className="font-medium mb-1">{faq.q}</h3>
              <p className="text-muted-foreground text-sm">{faq.a}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
