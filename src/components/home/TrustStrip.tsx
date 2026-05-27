import { motion } from "framer-motion";
import { ShieldCheck, Star, Leaf, Clock, MapPin, BadgeCheck } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "Licensed & Insured" },
  { icon: BadgeCheck, label: "Background-Checked Crew" },
  { icon: Leaf, label: "Eco-Friendly Solutions" },
  { icon: Clock, label: "On-Time Guarantee" },
  { icon: MapPin, label: "Locally Owned — Cincinnati" },
];

const testimonials = [
  {
    quote:
      "Set up service in two minutes. They've never missed a Monday and the cans come back spotless.",
    name: "Jessica R.",
    location: "Hyde Park, OH",
  },
  {
    quote:
      "We manage 14 Airbnbs. Can2Curb handles turn-day trash without us lifting a finger.",
    name: "Marcus D.",
    location: "Over-the-Rhine, OH",
  },
  {
    quote:
      "My mom is 82. Knowing her bins are handled every week gives our family peace of mind.",
    name: "Patricia L.",
    location: "Anderson Township, OH",
  },
];

const TrustStrip = () => {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="container py-12">
        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mb-12">
          {badges.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Icon className="w-4 h-4 text-primary" aria-hidden />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              className="card"
            >
              <div className="flex gap-1 mb-3" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-4 h-4 fill-primary text-primary"
                    aria-hidden
                  />
                ))}
              </div>
              <blockquote className="text-sm text-foreground/90 leading-relaxed">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{t.name}</span>{" "}
                — {t.location}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;