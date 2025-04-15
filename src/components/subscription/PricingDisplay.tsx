
import { motion } from "framer-motion";

interface PricingDisplayProps {
  total: number;
  discount: number;
  subscriptionType: string;
}

const PricingDisplay = ({ total, discount, subscriptionType }: PricingDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass mb-8 p-6 sticky top-0 z-50 w-full"
    >
      <h2 className="text-2xl font-bold text-center mb-2">
        Selected Services Total
      </h2>
      <p className="text-4xl font-bold text-primary text-center">
        ${total.toFixed(2)}
        <span className="text-lg text-gray-400">/month</span>
      </p>
      {subscriptionType === "multi-family" && discount > 0 && (
        <p className="text-center text-sm text-green-600 mt-2">
          Includes {discount}% volume discount
        </p>
      )}
    </motion.div>
  );
};

export default PricingDisplay;
