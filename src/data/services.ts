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
    name: "Business Services",
    services: [
      {
        name: "Grease Hood Cleaning",
        pricingModel: "Flat Rate",
        price: "$249 – $399",
        description: "Professional grease hood cleaning service"
      },
      {
        name: "Cardboard / Space Saver Pickup",
        pricingModel: "Monthly",
        price: "$79 – $99",
        description: "Regular cardboard and space saver pickup"
      },
      {
        name: "Parking Lot Pressure Wash – Small (<10k sqft)",
        pricingModel: "Flat Rate",
        price: "$399",
        description: "Pressure washing for small parking lots"
      },
      {
        name: "Parking Lot Pressure Wash – Medium (10–50k sqft)",
        pricingModel: "Flat Rate",
        price: "$699",
        description: "Pressure washing for medium parking lots"
      },
      {
        name: "Parking Lot Pressure Wash – Large (50k+ sqft)",
        pricingModel: "Flat Rate",
        price: "$999+",
        description: "Pressure washing for large parking lots"
      },
      {
        name: "Drive-Thru Pressure Wash",
        pricingModel: "Flat Rate",
        price: "$249",
        description: "Specialized drive-thru area cleaning"
      },
      {
        name: "Building Exterior Wash – Small (<5k sqft façade)",
        pricingModel: "Flat Rate",
        price: "$499",
        description: "Building exterior cleaning for small buildings"
      },
      {
        name: "Building Exterior Wash – Medium (5k–20k sqft façade)",
        pricingModel: "Flat Rate",
        price: "$999",
        description: "Building exterior cleaning for medium buildings"
      },
      {
        name: "Building Exterior Wash – Large (20k+ sqft façade)",
        pricingModel: "Flat Rate",
        price: "$1,499+",
        description: "Building exterior cleaning for large buildings"
      }
    ]
  }
];

