// Comprehensive Services Configuration

export interface ServiceCategory {
  name: string;
  services: Service[];
}

export interface Service {
  name: string;
  pricingModel: string;
  price: string;
  description?: string;
}

export const serviceCategories: ServiceCategory[] = [
  {
    name: "Waste Management Services",
    services: [
      {
        name: "Trash Can-to-Curb Service (1 can)",
        pricingModel: "Monthly subscription",
        price: "$49.99/mo"
      },
      {
        name: "Extra Trash Can",
        pricingModel: "Per can",
        price: "+$5/mo"
      },
      {
        name: "Driveway Over 50 ft",
        pricingModel: "Monthly add-on",
        price: "+$10/mo"
      },
      {
        name: "Recycling Sorting Assistance",
        pricingModel: "Per visit",
        price: "$10–$15"
      },
      {
        name: "Bulk Item Removal",
        pricingModel: "Per item",
        price: "$50–$150"
      },
      {
        name: "Hazardous Waste Collection",
        pricingModel: "Per load",
        price: "$75–$200"
      },
      {
        name: "Trash Can Cleaning & Sanitizing",
        pricingModel: "Per can",
        price: "$15–$25"
      },
      {
        name: "Overflow Trash Pickup",
        pricingModel: "Per pickup",
        price: "$15–$30"
      },
      {
        name: "Pet Waste Removal",
        pricingModel: "Weekly service",
        price: "$10–$20"
      },
      {
        name: "Trash Area Deep Cleaning",
        pricingModel: "Per job",
        price: "$50–$150"
      },
      {
        name: "Seasonal Yard Waste Removal",
        pricingModel: "Per load",
        price: "$50–$120"
      },
      {
        name: "Event Trash Service",
        pricingModel: "Per event",
        price: "$100–$400"
      },
      {
        name: "Missed Pickup Recovery",
        pricingModel: "Per job",
        price: "$25–$50"
      },
      {
        name: "Move-Out / Clean-Out Service",
        pricingModel: "Per load",
        price: "$100–$300"
      },
      {
        name: "Recycling Drop-Off Runs",
        pricingModel: "Per run",
        price: "$25–$50"
      },
      {
        name: "Storm Debris Cleanup",
        pricingModel: "Per load",
        price: "$100–$300"
      }
    ]
  },
  {
    name: "Pressure Washing Services",
    services: [
      {
        name: "Driveway Pressure Washing",
        pricingModel: "Flat or per sq ft",
        price: "$150–$250 or $0.20–$0.40/sq ft"
      },
      {
        name: "Sidewalk & Walkway Cleaning",
        pricingModel: "Per sq ft",
        price: "$0.20–$0.35/sq ft"
      },
      {
        name: "House Siding Wash (Soft Wash)",
        pricingModel: "Per sq ft",
        price: "$0.15–$0.25/sq ft"
      },
      {
        name: "Deck & Patio Cleaning",
        pricingModel: "Flat or per sq ft",
        price: "$100–$250 or $0.30–$0.60/sq ft"
      },
      {
        name: "Fence Cleaning",
        pricingModel: "Per linear ft",
        price: "$1–$2/ft"
      },
      {
        name: "Garage Floor Cleaning",
        pricingModel: "Flat",
        price: "$100–$200"
      },
      {
        name: "Trash Can/Dumpster Pad Cleaning",
        pricingModel: "Flat",
        price: "$50–$150"
      },
      {
        name: "Parking Lot & Curb Cleaning",
        pricingModel: "Per sq ft",
        price: "$0.20–$0.35/sq ft"
      },
      {
        name: "Pool Deck Cleaning",
        pricingModel: "Flat",
        price: "$100–$200"
      },
      {
        name: "Graffiti Removal",
        pricingModel: "Per job",
        price: "$100–$300"
      }
    ]
  },
  {
    name: "Gutter & Roof Services",
    services: [
      {
        name: "Gutter Cleaning – 1 Story",
        pricingModel: "Flat",
        price: "$100–$150"
      },
      {
        name: "Gutter Cleaning – 2 Story",
        pricingModel: "Flat",
        price: "$150–$250"
      },
      {
        name: "Complex/Multi-Story Gutter Cleaning",
        pricingModel: "Flat",
        price: "$250–$400"
      },
      {
        name: "Downspout Clearing",
        pricingModel: "Per downspout",
        price: "$10–$20"
      },
      {
        name: "Gutter Flushing",
        pricingModel: "Per job",
        price: "$20–$50"
      },
      {
        name: "Gutter Whitening",
        pricingModel: "Per linear ft",
        price: "$1–$2/ft"
      },
      {
        name: "Minor Gutter Repair",
        pricingModel: "Per repair",
        price: "$20–$75"
      },
      {
        name: "Roof Debris Removal",
        pricingModel: "Per job",
        price: "$100–$300"
      },
      {
        name: "Roof Soft Washing",
        pricingModel: "Per sq ft",
        price: "$0.30–$0.50/sq ft"
      },
      {
        name: "Gutter Guard Installation",
        pricingModel: "Per linear ft",
        price: "$5–$8/ft"
      }
    ]
  }
];

