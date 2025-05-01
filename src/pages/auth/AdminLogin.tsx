
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const { signIn, loading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading && !isSubmitting) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate, isSubmitting]);

  // Prevent repeated login attempts
  useEffect(() => {
    return () => setLoginAttempted(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginAttempted) {
      console.log("[AdminLogin] Login already in progress, ignoring duplicate attempt");
      return;
    }
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide both email and password",
      });
      return;
    }
    
    setIsSubmitting(true);
    setLoginAttempted(true);
    
    try {
      console.log("[AdminLogin] Attempting sign in with email:", email);
      const role = await signIn(email, password, 'admin');
      console.log("[AdminLogin] Sign in successful with role:", role);
      
      // Show successful login toast
      toast({
        title: "Success",
        description: "Login successful. Redirecting to dashboard...",
      });

      // Use setTimeout to ensure state updates have propagated before navigation
      setTimeout(() => {
        navigate("/admin/dashboard", { replace: true });
      }, 500);
    } catch (error: any) {
      console.error("[AdminLogin] Login error:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "An error occurred during login",
      });
    } finally {
      setIsSubmitting(false);
      // Set a timeout before allowing another login attempt
      setTimeout(() => {
        setLoginAttempted(false);
      }, 1500);
    }
  };

  // Combined loading state
  const isLoading = isSubmitting || authLoading;

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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isLoading || loginAttempted}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : "Sign in"}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
