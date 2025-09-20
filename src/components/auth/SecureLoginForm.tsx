import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, EyeOff, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdvancedRateLimit } from '@/hooks/useAdvancedRateLimit';
import { MFAModal } from './MFAModal';
import { validateSecureInput, emailSchema, createPasswordSchema } from '@/utils/securityManager';
import { useToast } from '@/hooks/use-toast';

interface SecureLoginFormProps {
  role: 'customer' | 'employee' | 'admin';
  onSuccess?: () => void;
}

export function SecureLoginForm({ role, onSuccess }: SecureLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  
  const { signIn, loading } = useAuth();
  const { checkLimit, isLimited, attemptsRemaining } = useAdvancedRateLimit();
  const { toast } = useToast();

  // Generate device fingerprint for security tracking
  useEffect(() => {
    const fingerprint = btoa(`${navigator.userAgent}${screen.width}${screen.height}${new Date().getTimezoneOffset()}`);
    setDeviceFingerprint(fingerprint);
  }, []);

  // Real-time input validation with security feedback
  useEffect(() => {
    const validateInputs = async () => {
      const warnings: string[] = [];
      
      if (email) {
        try {
          emailSchema.parse(email);
        } catch {
          warnings.push('Invalid email format');
        }
      }
      
      if (password) {
        try {
          createPasswordSchema().parse(password);
        } catch {
          warnings.push('Password does not meet security requirements');
        }
      }
      
      setSecurityWarnings(warnings);
    };
    
    validateInputs();
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLimited) {
      toast({
        variant: "destructive",
        title: "Rate Limited",
        description: `Too many login attempts. ${attemptsRemaining} attempts remaining.`,
      });
      return;
    }

    // Check rate limiting
    const rateLimitIdentifier = email || deviceFingerprint;
    const canProceed = await checkLimit(rateLimitIdentifier, 'login_attempt', {
      maxAttempts: role === 'admin' ? 3 : 5,
      windowMinutes: 15
    });

    if (!canProceed) {
      return;
    }

    // Validate inputs before submission
    const emailValidation = await validateSecureInput(
      emailSchema,
      email,
      {
        identifier: rateLimitIdentifier,
        actionType: 'email_validation'
      }
    );

    const passwordValidation = await validateSecureInput(
      createPasswordSchema(),
      password,
      {
        identifier: rateLimitIdentifier,
        actionType: 'password_validation'
      }
    );

    if (!emailValidation.success || !passwordValidation.success) {
      toast({
        variant: "destructive",
        title: "Validation Failed",
        description: "Please check your email and password format.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn(email, password, role);
      
      // For admin users, show MFA setup if not already configured
      if (result === 'admin') {
        // Check if MFA is enabled (in production, check actual MFA status)
        const mfaEnabled = false; // This would come from user profile
        
        if (!mfaEnabled) {
          setShowMFA(true);
          return;
        }
      }
      
      onSuccess?.();
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Enhanced error handling with security context
      if (error.message?.includes('invalid_credentials')) {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Invalid email or password. Please check your credentials.",
        });
      } else if (error.message?.includes('too_many_requests')) {
        toast({
          variant: "destructive",
          title: "Too Many Attempts",
          description: "Account temporarily locked due to multiple failed attempts.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login Error",
          description: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMFASuccess = () => {
    setShowMFA(false);
    onSuccess?.();
  };

  const isFormValid = email && password && securityWarnings.length === 0;
  const shouldShowSecurityWarnings = securityWarnings.length > 0 && (email || password);

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            {role === 'admin' && <Shield className="h-5 w-5 text-primary" />}
            {role === 'admin' ? 'Admin Login' : `${role} Login`}
          </CardTitle>
          <CardDescription className="text-center">
            {role === 'admin' 
              ? 'Secure administrative access with enhanced protection'
              : `Sign in to your ${role} account`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Security Status Indicators */}
          <div className="mb-4 space-y-2">
            {role === 'admin' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Security Level:</span>
                <Badge variant="destructive">High Security</Badge>
              </div>
            )}
            
            {isLimited && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Rate limited. {attemptsRemaining} attempts remaining.
                  <div className="flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span className="text-xs">Reset in 15 minutes</span>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {shouldShowSecurityWarnings && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="text-sm space-y-1">
                    {securityWarnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={securityWarnings.some(w => w.includes('email')) ? 'border-destructive' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className={securityWarnings.some(w => w.includes('Password')) ? 'border-destructive' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid || loading || isSubmitting || isLimited}
            >
              {isSubmitting || loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                  Signing In...
                </>
              ) : (
                <>
                  {role === 'admin' && <Shield className="mr-2 h-4 w-4" />}
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Security Footer for Admin */}
          {role === 'admin' && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span>Enhanced Security:</span>
                  <span className="text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Session Monitoring:</span>
                  <span className="text-green-600">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rate Limiting:</span>
                  <span className="text-green-600">3 attempts/15min</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MFA Modal for Admin Users */}
      <MFAModal
        isOpen={showMFA}
        onClose={() => setShowMFA(false)}
        onSuccess={handleMFASuccess}
        userEmail={email}
      />
    </>
  );
}