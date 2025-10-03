import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Shield, FileText, AlertTriangle } from 'lucide-react';
import { useTermsAcceptance } from '@/hooks/useTermsAcceptance';
import { useToast } from '@/hooks/use-toast';

export default function TermsPage() {
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { acceptTerms } = useTermsAcceptance();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAccept = async () => {
    if (!isChecked) {
      toast({
        variant: "destructive",
        title: "Agreement Required",
        description: "Please check the box to acknowledge you have read and agree to the terms."
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await acceptTerms();
      
      if (success) {
        toast({
          title: "Terms Accepted",
          description: "Thank you for accepting our terms. You can now view our services and pricing."
        });
        navigate('/services-and-prices');
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to record your acceptance. Please try again."
        });
      }
    } catch (error) {
      console.error('Terms acceptance error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Confidentiality Agreement</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Please review and accept our Non-Disclosure and Non-Compete Agreement to access pricing information
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Non-Disclosure Agreement (NDA) & Non-Compete Terms
          </CardTitle>
          <CardDescription>
            This agreement protects our business information and competitive advantages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full border rounded-md p-4">
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold text-lg mb-2">1. CONFIDENTIAL INFORMATION</h3>
                <p className="mb-3">
                  By accessing this pricing information, you acknowledge that you will be receiving confidential 
                  and proprietary business information including but not limited to:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Detailed pricing structures and profit margins</li>
                  <li>Service delivery methodologies and operational processes</li>
                  <li>Customer acquisition strategies and competitive positioning</li>
                  <li>Market analysis and business intelligence</li>
                  <li>Financial projections and business models</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-lg mb-2">2. NON-DISCLOSURE OBLIGATIONS</h3>
                <p className="mb-3">
                  You agree to maintain the confidentiality of all information provided and:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Not disclose any pricing, operational, or strategic information to third parties</li>
                  <li>Not use this information for any purpose other than evaluating our services</li>
                  <li>Not reproduce, copy, or distribute any confidential materials</li>
                  <li>Take reasonable measures to protect the confidentiality of the information</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-lg mb-2">3. NON-COMPETE RESTRICTIONS</h3>
                <p className="mb-3">
                  During the term of any potential business relationship and for 12 months thereafter, you agree:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Not to directly compete with our services in the same geographic market</li>
                  <li>Not to solicit our employees, contractors, or customers</li>
                  <li>Not to use our confidential information to develop competing services</li>
                  <li>Not to interfere with our business relationships or operations</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-lg mb-2">4. TERM AND REMEDIES</h3>
                <p className="mb-3">
                  This agreement remains in effect for 3 years from acceptance. Violation of these terms may result in:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Immediate termination of access to confidential information</li>
                  <li>Legal action for damages and injunctive relief</li>
                  <li>Recovery of attorney fees and costs</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-lg mb-2">5. GOVERNING LAW</h3>
                <p>
                  This agreement is governed by applicable state and federal laws. By accepting these terms, 
                  you acknowledge that you have read, understood, and agree to be bound by all provisions.
                </p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3 mb-6">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Important Notice:</p>
              <p>
                Your acceptance is recorded with audit information including timestamp, IP address, and device information 
                for legal compliance and security purposes.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 mb-6">
            <Checkbox 
              id="terms-acceptance" 
              checked={isChecked}
              onCheckedChange={(checked) => setIsChecked(checked === true)}
            />
            <label 
              htmlFor="terms-acceptance" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read, understood, and agree to be bound by the Non-Disclosure Agreement and Non-Compete terms above
            </label>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleAccept}
              disabled={!isChecked || isSubmitting}
              className="flex-1"
              size="lg"
            >
              {isSubmitting ? 'Recording Acceptance...' : 'I Accept - Access Pricing'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex-1"
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}