
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
  selectedTiers: string[];
  onTierToggle: (tierId: string) => void;
}

const SingleFamilyPlans = ({ tiers, selectedTiers, onTierToggle }: SingleFamilyPlansProps) => {
  const selected = tiers.filter((tier) => selectedTiers.includes(tier.id));
  const monthlyTotal = selected.reduce((sum, tier) => sum + tier.price, 0);

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-1">Choose Your Service Plans</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Select one or more plans — they combine into a single subscription.
      </p>

      <div className="space-y-4">
        {tiers.map((tier) => {
          const isSelected = selectedTiers.includes(tier.id);
          return (
            <div
              key={tier.id}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                isSelected ? "bg-primary/10 ring-1 ring-primary/40" : "hover:bg-secondary/5"
              }`}
              onClick={() => onTierToggle(tier.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onTierToggle(tier.id);
                }
              }}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isSelected ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-medium">{tier.name}</h4>
                  <span className="text-primary font-semibold">${tier.price}/month</span>
                </div>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 space-y-6"
        >
          {selected.map((tier) => (
            <div key={tier.id}>
              <h4 className="font-semibold mb-2">{tier.name} — Included Features:</h4>
              <ul className="space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="text-primary h-5 w-5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              {tier.perk && (
                <div className="mt-4 p-4 bg-secondary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">{tier.perk}</p>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-between items-center border-t pt-4 font-semibold">
            <span>Plans running total ({selected.length} selected)</span>
            <span className="text-primary text-lg">${monthlyTotal.toFixed(2)}/mo</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SingleFamilyPlans;
