import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Seo from "@/components/seo/Seo";
import InstantQuoteFlow from "@/components/quote/InstantQuoteFlow";
import TrustStrip from "@/components/home/TrustStrip";

export interface NicheLandingProps {
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  benefits: { title: string; description: string }[];
  faq: { q: string; a: string }[];
}

const NicheLandingTemplate = ({
  path,
  title,
  description,
  eyebrow,
  headline,
  subheadline,
  benefits,
  faq,
}: NicheLandingProps) => {
  return (
    <div className="min-h-screen">
      <Seo
        title={title}
        description={description}
        path={path}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Can2Curb",
            areaServed: "Greater Cincinnati, Ohio",
            url: `https://c2c.lovable.app${path}`,
            description,
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />

      <section className="container py-16">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="inline-block text-xs uppercase tracking-widest text-primary font-semibold mb-3">
            {eyebrow}
          </span>
          <h1 className="hero-text">{headline}</h1>
          <p className="hero-subtitle">{subheadline}</p>
        </motion.div>

        <div className="mt-10">
          <InstantQuoteFlow />
        </div>
      </section>

      <TrustStrip />

      <section className="container py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
          Why {eyebrow.toLowerCase()} choose Can2Curb
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="card">
              <Check className="w-5 h-5 text-primary mb-3" aria-hidden />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {b.title}
              </h3>
              <p className="text-sm text-muted-foreground">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
          Frequently asked questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {faq.map((f) => (
            <details
              key={f.q}
              className="card group cursor-pointer"
            >
              <summary className="font-semibold text-foreground list-none flex justify-between items-center">
                {f.q}
                <span className="text-primary group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
};

export default NicheLandingTemplate;