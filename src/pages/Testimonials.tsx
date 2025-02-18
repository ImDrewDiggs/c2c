
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Phoenix, AZ",
    rating: 5,
    text: "Can2Curb has made my life so much easier! No more worrying about trash day or dealing with smelly bins. Their service is reliable and their staff is always professional.",
  },
  {
    id: 2,
    name: "Michael Chen",
    location: "San Diego, CA",
    rating: 5,
    text: "As a busy professional, this service is a game-changer. They're always on time, and the bin cleaning service keeps everything fresh and clean. Worth every penny!",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    location: "Austin, TX",
    rating: 5,
    text: "The premium service is fantastic! Having my bins cleaned monthly makes such a difference. The customer service team is always responsive and helpful.",
  },
  {
    id: 4,
    name: "David Thompson",
    location: "Denver, CO",
    rating: 5,
    text: "I manage a large apartment complex, and Can2Curb's multi-family service has simplified our waste management tremendously. Highly recommended!",
  },
  {
    id: 5,
    name: "Lisa Anderson",
    location: "Portland, OR",
    rating: 5,
    text: "The environmental focus of Can2Curb really stands out. It's great to work with a company that cares about sustainability while providing excellent service.",
  },
  {
    id: 6,
    name: "James Wilson",
    location: "Seattle, WA",
    rating: 5,
    text: "The comprehensive service package is perfect for our needs. Pet waste pickup and bulk trash removal have been invaluable additions to the regular service.",
  },
  {
    id: 7,
    name: "Maria Garcia",
    location: "Miami, FL",
    rating: 5,
    text: "Premiere service customer here and couldn't be happier. The personal account manager makes everything so smooth, and the daily pickup option is perfect for our busy household.",
  },
  {
    id: 8,
    name: "Robert Kim",
    location: "Las Vegas, NV",
    rating: 5,
    text: "Started with the standard service and upgraded to premium. The difference is notable, and the value for money is excellent. This service has become essential for our home.",
  },
];

export default function Testimonials() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Customer Testimonials</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-card p-6 rounded-lg shadow-lg">
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-card-foreground mb-4 italic">"{testimonial.text}"</p>
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold">{testimonial.name}</p>
                <p>{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
