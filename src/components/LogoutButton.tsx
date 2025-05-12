
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | 
           "ghost" | "link" | null | undefined;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  className?: string;
}

export function LogoutButton({ 
  variant = "outline", 
  size = "default",
  className = ""
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={className}
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Logging out...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </>
      )}
    </Button>
  );
}
