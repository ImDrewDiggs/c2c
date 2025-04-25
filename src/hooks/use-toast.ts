
// Re-export the toast and useToast from the ui toast component
import { toast } from "@/components/ui/toast";
import { useToast as useToastUI } from "@/components/ui/toast"; 

// Re-export with renamed variable to avoid circular references
export const useToast = useToastUI;
export { toast };
