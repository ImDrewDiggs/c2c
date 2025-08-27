
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  { name: "Testimonials", path: "/testimonials" },
  { name: "Services & Pricing", path: "/services-and-prices" },
  { name: "Subscription", path: "/subscription" },
  { name: "FAQs", path: "/faq" },
  { name: "Contact Us", path: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    // Add a small delay to ensure the menu closes before navigation
    setTimeout(() => {
      navigate(path);
    }, 10);
  };

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/47eceaaa-7293-4544-a9d0-3810212f7c1c.png" 
              alt="Can2Curb Logo" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} to={item.path} className="nav-link">
                {item.name}
              </Link>
            ))}
            <div className="flex space-x-4">
              <button 
                onClick={() => navigate("/customer/register")} 
                className="btn-primary !py-2"
              >
                Sign Up
              </button>
              <button 
                onClick={() => navigate("/customer/login")} 
                className="nav-link"
              >
                Customer Login
              </button>
              <button 
                onClick={() => navigate("/employee/login")} 
                className="nav-link"
              >
                Employee
              </button>
              <button 
                onClick={() => navigate("/admin/login")} 
                className="nav-link"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass"
          >
            <div className="container py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block nav-link py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <button
                className="block btn-primary text-center !py-2 mb-2 w-full"
                onClick={() => handleNavigation("/customer/register")}
              >
                Sign Up
              </button>
              <button
                className="block nav-link py-2 w-full text-left"
                onClick={() => handleNavigation("/customer/login")}
              >
                Customer Login
              </button>
              <button
                className="block nav-link py-2 w-full text-left"
                onClick={() => handleNavigation("/employee/login")}
              >
                Employee Login
              </button>
              <button
                className="block nav-link py-2 w-full text-left"
                onClick={() => handleNavigation("/admin/login")}
              >
                Admin Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
