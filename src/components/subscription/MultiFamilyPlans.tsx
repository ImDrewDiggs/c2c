
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import SelectableList from "./SelectableList";
import { multiFamilyServiceDetails } from "@/data/services";

export interface CommunityTier {
  id: string;
  unitRange: string;
  rangeStart: number;
  rangeEnd: number | null;
  discount: number;
  standardPrice: number;
  premiumPrice: number;
  comprehensivePrice: number;
  premierePrice: number;
}

export interface ServiceType {
  id: string;
  name: string;
}

interface MultiFamilyPlansProps {
  unitCount: number;
  onUnitCountChange: (count: number) => void;
  communityTiers: CommunityTier[];
  serviceTypes: ServiceType[];
  selectedCommunityTierId: string;
  selectedServiceId: string;
  onCommunityTierSelect: (tierId: string) => void;
  onServiceSelect: (serviceId: string) => void;
  pricePerUnit: number;
  totalPrice: number;
  discount: number;
}

const MultiFamilyPlans = ({
  unitCount,
  onUnitCountChange,
  communityTiers,
  serviceTypes,
  selectedCommunityTierId,
  selectedServiceId,
  onCommunityTierSelect,
  onServiceSelect,
  pricePerUnit,
  totalPrice,
  discount
}: MultiFamilyPlansProps) => {
  const tierItems = communityTiers.map(tier => ({
    id: tier.id,
    label: `${tier.unitRange} Units`,
    secondaryLabel: `${tier.discount}% Discount`
  }));

  const serviceItems = serviceTypes.map(service => ({
    id: service.id,
    label: service.name
  }));

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-4">Choose Your Community Plan</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Number of Units</label>
          <Input
            type="number"
            min="0"
            value={unitCount || ""}
            onChange={(e) => onUnitCountChange(parseInt(e.target.value) || 0)}
            placeholder="Enter number of units"
          />
          {unitCount > 0 && unitCount <= 10 && (
            <p className="text-sm text-yellow-600 mt-1">
              For communities with 10 or fewer units, please contact us for custom pricing.
            </p>
          )}
        </div>

        {unitCount > 10 && (
          <div className="space-y-4">
            <SelectableList
              title="Community Size & Discount"
              items={tierItems}
              selectedItemId={selectedCommunityTierId}
              onItemSelect={onCommunityTierSelect}
            />

            <SelectableList
              title="Service Level"
              items={serviceItems}
              selectedItemId={selectedServiceId}
              onItemSelect={onServiceSelect}
            />
          </div>
        )}

        {unitCount > 10 && selectedServiceId && selectedCommunityTierId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="p-4 bg-secondary/10 rounded-lg">
              <h4 className="font-semibold mb-2">Pricing Details:</h4>
              <ul className="space-y-2">
                <li>Price per unit: ${pricePerUnit.toFixed(2)}</li>
                <li>Number of units: {unitCount}</li>
                <li>Volume discount: {discount}%</li>
                <li className="font-semibold">Total monthly cost: ${totalPrice.toFixed(2)}</li>
              </ul>
            </div>

            {/* Service Tier Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Available Service Tiers</h4>
              {multiFamilyServiceDetails.map((service) => (
                <div key={service.tier} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-semibold">{service.tier}</h5>
                    <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      {service.price}
                    </span>
                  </div>
                  <ul className="space-y-2 mb-3">
                    {service.services.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm" dangerouslySetInnerHTML={{ __html: feature }} />
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground italic">
                    {service.competitiveEdge}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MultiFamilyPlans;
