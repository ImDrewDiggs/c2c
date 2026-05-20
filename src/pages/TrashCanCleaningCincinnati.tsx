import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/seo/Seo";

const features = [
  "Curbside trash & recycling pickup",
  "Eco-friendly bin sanitizing and deodorizing",
  "Residential, multi-family, and commercial plans",
  "Reliable weekly, bi-weekly, and monthly service",
  "Local team serving Greater Cincinnati",
];

const neighborhoods = [
  "Cincinnati",
  "Hyde Park",
  "Mason",
  "West Chester",
  "Blue Ash",
  "Loveland",
  "Anderson Township",
  "Montgomery",
];

const TrashCanCleaningCincinnati = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Seo
        title="Trash Can Cleaning Service Cincinnati | Can2Curb"
        description="Local trash can and garbage bin cleaning service in Cincinnati and Greater Cincinnati. Eco-friendly sanitizing, reliable pickup, transparent pricing."
        path="/trash-can-cleaning-cincinnati"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Can2Curb",
          description:
            "Trash can cleaning, garbage bin sanitizing, and curbside concierge service for homes and businesses in Greater Cincinnati.",
          url: "https://c2c.lovable.app/trash-can-cleaning-cincinnati",
          email: "support@can2curb.com",
          areaServed: {
            "@type": "City",
            name: "Cincinnati",
            address: {
              "@type": "PostalAddress",
              addressRegion: "OH",
              addressCountry: "US",
            },
          },
          serviceType: "Trash can cleaning service",
        }}
      />

      <section className="container py-20">
        <motion.div
          initial={{ y: 10, opacity: 0.9 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-4">
            Serving Greater Cincinnati
          </p>
          <h1 className="hero-text">Trash Can Cleaning Service in Cincinnati</h1>
          <p className="hero-subtitle">
            Professional garbage bin cleaning, pickup, and curbside concierge
            for Cincinnati homes and businesses. Eco-friendly sanitizing that
            leaves your bins fresh — without the hassle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/customer/register")}
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

      <section className="container py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4 text-primary">
              Why Cincinnati chooses Can2Curb
            </h2>
            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-gray-300">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4 text-primary">
              Neighborhoods we serve
            </h2>
            <ul className="grid grid-cols-2 gap-2 text-gray-300">
              {neighborhoods.map((n) => (
                <li key={n} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-400">
              Don&apos;t see your neighborhood? Email{" "}
              <a
                href="mailto:support@can2curb.com"
                className="text-primary hover:underline"
              >
                support@can2curb.com
              </a>{" "}
              and we&apos;ll let you know if we can serve your address.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TrashCanCleaningCincinnati;