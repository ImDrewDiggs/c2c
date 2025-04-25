
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

export default function About() {
  return (
    <div className="container py-12">
      {/* Hero Section */}
      <div className="flex flex-col-reverse lg:flex-row items-center gap-8 mb-16">
        <div className="lg:w-1/2">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">About Can2Curb</h1>
          <p className="text-xl text-muted-foreground mb-6">
            We're on a mission to revolutionize trash can maintenance, one clean bin at a time.
          </p>
          <p className="mb-6">
            Founded in 2020, Can2Curb has quickly grown to become the leading trash can cleaning service in the Springfield area. Our innovative approach combines cutting-edge cleaning technology with eco-friendly practices to deliver spotless, sanitized bins that keep your property clean and odor-free.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button className="flex items-center gap-2">
              Our Services <ArrowRight size={16} />
            </Button>
            <Button variant="outline">
              Contact Us
            </Button>
          </div>
        </div>
        <div className="lg:w-1/2">
          <img
            src="/lovable-uploads/47eceaaa-7293-4544-a9d0-3810212f7c1c.png"
            alt="Can2Curb Team"
            className="rounded-lg shadow-lg object-cover w-full"
          />
        </div>
      </div>

      {/* Our Story Section */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Our Story</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            How a simple idea transformed into a thriving business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6">
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-primary font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">The Beginning</h3>
            <p className="text-muted-foreground">
              It all started when our founder, Michael Johnson, noticed the persistent odor and bacteria buildup in his own trash cans despite regular trash collection. Realizing this was a common problem for homeowners everywhere, he envisioned a solution.
            </p>
          </Card>

          <Card className="p-6">
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-primary font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Innovation</h3>
            <p className="text-muted-foreground">
              Michael developed a custom cleaning system that uses high-pressure, high-temperature water and environmentally friendly cleaning solutions to thoroughly sanitize bins. The mobile cleaning unit was designed to bring this service directly to customers' homes.
            </p>
          </Card>

          <Card className="p-6">
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-primary font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Growth</h3>
            <p className="text-muted-foreground">
              What began as a single truck operation has now expanded to a fleet serving thousands of satisfied customers across the region. Our commitment to quality service and environmental responsibility remains at the core of everything we do.
            </p>
          </Card>
        </div>
      </div>

      {/* Mission & Values */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Our Mission & Values</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            The principles that guide our business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
            <p className="mb-4">
              To provide exceptional trash can cleaning services that promote cleanliness, health, and environmental sustainability in our communities while delivering outstanding value to our customers.
            </p>
            <p>
              We believe that maintaining clean waste receptacles is not just about aesthetics—it's about creating healthier living environments and reducing the ecological footprint of waste management.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-2xl font-semibold mb-4">Core Values</h3>
            <ul className="space-y-3">
              {[
                "Environmental Responsibility - We use eco-friendly cleaning solutions and water reclamation systems",
                "Customer Satisfaction - We're not happy until you're happy with your clean bins",
                "Reliability - You can count on our scheduled service, rain or shine",
                "Innovation - We continuously improve our methods and technology",
                "Community - We're proud to serve and give back to our local area"
              ].map((value, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Meet Our Team</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            The dedicated professionals behind our exceptional service
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              name: "Michael Johnson",
              role: "Founder & CEO",
              bio: "Started Can2Curb with a vision for cleaner communities and healthier homes.",
              image: "https://source.unsplash.com/random/300x300/?portrait&man&1"
            },
            {
              name: "Sarah Martinez",
              role: "Operations Director",
              bio: "Ensures our day-to-day operations run smoothly and efficiently.",
              image: "https://source.unsplash.com/random/300x300/?portrait&woman&1"
            },
            {
              name: "David Chen",
              role: "Fleet Manager",
              bio: "Manages our growing fleet of specialized cleaning vehicles.",
              image: "https://source.unsplash.com/random/300x300/?portrait&man&2"
            },
            {
              name: "Lisa Washington",
              role: "Customer Relations",
              bio: "Dedicated to providing exceptional customer experiences.",
              image: "https://source.unsplash.com/random/300x300/?portrait&woman&2"
            }
          ].map((member, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="h-64 overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold">{member.name}</h3>
                <p className="text-primary text-sm mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to experience the Can2Curb difference?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Join thousands of satisfied customers who enjoy cleaner, fresher, and more hygienic waste bins. Your satisfaction is guaranteed with our premium cleaning service.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button>
            Schedule Your First Cleaning
          </Button>
          <Button variant="outline">
            View Pricing Plans
          </Button>
        </div>
      </div>
    </div>
  );
}
