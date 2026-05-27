import NicheLandingTemplate from "./NicheLandingTemplate";

const Airbnb = () => (
  <NicheLandingTemplate
    path="/airbnb-str"
    title="Airbnb & STR Trash Service in Cincinnati | Can2Curb"
    description="Turn-day trash bin handling for short-term rental hosts in Greater Cincinnati. Never lose a 5-star review to an overflowing can again."
    eyebrow="Airbnb & Short-Term Rentals"
    headline="Bins handled on turn day. Every time."
    subheadline="Built for STR hosts. Coordinate pickup with your cleaning crew so guests never see an overflowing can — and you never see a 1-star review about trash."
    benefits={[
      { title: "Turnover-day coordination", description: "We sync with your cleaner's schedule. Bins are emptied, sanitized, and stored before the next check-in." },
      { title: "Multi-property dashboard", description: "Manage every listing in one portal. Add or pause units in seconds as bookings change." },
      { title: "Completion photos on every visit", description: "Timestamped proof of service goes straight to your dashboard — perfect for guest disputes." },
    ]}
    faq={[
      { q: "Can you handle same-day turns?", a: "Yes. Our STR plan includes a 4-hour service window aligned with your typical 11am check-out / 4pm check-in window." },
      { q: "What if my property is booked back-to-back for weeks?", a: "No problem — we run as often as daily. Pricing scales with frequency." },
      { q: "Do you service properties outside Cincinnati city limits?", a: "We cover all of Greater Cincinnati including Northern Kentucky and parts of Southeast Indiana." },
    ]}
  />
);

export default Airbnb;