
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  frequency: string;
}

const services: Service[] = [
  {
    id: "weekly-cleaning",
    name: "Weekly Cleaning",
    description: "Professional cleaning of your trash cans every week",
    price: 29.99,
    frequency: "weekly",
  },
  {
    id: "bi-weekly-cleaning",
    name: "Bi-Weekly Cleaning",
    description: "Professional cleaning every two weeks",
    price: 39.99,
    frequency: "bi-weekly",
  },
  {
    id: "monthly-cleaning",
    name: "Monthly Deep Clean",
    description: "Thorough deep cleaning and sanitization monthly",
    price: 49.99,
    frequency: "monthly",
  },
  {
    id: "deodorizing",
    name: "Deodorizing Treatment",
    description: "Additional deodorizing service",
    price: 9.99,
    frequency: "per-service",
  },
  {
    id: "sanitizing",
    name: "Sanitizing Treatment",
    description: "Additional sanitizing service",
    price: 14.99,
    frequency: "per-service",
  },
];

const Subscription = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const calculateTotal = () => {
    return selectedServices
      .reduce((total, serviceId) => {
        const service = services.find(s => s.id === serviceId);
        return total + (service?.price || 0);
      }, 0)
      .toFixed(2);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        {/* Running Total */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mb-8 p-6"
        >
          <h2 className="text-2xl font-bold text-center mb-2">
            Selected Services Total
          </h2>
          <p className="text-4xl font-bold text-primary text-center">
            ${calculateTotal()}
            <span className="text-lg text-gray-400">/month</span>
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card cursor-pointer transition-all duration-200 ${
                selectedServices.includes(service.id)
                  ? "ring-2 ring-primary"
                  : ""
              }`}
              onClick={() => toggleService(service.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{service.name}</h3>
                {selectedServices.includes(service.id) && (
                  <CheckCircle2 className="text-primary h-6 w-6" />
                )}
              </div>
              <p className="text-gray-400 mb-4">{service.description}</p>
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold text-primary">
                  ${service.price}
                </p>
                <span className="text-sm text-gray-400">
                  {service.frequency}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-8 text-center">
          <button
            className="btn-primary"
            onClick={() => {
              // This will be implemented when we add authentication
              alert("Please log in to complete your subscription");
            }}
          >
            Complete Subscription
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
