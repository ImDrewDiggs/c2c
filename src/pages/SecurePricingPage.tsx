import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTermsAcceptance } from '@/hooks/useTermsAcceptance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Lock, 
  Shield, 
  CheckCircle, 
  DollarSign, 
  Users, 
  Building, 
  Home,
  ArrowLeft
} from 'lucide-react';

interface PricingTier {
  name: string;
  price: number;
  description: string;
  features: string[];
  profitMargin: number;
  competitiveAdvantage: string;
}

const singleFamilyPricing: PricingTier[] = [
  {
    name: "Basic Concierge",
    price: 24.99,
    description: "Essential waste management service",
    features: [
      "Weekly trash pickup coordination",
      "Basic customer support",
      "Text notifications"
    ],
    profitMargin: 65,
    competitiveAdvantage: "40% below competitors, high volume model"
  },
  {
    name: "Premium Concierge",
    price: 34.99,
    description: "Enhanced service with additional features",
    features: [
      "Bi-weekly pickup coordination",
      "Recycling management",
      "Premium customer support",
      "Mobile app access"
    ],
    profitMargin: 72,
    competitiveAdvantage: "Bundled services create 35% cost advantage"
  },
  {
    name: "Elite Concierge",
    price: 49.99,
    description: "Full-service waste and property management",
    features: [
      "Daily coordination available",
      "Special waste handling",
      "Property maintenance alerts",
      "Dedicated account manager",
      "Emergency response"
    ],
    profitMargin: 78,
    competitiveAdvantage: "Premium positioning with 50% margin over costs"
  }
];

const businessPricing: PricingTier[] = [
  {
    name: "Small Business",
    price: 89.99,
    description: "For offices under 20 employees",
    features: [
      "Daily waste coordination",
      "Compliance documentation",
      "Business hour support"
    ],
    profitMargin: 68,
    competitiveAdvantage: "B2B pricing captures enterprise value"
  },
  {
    name: "Enterprise",
    price: 199.99,
    description: "For larger commercial operations",
    features: [
      "24/7 coordination",
      "Custom waste streams",
      "Regulatory compliance",
      "Analytics dashboard",
      "Multi-location support"
    ],
    profitMargin: 75,
    competitiveAdvantage: "High-margin enterprise contracts"
  }
];

export default function SecurePricingPage() {
  const { hasAccepted, loading } = useTermsAcceptance();
  const [accessGranted, setAccessGranted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (hasAccepted) {
        setAccessGranted(true);
      } else {
        // Redirect to terms page if not accepted
        navigate('/terms');
      }
    }
  }, [hasAccepted, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  if (!accessGranted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 mx-auto text-destructive mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You must accept our confidentiality agreement to view pricing information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/terms')} className="w-full">
              Review and Accept Terms
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="h-8 w-8 text-green-600" />
          <CheckCircle className="h-6 w-6 text-green-600" />
          <h1 className="text-3xl font-bold">Confidential Pricing Information</h1>
        </div>
        <Badge variant="secondary" className="mb-4">
          ✓ Terms Accepted - Access Granted
        </Badge>
        <p className="text-lg text-muted-foreground">
          Detailed pricing analysis
        </p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {/* Single Family Pricing */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Single Family Residential Pricing
          </CardTitle>
          <CardDescription>
            Detailed pricing structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {singleFamilyPricing.map((tier) => (
              <Card key={tier.name} className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {tier.name}
                    <Badge variant="outline">{tier.profitMargin}% margin</Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Business Pricing */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Business & Commercial Pricing
          </CardTitle>
          <CardDescription>
            B2B pricing structure for commercial clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {businessPricing.map((tier) => (
              <Card key={tier.name} className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {tier.name}
                    <Badge variant="outline">{tier.profitMargin}% margin</Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Market Analysis & Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Revenue Projections (Monthly)</h4>
              <ul className="space-y-2 text-sm">
                <li>• 100 single-family customers: $2,999/month</li>
                <li>• 500 single-family customers: $14,995/month</li>
                <li>• 20 business customers: $2,799/month</li>
                <li>• Combined scale target: $20,000+/month</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Growth Strategy</h4>
              <ul className="space-y-2 text-sm">
                <li>• Focus on customer retention</li>
                <li>• Expand service area coverage</li>
                <li>• Invest in technology automation</li>
                <li>• Build strategic partnerships</li>
              </ul>
            </div>
          </div>
          <Separator />
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Strategic Notes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Competitive pricing with quality service delivery</li>
              <li>• Volume-based model enables efficient operations</li>
              <li>• Technology automation improves service quality</li>
              <li>• Flexible pricing for different market segments</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}