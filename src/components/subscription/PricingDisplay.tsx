
import { motion } from "framer-motion";

interface PricingDisplayProps {
  total: number;
  discount: number;
  subscriptionType: string;
  selectedPlan?: string;
  contractLength?: string;
  selectedServices?: string[];
  basePrice?: number;
  addOnsTotal?: number;
  bundleDiscount?: number;
  contractMonths?: number;
}

const PricingDisplay = ({ 
  total, 
  discount, 
  subscriptionType, 
  selectedPlan, 
  contractLength, 
  selectedServices,
  basePrice,
  addOnsTotal,
  bundleDiscount,
  contractMonths = 1
}: PricingDisplayProps) => {
  const isMultiMonth = contractMonths > 1;
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass mb-8 p-6 sticky top-0 z-50 w-full"
    >
      <h2 className="text-2xl font-bold text-center mb-4">
        Pricing Summary
      </h2>
      
      {selectedPlan && (
        <div className="text-center mb-3">
          <p className="text-lg font-medium text-muted-foreground">
            {selectedPlan} Plan
            {contractLength && ` • ${contractLength} Contract`}
          </p>
        </div>
      )}
      
      {/* Detailed Breakdown */}
      {basePrice !== undefined && basePrice > 0 && (
        <div className="space-y-2 mb-4 border-t border-b py-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Plan:</span>
            <span className="font-medium">${basePrice.toFixed(2)}/mo</span>
          </div>
          
          {selectedServices && selectedServices.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Add-ons:</p>
              {selectedServices.map((service, index) => (
                <div key={service} className="flex justify-between text-xs pl-4">
                  <span className="text-muted-foreground">
                    {service}
                    {index === 1 && selectedServices.length >= 2 && " (25% off)"}
                  </span>
                </div>
              ))}
              {addOnsTotal !== undefined && addOnsTotal > 0 && (
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-muted-foreground">Add-ons subtotal:</span>
                  <span className="font-medium">${addOnsTotal.toFixed(2)}/mo</span>
                </div>
              )}
            </div>
          )}
          
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Contract discount ({discount}%):</span>
              <span className="font-medium">-${(((basePrice || 0) + (addOnsTotal || 0)) * (discount / 100)).toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
      
      <p className="text-4xl font-bold text-primary text-center">
        ${total.toFixed(2)}
        <span className="text-lg text-muted-foreground">
          {isMultiMonth ? ` for ${contractMonths} months` : '/month'}
        </span>
      </p>
      
      {isMultiMonth && (
        <p className="text-center text-sm text-muted-foreground mt-2">
          ${(total / contractMonths).toFixed(2)}/month
        </p>
      )}
      
      {(discount > 0 || (bundleDiscount && bundleDiscount > 0)) && (
        <div className="text-center mt-3 space-y-1">
          <p className="text-sm text-green-600 font-medium">
            {subscriptionType === "multi-family" && "Volume & Contract Discount Applied"}
            {subscriptionType === "single-family" && "Discounts Applied"}
            {subscriptionType === "business" && "Contract & Bundle Discount Applied"}
          </p>
          {discount > 0 && (
            <p className="text-xs text-green-600">
              {contractLength} contract: {discount}% off
            </p>
          )}
          {bundleDiscount && bundleDiscount > 0 && (
            <p className="text-xs text-green-600">
              Bundle discount: 25% off 2nd add-on
            </p>
          )}
        </div>
      )}
      
      {subscriptionType === "single-family" && (
        <div className="text-center mt-3">
          <p className="text-xs text-muted-foreground">
            Additional savings available with referrals and AutoPay
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default PricingDisplay;