// Add-Ons Services
export const addOnServices: ServiceCategory[] = [
  {
    name: "Add-On Services",
    services: [
      {
        name: "Extra Can Concierge",
        pricingModel: "Monthly",
        price: "+$9.99",
        description: "Additional can service per month"
      },
      {
        name: "Extra Can Cleaning",
        pricingModel: "Monthly",
        price: "+$14.99",
        description: "Additional can cleaning per month"
      },
      {
        name: "Priority Same-Day Pickup",
        pricingModel: "Per Call",
        price: "$49.99",
        description: "Same-day priority pickup service"
      },
      {
        name: "Bulk Item Removal",
        pricingModel: "Per Item",
        price: "$45 – $99",
        description: "Individual bulk item removal"
      },
      {
        name: "Yard Pickup (Premiere only)",
        pricingModel: "Per Service",
        price: "$25 – $75",
        description: "Yard waste pickup for Premiere customers"
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
  basicPrice: number;
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
    id: "basic",
    name: "Basic",
    description: "Essential service for small households",
    price: 24.99,
    features: [
      "1 trash can concierge (same day service)",
      "No can cleaning",
      "No hazardous pickup",
      "No discounts"
    ]
  },
  {
    id: "standard",
    name: "Standard",
    description: "Enhanced service with cleaning and hazardous pickup",
    price: 49.99,
    features: [
      "1 trash can + 1 recycle concierge (same day)",
      "1x/month can cleaning",
      "Bi-monthly hazardous pickup",
      "5% off add-ons"
    ]
  },
  {
    id: "premium",
    name: "Premium", 
    description: "Premium service with multiple cans and regular cleaning",
    price: 79.99,
    features: [
      "2 trash cans + 1 recycle concierge",
      "Bi-weekly can cleaning",
      "Monthly hazardous pickup",
      "1x/month large item pickup",
      "7% off add-ons"
    ]
  },
  {
    id: "comprehensive",
    name: "Comprehensive",
    description: "Complete service with area cleanup",
    price: 119.99,
    features: [
      "3 trash cans + 1 recycle concierge",
      "Weekly can cleaning/deodorizing",
      "Bi-weekly hazardous + large item pickup",
      "Trash area cleanup",
      "10% off add-ons"
    ]
  },
  {
    id: "premiere",
    name: "Premiere",
    description: "Ultimate luxury service with account manager",
    price: 169.99,
    features: [
      "All Comprehensive services",
      "Weekly hazardous pickup",
      "Weekly trash area cleaning",
      "Yard pickup (extra for large yards)",
      "Weekly large item pickup",
      "Priority service & account manager"
    ]
  }
];

// Multi-Family Property Tiers
export const multiFamilyTiers: CommunityTier[] = [
  {
    id: "mf-all",
    unitRange: "All Units",
    rangeStart: 1,
    rangeEnd: null,
    discount: 0,
    basicPrice: 9.99,
    standardPrice: 12.99,
    premiumPrice: 18.99,
    comprehensivePrice: 24.99,
    premierePrice: 32.99
  }
];

// Multi-Family Service Details
export const multiFamilyServiceDetails = [
  {
    tier: "Basic",
    price: "$9.99/unit/month",
    services: [
      "1x/week concierge (1 bag per unit)",
      "No dumpster cleaning",
      "No large item pickup"
    ],
    competitiveEdge: "Entry-level service for budget-conscious properties"
  },
  {
    tier: "Standard",
    price: "$12.99/unit/month",
    services: [
      "1x/week concierge (up to 2 bags/unit)",
      "Monthly dumpster cleaning",
      "Bi-monthly large item pickup"
    ],
    competitiveEdge: "Enhanced service with regular cleaning maintenance"
  },
  {
    tier: "Premium",
    price: "$18.99/unit/month",
    services: [
      "2x/week concierge (up to 3 bags/unit)",
      "Monthly dumpster cleaning + deodorizing",
      "2x/week trash area cleanup",
      "Graffiti cleaning"
    ],
    competitiveEdge: "Premium service with area maintenance and aesthetics"
  },
  {
    tier: "Comprehensive",
    price: "$24.99/unit/month",
    services: [
      "3x/week concierge",
      "Bi-weekly large item pickup",
      "3x/week trash area cleanup",
      "Graffiti cleanup",
      "Hallway/stair sweeping",
      "Common area cleaning"
    ],
    competitiveEdge: "Complete property maintenance solution"
  },
  {
    tier: "Premiere",
    price: "$32.99/unit/month",
    services: [
      "Daily concierge",
      "Weekly large item pickup",
      "Daily trash area cleanup",
      "Graffiti cleaning",
      "Hallway & stair sweeping",
      "Hallway wall cleaning"
    ],
    competitiveEdge: "Ultimate luxury service with daily attention"
  }
];

// Business Tiers
export const businessTiers: BusinessTier[] = [
  {
    id: "small-business",
    name: "Small Office",
    basePrice: 299,
    oneTimePrice: 399,
    contractPrices: {
      "3mo": 284,
      "6mo": 269,
      "12mo": 254
    }
  },
  {
    id: "medium-business",
    name: "Medium Business",
    basePrice: 499,
    oneTimePrice: 649,
    contractPrices: {
      "3mo": 474,
      "6mo": 449,
      "12mo": 424
    }
  },
  {
    id: "large-business",
    name: "Large Enterprise",
    basePrice: 799,
    oneTimePrice: 999,
    contractPrices: {
      "3mo": 759,
      "6mo": 719,
      "12mo": 679
    }
  }
];

// Business Service Details
export const businessServiceDetails = [
  {
    tier: "Small Office",
    description: "Perfect for small offices and retail locations",
    services: [
      "Weekly waste management",
      "Basic cleaning services",
      "Standard pickup times"
    ],
    pricing: "Custom quotes based on location and requirements"
  },
  {
    tier: "Medium Business",
    description: "Comprehensive service for growing businesses",
    services: [
      "Enhanced waste management",
      "Recycling programs",
      "Flexible scheduling"
    ],
    pricing: "Volume discounts available for multi-location businesses"
  },
  {
    tier: "Large Enterprise",
    description: "Full-service solution for large enterprises",
    services: [
      "Complete waste management",
      "Sustainability reporting",
      "Dedicated account management"
    ],
    pricing: "Enterprise pricing with custom service agreements"
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