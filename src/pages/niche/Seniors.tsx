import NicheLandingTemplate from "./NicheLandingTemplate";

const Seniors = () => (
  <NicheLandingTemplate
    path="/seniors"
    title="Trash Bin Help for Seniors in Cincinnati | Can2Curb"
    description="Compassionate trash can concierge for Cincinnati seniors and their families. We take the cans out, bring them back, and keep you safe from heavy lifting."
    eyebrow="Seniors & Family Care"
    headline="Heavy bins are no longer their problem"
    subheadline="Designed for Cincinnati seniors aging in place. We handle the cans so your parent never has to drag them down a snowy driveway again."
    benefits={[
      { title: "Set it up for a loved one", description: "Adult children can sign up, pay, and manage the entire service on behalf of a parent in two minutes." },
      { title: "No-touch service", description: "We never need to enter the home. Bins are taken from the side yard and returned to the exact same spot." },
      { title: "Wellness check option", description: "Optional add-on: our crew flags anything unusual (uncollected mail, lights, weather damage) and alerts the family." },
    ]}
    faq={[
      { q: "Can I pay for my parent without giving them my card?", a: "Yes. You sign up under your own account and add their address. They never see a bill." },
      { q: "What if my parent needs to pause service for a hospital stay?", a: "Pause anytime from the dashboard with one click — no fees, no calls required." },
      { q: "Is the wellness check a medical service?", a: "No. Our crew simply notes visible concerns and notifies you. It's a courtesy, not a medical alert system." },
    ]}
  />
);

export default Seniors;