
export default function About() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <img 
            src="/lovable-uploads/47eceaaa-7293-4544-a9d0-3810212f7c1c.png"
            alt="Can2Curb Logo"
            className="mx-auto w-64 h-64 mb-8"
          />
          <button className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90">
            Get Started Today
          </button>
        </div>

        <h1 className="text-3xl font-bold text-primary mb-8">About Can~2~Curb</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-card p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-primary mb-4">Our Mission</h2>
            <p className="text-card-foreground">
              At Can~2~Curb, our mission is to provide exceptional trash can maintenance services that enhance the 
              cleanliness and hygiene of our communities. We believe in delivering convenience while promoting environmental 
              responsibility.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-primary mb-4">Our Vision</h2>
            <p className="text-card-foreground">
              We envision a future where every household and business can maintain pristine, odor-free waste 
              management solutions without the hassle. Our goal is to become the leading trash can concierge service 
              nationwide.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-primary mb-4">Our Values</h2>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-primary">→</span>
                Environmental Stewardship
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">→</span>
                Customer Satisfaction
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">→</span>
                Professional Excellence
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">→</span>
                Community Impact
              </li>
            </ul>
          </div>

          <div className="bg-card p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-primary mb-4">Our Commitment</h2>
            <p className="text-card-foreground">
              We are committed to providing reliable, professional, and eco-friendly services that make a real difference in our 
              customers' lives. Through innovative solutions and dedicated service, we aim to exceed expectations and set 
              new standards in the industry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
