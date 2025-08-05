
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Mail, Phone, Save, Edit2 } from "lucide-react";
import { UserData } from "@/integrations/supabase/client";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CustomerProfileProps {
  userId: string;
  userData: UserData | null;
}

export default function CustomerProfile({ userId, userData }: CustomerProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: userData?.full_name || '',
    email: userData?.email || '',
    phone: userData?.phone || ''
  });
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone
        })
        .eq('id', userId);

      if (error) throw error;
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated."
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was a problem updating your profile."
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          View and edit your profile information
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Full Name
                </div>
              </Label>
              <Input
                id="full_name"
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
                disabled={!isEditing || saving}
                placeholder="Your full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Address
                </div>
              </Label>
              <Input
                id="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled={true} // Email can't be changed through this form
                placeholder="Your email address"
              />
              <p className="text-xs text-muted-foreground">
                Email address cannot be changed. Contact support for assistance.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  Phone Number
                </div>
              </Label>
              <Input
                id="phone"
                name="phone"
                value={profile.phone || ''}
                onChange={handleChange}
                disabled={!isEditing || saving}
                placeholder="Your phone number"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {isEditing ? (
            <>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button 
              type="button" 
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
