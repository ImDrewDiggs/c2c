
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from '@/components/ui/card';

export default function FAQ() {
  // FAQ categories with questions and answers
  const faqCategories = [
    {
      title: "General Questions",
      faqs: [
        {
          question: "How does Can2Curb service work?",
          answer: "Can2Curb is a trash can cleaning service that comes to your home on your regularly scheduled trash pickup day. After your trash has been collected, our specially equipped trucks arrive to clean and sanitize your trash and recycling bins, leaving them fresh, clean, and odor-free."
        },
        {
          question: "How often do you recommend cleaning my trash cans?",
          answer: "For optimal cleanliness and odor control, we recommend monthly cleanings for residential customers. However, we offer flexible scheduling options including weekly, bi-weekly, or one-time cleanings based on your specific needs."
        },
        {
          question: "What areas do you service?",
          answer: "We currently service the greater Springfield area and surrounding suburbs within a 30-mile radius. You can check if your address is within our service area by entering your zip code on our home page or contacting our customer service team."
        },
        {
          question: "Is your service environmentally friendly?",
          answer: "Absolutely! We use environmentally-friendly, biodegradable cleaning solutions that effectively eliminate bacteria and odors without harmful chemicals. Our process also conserves water through our reclamation system, and we properly dispose of all wastewater according to local regulations."
        }
      ]
    },
    {
      title: "Subscription & Pricing",
      faqs: [
        {
          question: "What subscription plans do you offer?",
          answer: "We offer several subscription plans to fit your needs: Monthly ($29.99/month), Quarterly ($34.99/quarter with each service), and Annual ($300/year, saving you almost $60). All plans include standard cleaning for up to two bins. Additional bins can be added for $5 each per cleaning."
        },
        {
          question: "Can I cancel my subscription anytime?",
          answer: "Yes, you can cancel your subscription at any time through your customer dashboard or by contacting our customer service team. Monthly subscriptions can be canceled with no penalty. For annual subscriptions, we provide a prorated refund for unused services."
        },
        {
          question: "Do you offer one-time cleanings?",
          answer: "Yes, we offer one-time cleanings for $39.99 for up to two bins. This is perfect for spring cleaning, before moving, or after a particularly smelly situation. One-time cleanings can be scheduled through our website or by calling our customer service."
        },
        {
          question: "Are there any hidden fees?",
          answer: "No hidden fees! The price you see is the price you pay. We believe in transparent pricing. If you have special requirements or additional services, we'll always discuss any potential additional costs with you before performing the service."
        }
      ]
    },
    {
      title: "Service Details",
      faqs: [
        {
          question: "What does the cleaning process involve?",
          answer: "Our cleaning process involves several steps: 1) Initial rinse to remove loose debris, 2) Application of our eco-friendly cleaning solution, 3) High-pressure washing with 180°F water to sanitize and remove stubborn grime, 4) Final rinse and deodorizing treatment, and 5) Water reclamation to minimize environmental impact."
        },
        {
          question: "Do I need to be home during the service?",
          answer: "No, you don't need to be home during the service! We schedule our cleanings on your regular trash collection day after the bins have been emptied. Just leave your empty bins at the curb, and we'll take care of the rest."
        },
        {
          question: "How long does the cleaning process take?",
          answer: "The cleaning process typically takes about 5-10 minutes per bin. Our efficient system allows us to thoroughly clean your bins without disrupting your day."
        },
        {
          question: "What if it's raining or snowing on my service day?",
          answer: "We operate in most weather conditions except severe weather that might compromise safety or service quality. In cases of extreme weather, we'll notify you via email or text message and reschedule your service for the next available day."
        }
      ]
    },
    {
      title: "Account & Schedule",
      faqs: [
        {
          question: "How do I schedule or reschedule a cleaning?",
          answer: "You can easily schedule or reschedule cleanings through your online customer dashboard or by contacting our customer support team at least 48 hours before your scheduled service date."
        },
        {
          question: "What if I forgot to put my bins out on cleaning day?",
          answer: "If you forget to put your bins out, please contact us as soon as possible. We'll do our best to return later in the day if our schedule allows. Otherwise, we'll reschedule your cleaning for the next available date. Please note that missed appointments due to bins not being out may be subject to our standard cleaning fee."
        },
        {
          question: "How do I update my billing information?",
          answer: "You can update your billing information anytime by logging into your customer dashboard and navigating to the 'Billing' section. Your payment information is securely stored and processed according to industry standards."
        },
        {
          question: "Can I temporarily pause my service if I'm going on vacation?",
          answer: "Yes! You can pause your service for up to 4 consecutive weeks through your customer dashboard. This ensures you're not paying for services you don't need while you're away."
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Frequently Asked Questions</h1>
        <p className="text-center text-muted-foreground mb-12">
          Find answers to common questions about our services, pricing, and more.
        </p>
        
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-4">
              <h2 className="text-xl font-semibold">{category.title}</h2>
              <Card>
                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                      <AccordionTrigger className="px-4 text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="mb-4">Don't see your question here?</p>
          <div className="flex justify-center gap-4">
            <a href="/contact" className="btn-primary inline-block">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
