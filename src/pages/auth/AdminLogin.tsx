import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ArrowLeft, Loader2, UserPlus, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Loading from "@/components/ui/Loading";
import { createAdminUser, ADMIN_CREDENTIALS } from "@/utils/adminSetup";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { signIn, loading: authLoading, user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user && isAdmin) {
        navigate("/admin/dashboard", { replace: true });
      }
      setInitialLoading(false);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [user, isAdmin, navigate]);

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
      console.log('[AdminLogin] Attempting to sign in:', email);
      const role = await signIn(email, password, 'admin');
      
      if (role !== 'admin') {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You must be an admin to access the admin dashboard",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Login successful. Redirecting to dashboard...",
      });

      navigate("/admin/dashboard", { replace: true });
    } catch (error: any) {
      console.error("[AdminLogin] Login error:", error);
      
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "Invalid login credentials. If you just created the admin account, please wait a moment and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAdminUser = async () => {
    setIsCreatingAdmin(true);
    try {
      console.log('[AdminLogin] Creating admin user...');
      const result = await createAdminUser();
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        
        // Pre-fill the form with admin credentials
        setEmail(ADMIN_CREDENTIALS.email);
        setPassword(ADMIN_CREDENTIALS.password);
      } else {
        toast({
          variant: "destructive",
          title: "Admin Creation Failed",
          description: result.message,
        });
      }
    } catch (error: any) {
      console.error('[AdminLogin] Error creating admin user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create admin user. Please check the console for details.",
      });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleRequestAdminAccess = () => {
    toast({
      title: "Admin Access Request",
      description: "For admin access, please contact the system administrator or use the 'Create Admin User' button if you're setting up the system for the first time.",
    });
  };

  if (initialLoading) {
    return <Loading fullscreen={true} size="medium" message="Loading authentication..." />;
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
            <h2 className="text-3xl font-bold text-white">Admin Login</h2>
            <p className="mt-2 text-sm text-gray-400">
              Access the administrative dashboard.
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
              onClick={handleCreateAdminUser}
              disabled={isSubmitting || authLoading || isCreatingAdmin}
            >
              {isCreatingAdmin ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin User...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Admin User
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleRequestAdminAccess}
              disabled={isSubmitting || authLoading}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Request Admin Access
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Need help with admin access?{" "}
              <button 
                onClick={handleRequestAdminAccess}
                className="text-primary hover:text-primary/80 underline bg-transparent border-none cursor-pointer"
              >
                Contact system administrator
              </button>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
