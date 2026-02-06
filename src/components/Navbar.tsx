import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTermsAcceptance } from "@/hooks/useTermsAcceptance";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const navigation = [
  { nameKey: "nav.home", path: "/" },
  { nameKey: "nav.about", path: "/about" },
  { nameKey: "nav.testimonials", path: "/testimonials" },
  { nameKey: "nav.servicesAndPricing", path: "/services-and-prices", requiresTerms: true },
  { nameKey: "nav.subscription", path: "/subscription", requiresTerms: true },
  { nameKey: "nav.documentation", path: "/documentation" },
  { nameKey: "nav.faq", path: "/faq" },
  { nameKey: "nav.contact", path: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { hasAccepted, loading: termsLoading } = useTermsAcceptance();

  const handleNavigation = (path: string, requiresTerms?: boolean) => {
    setIsOpen(false);
    
    if (requiresTerms) {
      if (!authLoading && !user) {
        const returnTo = encodeURIComponent(path);
        navigate(`/customer/register?redirect=${returnTo}`);
        return;
      }
      
      if (!termsLoading && !hasAccepted) {
        const returnTo = encodeURIComponent(path);
        navigate(`/terms?redirect=${returnTo}`);
        return;
      }
    }
    
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
              src="/logo-optimized.webp" 
              alt="Can2Curb Logo" 
              className="h-12 w-auto"
              width="48"
              height="48"
              fetchPriority="high"
              decoding="async"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              item.requiresTerms ? (
                <button
                  key={item.nameKey}
                  onClick={() => handleNavigation(item.path, item.requiresTerms)}
                  className="nav-link"
                >
                  {t(item.nameKey)}
                </button>
              ) : (
                <Link key={item.nameKey} to={item.path} className="nav-link">
                  {t(item.nameKey)}
                </Link>
              )
            ))}
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <button 
                onClick={() => navigate("/customer/register")} 
                className="btn-primary !py-2"
              >
                {t("nav.signUp")}
              </button>
              <button 
                onClick={() => navigate("/customer/login")} 
                className="nav-link"
              >
                {t("nav.customerLogin")}
              </button>
              <button 
                onClick={() => navigate("/employee/login")} 
                className="nav-link"
              >
                {t("nav.employee")}
              </button>
              <button 
                onClick={() => navigate("/admin/login")} 
                className="nav-link"
              >
                {t("nav.admin")}
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
                item.requiresTerms ? (
                  <button
                    key={item.nameKey}
                    className="block nav-link py-2 w-full text-left"
                    onClick={() => handleNavigation(item.path, item.requiresTerms)}
                  >
                    {t(item.nameKey)}
                  </button>
                ) : (
                  <Link
                    key={item.nameKey}
                    to={item.path}
                    className="block nav-link py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {t(item.nameKey)}
                  </Link>
                )
              ))}
              <div className="py-2">
                <LanguageSwitcher />
              </div>
              <button
                className="block btn-primary text-center !py-2 mb-2 w-full"
                onClick={() => handleNavigation("/customer/register")}
              >
                {t("nav.signUp")}
              </button>
              <button
                className="block nav-link py-2 w-full text-left"
                onClick={() => handleNavigation("/customer/login")}
              >
                {t("nav.customerLogin")}
              </button>
              <button
                className="block nav-link py-2 w-full text-left"
                onClick={() => handleNavigation("/employee/login")}
              >
                {t("nav.employeeLogin")}
              </button>
              <button
                className="block nav-link py-2 w-full text-left"
                onClick={() => handleNavigation("/admin/login")}
              >
                {t("nav.adminLogin")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}