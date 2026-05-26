
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import InstantQuoteFlow from "@/components/quote/InstantQuoteFlow";

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    console.log("Navigating to customer registration");
    navigate("/customer/register");
  };

  return (
    <div className="min-h-screen">
      <Seo
        title="Trash Can Cleaning Service in Cincinnati | Can2Curb"
        description="Professional trash can cleaning and garbage bin cleaning service for homes and businesses in Greater Cincinnati. Reliable, eco-friendly, hassle-free pickup and sanitizing."
        path="/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Can2Curb",
            url: "https://c2c.lovable.app",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://c2c.lovable.app/?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Can2Curb",
            url: "https://c2c.lovable.app",
            logo: "https://c2c.lovable.app/og-image.png",
            description:
              "Trash can concierge service offering reliable pickup, cleaning, and waste management for residential and commercial properties.",
            areaServed: "Greater Cincinnati, Ohio",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+1-800-555-1234",
              contactType: "customer service",
              email: "support@can2curb.com",
              availableLanguage: ["English", "Spanish", "French"],
            },
          },
        ]}
      />
      {/* Hero Section */}
      <section className="container py-20">
        <motion.div
          initial={{ y: 10, opacity: 0.9 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="hero-text">
            Never touch your trash cans again
          </h1>
          <p className="hero-subtitle" style={{ transform: 'translateZ(0)' }}>
            Greater Cincinnati's trash can concierge. Get an instant quote and start service in under 2 minutes — no calls, no waiting.
          </p>
        </motion.div>

        <div className="mt-10">
          <InstantQuoteFlow />
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/terms")}
            className="text-sm text-muted-foreground hover:text-primary inline-flex items-center group"
          >
            View detailed pricing & terms
            <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Reliable Service",
              description: "Consistent and dependable trash can maintenance",
            },
            {
              title: "Eco-Friendly",
              description: "Environmentally conscious cleaning solutions",
            },
            {
              title: "Professional Team",
              description: "Experienced and dedicated service providers",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0.8, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.2 }}
              className="card"
            >
              <h2 className="text-xl font-semibold mb-3 text-primary">
                {feature.title}
              </h2>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
