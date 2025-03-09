
import ChatBot from "@/components/contact/ChatBot";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, Clock } from "lucide-react";

const ContactUs = () => {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold text-center mb-2">Contact Us</h1>
      <p className="text-center text-muted-foreground mb-8">
        We're here to help with any questions or concerns you may have.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-2xl font-bold mb-6">Chat With Our Virtual Assistant</h2>
          <ChatBot />
          
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Our AI assistant can answer common questions instantly.
            For complex inquiries, please use the contact information.
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email Us</p>
                    <a 
                      href="mailto:support@wastemanagement.com" 
                      className="text-primary hover:underline"
                    >
                      support@wastemanagement.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Call Us</p>
                    <a 
                      href="tel:1-800-555-1234" 
                      className="text-primary hover:underline"
                    >
                      1-800-555-1234
                    </a>
                    <p className="text-sm text-muted-foreground">
                      Customer Service: Mon-Fri, 8am-6pm
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Emergency Line: 24/7
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Business Hours</p>
                    <p className="text-sm text-muted-foreground">
                      Monday - Friday: 8:00 AM - 6:00 PM
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Saturday: 9:00 AM - 2:00 PM
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Visit Our Office</h3>
            <p className="text-muted-foreground">
              1234 Waste Management Way<br />
              Eco City, EC 12345<br />
              United States
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
