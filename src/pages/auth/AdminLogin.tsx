
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ArrowLeft, Loader2, UserPlus, HelpCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useFormState } from "@/hooks/use-form-state";
import Loading from "@/components/ui/Loading";
import { createSecureAdminUser } from "@/utils/secureAdminSetup";
import { validateEmail } from "@/utils/validation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [adminCreationResult, setAdminCreationResult] = useState<string | null>(null);
  
  const loginForm = useFormState({}, { clearErrorOnSubmit: true });
  const adminCreationForm = useFormState({}, { clearErrorOnSubmit: true });
  
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
      loginForm.setError("Please provide both email and password");
      return;
    }
    
    if (!validateEmail(email)) {
      loginForm.setError("Please provide a valid email address");
      return;
    }
    
    try {
      await loginForm.handleSubmit(async () => {
        console.log('[AdminLogin] Attempting to sign in:', email);
        const role = await signIn(email, password, 'admin');
        
        if (role !== 'admin') {
          throw new Error("You must be an admin to access the admin dashboard");
        }
        
        toast({
          title: "Success",
          description: "Login successful. Redirecting to dashboard...",
        });

        navigate("/admin/dashboard", { replace: true });
      });
    } catch (error: any) {
      console.error("[AdminLogin] Login error:", error);
      
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "Invalid login credentials. If you just created the admin account, please check your email for a confirmation link.",
      });
    }
  };

  const handleCreateAdminUser = async (adminEmail: string, adminPassword: string) => {
    setAdminCreationResult(null);
    
    try {
      await adminCreationForm.handleSubmit(async () => {
        console.log('[AdminLogin] Creating admin user:', adminEmail);
        const result = await createSecureAdminUser(adminEmail, adminPassword);
        
        if (result.success) {
          setAdminCreationResult(result.message);
          toast({
            title: "Success",
            description: result.message,
          });
          
          // Pre-fill the form with the created admin credentials
          setEmail(adminEmail);
          setPassword(adminPassword);
        } else {
          setAdminCreationResult(result.message);
          throw new Error(result.message);
        }
      });
    } catch (error: any) {
      console.error('[AdminLogin] Error creating admin user:', error);
      toast({
        variant: "destructive",
        title: "Admin Creation Failed",
        description: error.message || "Failed to create admin user. Please check the console for details.",
      });
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

  const isFormDisabled = loginForm.isLoading || authLoading || adminCreationForm.isLoading;

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
                  disabled={isFormDisabled}
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
                  disabled={isFormDisabled}
                />
              </div>
            </div>
          </div>

          {(loginForm.error || adminCreationForm.error) && (
            <div className="rounded-md p-3 bg-red-600/20 border border-red-500/30">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-200">
                    {loginForm.error || adminCreationForm.error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {adminCreationResult && (
            <div className={`rounded-md p-3 ${
              adminCreationResult.includes('confirmation') || adminCreationResult.includes('check your email')
                ? 'bg-yellow-600/20 border border-yellow-500/30'
                : adminCreationResult.includes('successfully') || adminCreationResult.includes('verified')
                ? 'bg-green-600/20 border border-green-500/30'
                : 'bg-red-600/20 border border-red-500/30'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className={`h-5 w-5 ${
                    adminCreationResult.includes('confirmation') || adminCreationResult.includes('check your email')
                      ? 'text-yellow-400'
                      : adminCreationResult.includes('successfully') || adminCreationResult.includes('verified')
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`} />
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${
                    adminCreationResult.includes('confirmation') || adminCreationResult.includes('check your email')
                      ? 'text-yellow-200'
                      : adminCreationResult.includes('successfully') || adminCreationResult.includes('verified')
                      ? 'text-green-200'
                      : 'text-red-200'
                  }`}>
                    {adminCreationResult}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={isFormDisabled}>
              {loginForm.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : "Sign in"}
            </Button>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-400 text-center">Create Admin Users:</p>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  const password = prompt('Enter admin password:');
                  if (password) handleCreateAdminUser('diggs844037@yahoo.com', password);
                }}
                disabled={isFormDisabled}
              >
                {adminCreationForm.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Yahoo Admin
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  const password = prompt('Enter admin password:');
                  if (password) handleCreateAdminUser('drewdiggs844037@gmail.com', password);
                }}
                disabled={isFormDisabled}
              >
                {adminCreationForm.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Gmail Admin
                  </>
                )}
              </Button>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleRequestAdminAccess}
              disabled={isFormDisabled}
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
