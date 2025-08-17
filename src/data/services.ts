// Comprehensive Services Configuration

export interface ServiceCategory {
  name: string;
  services: Service[];
}

export interface Service {
  name: string;
  pricingModel: string;
  price: string;
  oneTimePrice?: string;
  subscriptionPrice?: string;
  description?: string;
}

// Single Family Residence Services
export const singleFamilyServices: ServiceCategory[] = [
  {
    name: "Single Family Residence Plans",
    services: [
      {
        name: "Small",
        pricingModel: "Monthly Base",
        price: "$49.99",
        oneTimePrice: "$99",
        subscriptionPrice: "$49.99",
        description: "3 mo: $47.49, 6 mo: $44.99, 12 mo: $42.49"
      },
      {
        name: "Medium", 
        pricingModel: "Monthly Base",
        price: "$74.99",
        oneTimePrice: "$149",
        subscriptionPrice: "$74.99",
        description: "3 mo: $71.24, 6 mo: $67.49, 12 mo: $63.74"
      },
      {
        name: "Large",
        pricingModel: "Monthly Base", 
        price: "$99.99",
        oneTimePrice: "$199",
        subscriptionPrice: "$99.99",
        description: "3 mo: $94.99, 6 mo: $89.99, 12 mo: $84.99"
      },
      {
        name: "Premiere",
        pricingModel: "Monthly Base",
        price: "$149.99", 
        oneTimePrice: "$299",
        subscriptionPrice: "$149.99",
        description: "3 mo: $142.49, 6 mo: $134.99, 12 mo: $127.49"
      }
    ]
  }
];

// Multi-Family Properties Services  
export const multiFamilyServices: ServiceCategory[] = [
  {
    name: "Multi-Family Properties",
    services: [
      {
        name: "Small (5–25 units)",
        pricingModel: "Per Unit",
        price: "$25 / $50",
        subscriptionPrice: "$25",
        oneTimePrice: "$50",
        description: "6 mo: $23.75, 12 mo: $22.50, 24 mo: $21.25"
      }
    ]
  }
];

// Business Services
export const businessServices: ServiceCategory[] = [
  {
    name: "Businesses",
    services: [
      {
        name: "Small",
        pricingModel: "Monthly Base",
        price: "$199",
        oneTimePrice: "$299",
        subscriptionPrice: "$199",
        description: "3 mo: $189, 6 mo: $179, 12 mo: $169"
      }
    ]
  }
];

// Add-Ons Services
export const addOnServices: ServiceCategory[] = [
  {
    name: "Add-Ons (All Customer Types)",
    services: [
      {
        name: "Event handling",
        pricingModel: "Monthly / One-Time",
        price: "$200 / $350",
        subscriptionPrice: "$200",
        oneTimePrice: "$350",
        description: "6 mo: $190, 12 mo: $180, 24 mo: $170, Referral: -$10"
      }
    ]
  }
];

// Service tier interfaces
export interface ServiceTier {
  id: string;
  name: string;
  description: string;
  price: number;
  oneTimePrice?: number;
  subscriptionPrices?: {
    "3mo": number;
    "6mo": number; 
    "12mo": number;
  };
  features: string[];
  perk?: string;
}

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

export interface BusinessTier {
  id: string;
  name: string;
  basePrice: number;
  oneTimePrice: number;
  contractPrices: {
    "3mo": number;
    "6mo": number;
    "12mo": number;
  };
}

// Single Family Residence Tiers
export const singleFamilyTiers: ServiceTier[] = [
  {
    id: "small",
    name: "Small",
    description: "Perfect for small households",
    price: 49.99,
    oneTimePrice: 99,
    subscriptionPrices: {
      "3mo": 47.49,
      "6mo": 44.99,
      "12mo": 42.49
    },
    features: [
      "Basic trash can-to-curb service",
      "Weekly pickup",
      "Standard service hours"
    ]
  },
  {
    id: "medium",
    name: "Medium", 
    description: "Ideal for average families",
    price: 74.99,
    oneTimePrice: 149,
    subscriptionPrices: {
      "3mo": 71.24,
      "6mo": 67.49,
      "12mo": 63.74
    },
    features: [
      "Enhanced trash management",
      "Additional pickup options",
      "Priority support"
    ]
  },
  {
    id: "large",
    name: "Large",
    description: "Comprehensive service for larger homes",
    price: 99.99,
    oneTimePrice: 199,
    subscriptionPrices: {
      "3mo": 94.99,
      "6mo": 89.99,
      "12mo": 84.99
    },
    features: [
      "Complete waste management",
      "Multiple pickup options",
      "Premium support"
    ]
  },
  {
    id: "premiere",
    name: "Premiere",
    description: "Ultimate service package",
    price: 149.99,
    oneTimePrice: 299,
    subscriptionPrices: {
      "3mo": 142.49,
      "6mo": 134.99,
      "12mo": 127.49
    },
    features: [
      "All-inclusive service",
      "Daily pickup availability",
      "Dedicated account manager",
      "Premium cleaning services"
    ]
  }
];

// Multi-Family Property Tiers
export const multiFamilyTiers: CommunityTier[] = [
  {
    id: "small-community",
    unitRange: "5–25 units",
    rangeStart: 5,
    rangeEnd: 25,
    discount: 0,
    standardPrice: 25,
    premiumPrice: 30,
    comprehensivePrice: 35,
    premierePrice: 40
  },
  {
    id: "medium-community", 
    unitRange: "26–75 units",
    rangeStart: 26,
    rangeEnd: 75,
    discount: 10,
    standardPrice: 20,
    premiumPrice: 25,
    comprehensivePrice: 30,
    premierePrice: 35
  },
  {
    id: "large-community",
    unitRange: "76+ units",
    rangeStart: 76,
    rangeEnd: null,
    discount: 20,
    standardPrice: 15,
    premiumPrice: 20,
    comprehensivePrice: 25,
    premierePrice: 30
  }
];

// Business Tiers
export const businessTiers: BusinessTier[] = [
  {
    id: "small-business",
    name: "Small",
    basePrice: 199,
    oneTimePrice: 299,
    contractPrices: {
      "3mo": 189,
      "6mo": 179,
      "12mo": 169
    }
  },
  {
    id: "medium-business",
    name: "Medium",
    basePrice: 349,
    oneTimePrice: 499,
    contractPrices: {
      "3mo": 331,
      "6mo": 314,
      "12mo": 297
    }
  },
  {
    id: "large-business",
    name: "Large",
    basePrice: 499,
    oneTimePrice: 699,
    contractPrices: {
      "3mo": 474,
      "6mo": 449,
      "12mo": 424
    }
  }
];

// Combined service categories for backward compatibility
export const serviceCategories: ServiceCategory[] = [
  ...singleFamilyServices,
  ...multiFamilyServices, 
  ...businessServices,
  ...addOnServices
];

export const pricingPolicy = {
  minimumCharge: 150,
  bundlingDiscount: "10–15%",
  bundlingThreshold: 3,
  referralCredit: 10,
  description: "Minimum service charge: $150 per job if stand-alone (excludes subscription-based trash concierge). Bundling discount: 10–15% off if customer books 3+ services in a single visit. Referral credit: -$10/mo for applicable services."
};