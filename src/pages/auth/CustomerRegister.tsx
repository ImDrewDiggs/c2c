
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

export default function CustomerRegister() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: '',
    agreeTerms: false
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleCheckChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'address', 'city', 'state', 'zipCode', 'propertyType'];
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Password confirmation
    if (formData.passwordConfirm && formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Passwords do not match';
    }
    
    // Terms agreement
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate API registration process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Registration successful!",
        description: "Your account has been created. Welcome to Can2Curb!",
      });
      
      navigate('/customer/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "There was a problem creating your account. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Create Your Account</CardTitle>
          <CardDescription className="text-center">
            Sign up for Can2Curb waste management services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm">Confirm Password</Label>
                  <Input
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type="password"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    className={errors.passwordConfirm ? 'border-red-500' : ''}
                  />
                  {errors.passwordConfirm && <p className="text-xs text-red-500">{errors.passwordConfirm}</p>}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Property Information</h3>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? 'border-red-500' : ''}
                  />
                  {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select 
                    name="state"
                    value={formData.state} 
                    onValueChange={(value) => handleSelectChange('state', value)}
                  >
                    <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AL">Alabama</SelectItem>
                      <SelectItem value="AK">Alaska</SelectItem>
                      <SelectItem value="AZ">Arizona</SelectItem>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="CO">Colorado</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="GA">Georgia</SelectItem>
                      <SelectItem value="HI">Hawaii</SelectItem>
                      <SelectItem value="IL">Illinois</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="WA">Washington</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className={errors.zipCode ? 'border-red-500' : ''}
                  />
                  {errors.zipCode && <p className="text-xs text-red-500">{errors.zipCode}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select 
                    name="propertyType"
                    value={formData.propertyType} 
                    onValueChange={(value) => handleSelectChange('propertyType', value)}
                  >
                    <SelectTrigger className={errors.propertyType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.propertyType && <p className="text-xs text-red-500">{errors.propertyType}</p>}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="agreeTerms" 
                checked={formData.agreeTerms}
                onCheckedChange={(checked) => handleCheckChange('agreeTerms', checked === true)}
                className={errors.agreeTerms ? 'border-red-500' : ''}
              />
              <Label htmlFor="agreeTerms" className="text-sm font-normal">
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>
            {errors.agreeTerms && <p className="text-xs text-red-500">{errors.agreeTerms}</p>}
            
            <div className="flex justify-center">
              <Button type="submit" className="min-w-[200px]" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/customer/login" className="text-primary underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
