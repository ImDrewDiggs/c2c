
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/employee/dashboard/LoadingState";

export default function EmployeeLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { signIn, loading: authLoading, user, userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check for existing session on mount and redirect if appropriate
  useEffect(() => {
    // Short timeout to prevent flash of loading state for already authenticated users
    const timer = setTimeout(() => {
      if (user && (userData?.role === 'employee' || userData?.role === 'admin')) {
        navigate('/employee/dashboard');
      }
      setInitialLoading(false);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [user, userData, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide both email and password",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const role = await signIn(email, password, 'employee');
      
      if (role !== 'employee' && role !== 'admin') {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You must be an employee to access the employee dashboard",
        });
        return;
      }
      
      navigate('/employee/dashboard', { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      // Toast is already handled in the signIn function
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpClick = () => {
    toast({
      title: "Employee Registration",
      description: "Please contact your administrator to create an employee account.",
    });
  };

  // Show optimized loading state on initial render
  if (initialLoading) {
    return <LoadingState message="Loading authentication..." size="medium" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="card max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="inline-flex items-center text-sm text-gray-400 hover:text-gray-300 mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <img
              src="/lovable-uploads/47eceaaa-7293-4544-a9d0-3810212f7c1c.png"
              alt="Can2Curb Logo"
              className="mx-auto h-16 w-auto mb-6"
            />
            <h2 className="text-3xl font-bold text-white">Employee Login</h2>
            <p className="mt-2 text-sm text-gray-400">
              Access your employee dashboard.
            </p>
          </motion.div>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting || authLoading}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="pl-10"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting || authLoading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting || authLoading}>
              {(isSubmitting || authLoading) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : "Sign in"}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleSignUpClick}
              disabled={isSubmitting || authLoading}
            >
              Request Employee Account
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Need an employee account?{" "}
              <button 
                onClick={handleSignUpClick}
                className="text-primary hover:text-primary/80 underline bg-transparent border-none cursor-pointer"
              >
                Contact administrator
              </button>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
