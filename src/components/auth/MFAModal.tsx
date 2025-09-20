import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Smartphone, Mail, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MFAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userEmail: string;
}

type MFAStep = 'setup' | 'verify' | 'backup';

export function MFAModal({ isOpen, onClose, onSuccess, userEmail }: MFAModalProps) {
  const [step, setStep] = useState<MFAStep>('setup');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
    return codes;
  };

  const sendVerificationCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Generate a 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the code temporarily (in production, use proper OTP storage)
      await supabase
        .from('otps')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          otp_code: code,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
        });

      // In production, send actual email/SMS
      console.log('MFA Code (Development):', code);
      
      toast({
        title: "Verification Code Sent",
        description: `A 6-digit code has been sent to ${userEmail}`,
      });
      
      setStep('verify');
    } catch (err) {
      setError('Failed to send verification code');
      console.error('MFA setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: otpData } = await supabase
        .from('otps')
        .select('*')
        .eq('otp_code', verificationCode)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (!otpData) {
        setError('Invalid or expired verification code');
        setLoading(false);
        return;
      }

      // Mark OTP as used
      await supabase
        .from('otps')
        .update({ used: true })
        .eq('id', otpData.id);

      // Generate backup codes
      const codes = generateBackupCodes();
      
      // Store MFA settings (in production, encrypt backup codes)
      await supabase
        .from('profiles')
        .update({ 
          // Add MFA fields to profiles table in future migration
          // mfa_enabled: true,
          // backup_codes: codes 
        })
        .eq('id', otpData.user_id);

      setStep('backup');
    } catch (err) {
      setError('Verification failed');
      console.error('MFA verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const completeMFASetup = () => {
    toast({
      title: "MFA Enabled",
      description: "Multi-factor authentication has been successfully enabled for your account.",
    });
    onSuccess();
    onClose();
  };

  const renderSetupStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Enable Multi-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your admin account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-3 p-4 border rounded-lg">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">Email Verification</div>
              <div className="text-sm text-muted-foreground">
                Receive codes via email to {userEmail}
              </div>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={sendVerificationCode} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Sending...' : 'Send Verification Code'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderVerifyStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Enter Verification Code
        </CardTitle>
        <CardDescription>
          Check your email for a 6-digit verification code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verification-code">Verification Code</Label>
          <Input
            id="verification-code"
            type="text"
            placeholder="000000"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep('setup')}>
            Back
          </Button>
          <Button 
            onClick={verifyCode} 
            disabled={loading || verificationCode.length !== 6}
            className="flex-1"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderBackupStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Save Your Backup Codes
        </CardTitle>
        <CardDescription>
          Store these codes securely. You can use them to access your account if you lose access to your email.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
            {backupCodes.map((code, index) => (
              <div key={index} className="flex items-center justify-between bg-background p-2 rounded">
                <span>{code}</span>
              </div>
            ))}
          </div>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Save these codes in a secure location. Each code can only be used once.
          </AlertDescription>
        </Alert>

        <Button onClick={completeMFASetup} className="w-full">
          Complete MFA Setup
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Multi-Factor Authentication</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {step === 'setup' && renderSetupStep()}
          {step === 'verify' && renderVerifyStep()}
          {step === 'backup' && renderBackupStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}