export const pricingPolicy = {
  minimumCharge: 150,
  bundlingDiscount: "10–15%",
  bundlingThreshold: 3,
  description: "Minimum service charge: $150 per job if stand-alone (excludes subscription-based trash concierge). Bundling discount: 10–15% off if customer books 3+ services in a single visit."
};

// Original service tiers for subscription plans  
export interface ServiceTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  perk: string;
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

export const singleFamilyTiers: ServiceTier[] = [
  {
    id: "standard",
    name: "Standard Service",
    description: "Basic convenience for trash management",
    price: 49.99,
    features: [
      "Moving one trash can and one recycling bin to and from the curb weekly",
      "Additional cans: $5/month each",
      "Driveways over 50 feet: Additional $10/month",
      "No additional services included"
    ],
    perk: "Budget-conscious customers who want basic convenience for trash management"
  },
  {
    id: "premium",
    name: "Premium Service",
    description: "Enhanced service with monthly cleaning",
    price: 74.99,
    features: [
      "Everything in Standard Service",
      "Trash can cleaning service once per month",
      "Priority customer support for service requests or adjustments"
    ],
    perk: "Perfect for customers who value a clean and odor-free trash can with minimal effort"
  },
  {
    id: "comprehensive",
    name: "Comprehensive Service",
    description: "Complete care with additional services",
    price: 99.99,
    features: [
      "Everything in Premium Service",
      "Bulk trash removal (up to 3 large items per quarter)",
      "Pet waste pickup service once per week",
      "Discounts on junk removal services (10% off standard rates)"
    ],
    perk: "Designed for busy households needing additional cleanup assistance and value-added services"
  },
  {
    id: "premiere",
    name: "Premiere Service",
    description: "Ultimate convenience and service",
    price: 149.99,
    features: [
      "Everything in Comprehensive Service",
      "Unlimited bulk trash removal (up to 1 item per week)",
      "Twice-monthly trash can cleaning",
      "Daily trash removal service (on demand, up to 5 pickups per week)",
      "Access to a personal account manager for custom needs and special requests"
    ],
    perk: "Ultimate convenience for clients who prioritize time and an immaculate environment"
  }
];

export const multiFamilyTiers: CommunityTier[] = [
  {
    id: "basic-community",
    unitRange: "1-50 units",
    rangeStart: 1,
    rangeEnd: 50,
    discount: 0,
    standardPrice: 199.99,
    premiumPrice: 299.99,
    comprehensivePrice: 399.99,
    premierePrice: 499.99
  },
  {
    id: "standard-community",
    unitRange: "51-100 units",
    rangeStart: 51,
    rangeEnd: 100,
    discount: 10,
    standardPrice: 179.99,
    premiumPrice: 269.99,
    comprehensivePrice: 359.99,
    premierePrice: 449.99
  },
  {
    id: "premium-community",
    unitRange: "100+ units",
    rangeStart: 101,
    rangeEnd: null,
    discount: 20,
    standardPrice: 159.99,
    premiumPrice: 239.99,
    comprehensivePrice: 319.99,
    premierePrice: 399.99
  }
];