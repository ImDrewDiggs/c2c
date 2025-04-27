
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const faqItems = [
    {
      question: "What services do you offer?",
      answer: "We offer a variety of waste management services including residential garbage collection, recycling pickup, bulk item removal, yard waste collection, and special waste handling for single-family homes and multi-family communities."
    },
    {
      question: "How often is garbage collected?",
      answer: "For standard residential service, garbage is collected once per week. However, we offer more frequent pickup options for multi-family communities and commercial properties based on your subscription plan."
    },
    {
      question: "What can I recycle?",
      answer: "We accept paper, cardboard, glass bottles and jars, plastic containers (types 1-7), and metal cans. Please make sure all items are clean and dry. Electronics, batteries, and hazardous materials require special handling and cannot be placed in regular recycling bins."
    },
    {
      question: "Do you offer special pickups for large items?",
      answer: "Yes, we offer bulk item pickup for larger items such as furniture, appliances, and yard waste that doesn't fit in standard containers. These pickups can be scheduled through our customer portal or by contacting our customer service team."
    },
    {
      question: "How do I change my service plan?",
      answer: "You can modify your service plan at any time by logging into your customer account on our website or by contacting our customer service team. Changes typically take effect at the start of the next billing cycle."
    },
    {
      question: "What are your holiday schedules?",
      answer: "We observe major national holidays, during which service may be delayed by one day. We provide a holiday schedule at the beginning of each year and send reminders via email before affected collection days."
    },
    {
      question: "How much does your service cost?",
      answer: "Our pricing varies based on the type of service and frequency of collection. Please visit our Services and Prices page for detailed information, or use our Subscription page to build a custom plan that fits your needs and budget."
    },
    {
      question: "Do you offer discounts for multi-family communities?",
      answer: "Yes, we offer volume discounts for multi-family communities based on the number of units. Larger communities qualify for higher discount rates. Visit our Subscription page to see the discount tiers available."
    }
  ];

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Frequently Asked Questions</h1>
      <p className="text-center text-muted-foreground mb-8">
        Find answers to common questions about our waste management services.
      </p>
      
      <Accordion type="single" collapsible className="w-full">
        {faqItems.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-lg font-medium">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      <div className="mt-12 text-center">
        <p className="text-muted-foreground">
          Can't find what you're looking for? Visit our <a href="/contact" className="text-primary underline">Contact Us</a> page.
        </p>
      </div>
    </div>
  );
};

export default FAQ;
