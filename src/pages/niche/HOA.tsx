import NicheLandingTemplate from "./NicheLandingTemplate";

const HOA = () => (
  <NicheLandingTemplate
    path="/hoa"
    title="HOA Trash Can Service in Cincinnati | Can2Curb"
    description="Bulk trash bin concierge for HOAs and community associations in Greater Cincinnati. Keep curbsides compliant and bins out of sight — every week, automatically."
    eyebrow="HOA & Community Associations"
    headline="Compliant curbsides, every single week"
    subheadline="Stop chasing bin violations. Can2Curb handles every home in your HOA on one route, one invoice, one accountable provider."
    benefits={[
      { title: "Community-wide pricing", description: "Volume rates for HOAs of any size. One contract, transparent line items." },
      { title: "Bin compliance reporting", description: "Monthly reports your board can hand to homeowners — proof of pickup and bin storage." },
      { title: "Zero homeowner friction", description: "We onboard residents directly. No collection from your board, no awkward emails." },
    ]}
    faq={[
      { q: "Do you bill the HOA or homeowners?", a: "Both options available. Most HOAs prefer per-home billing — we collect directly and provide a community-level report." },
      { q: "What is the minimum community size?", a: "We service HOAs as small as 8 homes and as large as 500+ across Greater Cincinnati." },
      { q: "Can you enforce bin storage rules?", a: "Yes. We document each pickup with a timestamped photo, giving your board enforceable evidence for CC&R compliance." },
    ]}
  />
);

export default HOA;