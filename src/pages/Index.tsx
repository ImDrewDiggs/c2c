
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    console.log("Navigating to customer registration");
    navigate("/customer/register");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container py-20">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Your Trash Can Concierge
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Professional trash can maintenance services that keep your property clean and hygienic
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGetStarted} 
              className="btn-primary inline-flex items-center group"
            >
              Get Started Today
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate("/terms")} 
              className="btn-secondary inline-flex items-center group"
            >
              View Detailed Pricing
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
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
