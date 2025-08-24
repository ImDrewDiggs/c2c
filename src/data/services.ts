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
    id: "standard",
    name: "Standard",
    description: "Entry-level service perfect for small households",
    price: 19,
    features: [
      "Weekly bin cleaning (1 bin; hot water sanitize, basic deodorizer)",
      "Basic junk removal (up to 1/4 truckload/month, curbside)",
      "Standard concierge (trash to curb 3 nights/week)"
    ],
    perk: "$19 (1st bin) + $8/add'l bin; $99 junk allowance. Undercuts Ohio Clean Cans ($20 one-time equiv. to $25/month); 55% margin ($10.50 profit/month). Entry hook for 60% conversion to higher tiers."
  },
  {
    id: "premium",
    name: "Premium", 
    description: "Enhanced service for growing families",
    price: 29,
    features: [
      "All Standard + bi-weekly bin cleaning (up to 2 bins; steam sanitize + premium deodorizer)",
      "Enhanced junk (1/2 truckload/month; same-day option)",
      "Full concierge (5 nights/week; recycling included)"
    ],
    perk: "$29 (1st bin) + $10/add'l; $149 junk allowance. Beats Neighborhood Fresh Cans ($27/month); adds app notifications. 58% margin ($16.80 profit)."
  },
  {
    id: "comprehensive",
    name: "Comprehensive",
    description: "Complete service for larger homes",
    price: 39,
    features: [
      "All Premium + monthly deep clean (all bins; bacteria test + eco-sealant)",
      "Full junk (full truckload/month; includes appliances, no extra fees)",
      "24/7 concierge (on-demand pickups; yard waste add-on)"
    ],
    perk: "$39 (1st bin) + $12/add'l; $249 junk allowance. Bundles to undercut Junk Shot ($99+ per job); route optimization saves 20% costs. 60% margin ($23.40 profit)."
  },
  {
    id: "premiere",
    name: "Premiere",
    description: "Ultimate luxury service package",
    price: 49,
    features: [
      "All Comprehensive + quarterly full-property audit (bins, junk hotspots; custom sustainability report)",
      "Unlimited junk (priority scheduling; white-glove handling)",
      "Elite concierge (dedicated rep, EV vehicle pickups, integration with smart home apps)"
    ],
    perk: "$49 (1st bin) + $15/add'l; Unlimited junk (up to 2 full loads/month). Dominates with luxury (e.g., vs. Valet Living's basic); analytics for retention. 62% margin ($30.40 profit); targets high-end neighborhoods for $10k+ annual contracts."
  }
];

// Multi-Family Property Tiers
export const multiFamilyTiers: CommunityTier[] = [
  {
    id: "standard-mf",
    unitRange: "50+ units",
    rangeStart: 50,
    rangeEnd: null,
    discount: 0,
    standardPrice: 9,
    premiumPrice: 14,
    comprehensivePrice: 19,
    premierePrice: 24
  }
];

// Multi-Family Service Details
export const multiFamilyServiceDetails = [
  {
    tier: "Standard",
    price: "$9/unit (min. 50 units); $199 junk/building",
    services: [
      "Weekly bin cleaning (shared dumpsters; basic sanitize)",
      "Basic junk for common areas (1/4 truckload/building/month)",
      "Standard valet trash (3 nights/week; doorstep for residents)"
    ],
    competitiveEdge: "Undercuts CCS/Valet Living ($8-15); scalable for small complexes. 50% margin ($4.50/unit profit); low acquisition via property manager partnerships."
  },
  {
    tier: "Premium",
    price: "$14/unit (min. 50 units); $299 junk/building",
    services: [
      "All Standard + bi-weekly bin cleaning (individual bins; premium sanitize + deodorizers)",
      "Enhanced junk (1/2 truckload/building; resident requests)",
      "Full valet (5 nights/week; recycling + pet waste option)"
    ],
    competitiveEdge: "Matches Doorstep Details but adds resident app; 55% margin ($7.70/unit). High retention (99% like Valet Living)."
  },
  {
    tier: "Comprehensive",
    price: "$19/unit (min. 50 units); $499 junk/building",
    services: [
      "All Premium + monthly deep clean (all bins/dumpsters; eco-audit)",
      "Full junk (full truckload/building; construction debris included)",
      "24/7 valet (on-demand; bulk recycling events)"
    ],
    competitiveEdge: "Bundles to beat Rumpke ($150-350/job); cost savings from volume. 58% margin ($11/unit). Targets mid-size (100-300 units) for $20k+ annual revenue/building."
  },
  {
    tier: "Premiere",
    price: "$24/unit (min. 50 units); Unlimited junk (up to 4 loads/month)",
    services: [
      "All Comprehensive + quarterly property-wide sustainability report (waste analytics, ROI for managers)",
      "Unlimited junk (priority for evictions/renos; EV fleet)",
      "Elite valet (dedicated team, custom branding, integration with property management software)"
    ],
    competitiveEdge: "Luxury domination (e.g., vs. Clean Bins' basic); includes marketing co-op for resident perks. 60% margin ($14.40/unit); aim for 5-10 buildings Year 1 ($100k+ revenue)."
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