
import { motion } from "framer-motion";

interface PricingDisplayProps {
  total: number;
  discount: number;
  subscriptionType: string;
  selectedPlan?: string;
  contractLength?: string;
  selectedServices?: string[];
}

const PricingDisplay = ({ 
  total, 
  discount, 
  subscriptionType, 
  selectedPlan, 
  contractLength, 
  selectedServices 
}: PricingDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass mb-8 p-6 sticky top-0 z-50 w-full"
    >
      <h2 className="text-2xl font-bold text-center mb-4">
        Selected Services Total
      </h2>
      
      {selectedPlan && (
        <div className="text-center mb-3">
          <p className="text-lg font-medium text-muted-foreground">
            {selectedPlan} Plan
            {contractLength && ` • ${contractLength} Contract`}
          </p>
        </div>
      )}
      
      {selectedServices && selectedServices.length > 0 && (
        <div className="text-center mb-3">
          <p className="text-sm text-muted-foreground">
            Selected Services: {selectedServices.join(", ")}
          </p>
        </div>
      )}
      
      <p className="text-4xl font-bold text-primary text-center">
        ${total.toFixed(2)}
        <span className="text-lg text-gray-400">/month</span>
      </p>
      
      {discount > 0 && (
        <div className="text-center mt-3 space-y-1">
          <p className="text-sm text-green-600 font-medium">
            {subscriptionType === "multi-family" && "Volume & Contract Discount Applied"}
            {subscriptionType === "single-family" && "Contract Discount Applied"}
            {subscriptionType === "business" && "Contract & Bundle Discount Applied"}
          </p>
          <p className="text-xs text-green-600">
            Saving {discount}% on your monthly bill
          </p>
        </div>
      )}
      
      {subscriptionType === "single-family" && (
        <div className="text-center mt-3">
          <p className="text-xs text-muted-foreground">
            Referral credit: -$10/month • Long-term contracts save up to 15%
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default PricingDisplay;
