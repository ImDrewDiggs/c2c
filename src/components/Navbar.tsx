import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTermsAcceptance } from "@/hooks/useTermsAcceptance";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface NavItem {
  nameKey: string;
  path: string;
  requiresTerms?: boolean;
}

/** Headline destinations, shown as full-width rows in the mobile menu. */
const primaryNavigation: NavItem[] = [
  { nameKey: "nav.home", path: "/" },
  { nameKey: "nav.servicesAndPricing", path: "/services-and-prices", requiresTerms: true },
  { nameKey: "nav.subscription", path: "/subscription", requiresTerms: true },
  { nameKey: "nav.about", path: "/about" },
];

/** Supporting pages, shown as a compact two-column grid in the mobile menu. */
const secondaryNavigation: NavItem[] = [
  { nameKey: "nav.documentation", path: "/documentation" },
  { nameKey: "nav.testimonials", path: "/testimonials" },
  { nameKey: "nav.faq", path: "/faq" },
  { nameKey: "nav.contact", path: "/contact" },
];

/** Role-based sign-in destinations, shown as a three-up portal grid. */
const portalLinks = [
  { labelKey: "nav.customer", fallback: "User", path: "/customer/login" },
  { labelKey: "nav.employee", fallback: "Staff", path: "/employee/login" },
  { labelKey: "nav.admin", fallback: "Admin", path: "/admin/login" },
];

/** Desktop bar keeps its original left-to-right order. */
const navigation: NavItem[] = [
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
              loading="eager"
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
            <div className="container py-4">
              {/* Primary destinations */}
              <div className="pb-4">
                <p className="px-1 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t("nav.sectionMain", "Main Menu")}
                </p>
                <div className="space-y-1">
                  {primaryNavigation.map((item) => (
                    <button
                      key={item.nameKey}
                      onClick={() => handleNavigation(item.path, item.requiresTerms)}
                      className="group flex w-full items-center justify-between rounded-xl px-3 py-3 text-left font-semibold text-foreground transition-colors hover:bg-muted/60 focus-visible:bg-muted/60"
                    >
                      <span>{t(item.nameKey)}</span>
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 transition-colors group-hover:bg-primary"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Supporting pages */}
              <div className="border-t border-border pt-4 pb-4">
                <p className="px-1 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t("nav.sectionResources", "Resources")}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {secondaryNavigation.map((item) => (
                    <Link
                      key={item.nameKey}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                    >
                      {t(item.nameKey)}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Role portals */}
              <div className="border-t border-border pt-4 pb-4">
                <p className="px-1 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t("nav.sectionPortals", "Access Portals")}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {portalLinks.map((portal) => (
                    <button
                      key={portal.path}
                      onClick={() => handleNavigation(portal.path)}
                      className="flex flex-col items-center justify-center rounded-xl border border-border bg-card/60 px-2 py-3 transition-colors hover:border-primary/50 hover:bg-muted/60"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {t(portal.labelKey, portal.fallback)}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {t("nav.login", "Login")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language + primary CTA */}
              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-3 py-2">
                  <span className="text-sm text-muted-foreground">
                    {t("nav.language", "Language")}
                  </span>
                  <LanguageSwitcher />
                </div>
                <button
                  className="btn-primary w-full text-center !py-3 font-bold shadow-[0_8px_20px_-4px_hsl(var(--primary)/0.45)] transition-transform active:scale-[0.98]"
                  onClick={() => handleNavigation("/customer/register")}
                >
                  {t("nav.signUp")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}