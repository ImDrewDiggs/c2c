
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

export interface ServiceTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  perk?: string;
}

interface SingleFamilyPlansProps {
  tiers: ServiceTier[];
  selectedTier: string;
  onTierSelect: (tierId: string) => void;
}

const SingleFamilyPlans = ({ tiers, selectedTier, onTierSelect }: SingleFamilyPlansProps) => {
  const getSelectedTier = (): ServiceTier | undefined => {
    return tiers.find((tier) => tier.id === selectedTier);
  };

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-4">Choose Your Service Plan</h3>
      
      <div className="space-y-4">
        {tiers.map((tier) => (
          <div 
            key={tier.id}
            className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
              selectedTier === tier.id ? "bg-primary/10" : "hover:bg-secondary/5"
            }`}
            onClick={() => onTierSelect(tier.id)}
          >
            <div className="mt-0.5 flex-shrink-0">
              {selectedTier === tier.id ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <h4 className="font-medium">{tier.name}</h4>
                <span className="text-primary font-semibold">${tier.price}/month</span>
              </div>
              <p className="text-sm text-muted-foreground">{tier.description}</p>
            </div>
          </div>
        ))}
      </div>

      {getSelectedTier() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6"
        >
          <h4 className="font-semibold mb-2">Included Features:</h4>
          <ul className="space-y-2">
            {getSelectedTier()?.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <CheckCircle2 className="text-primary h-5 w-5 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          {getSelectedTier()?.perk && (
            <div className="mt-4 p-4 bg-secondary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">{getSelectedTier()?.perk}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default SingleFamilyPlans;
