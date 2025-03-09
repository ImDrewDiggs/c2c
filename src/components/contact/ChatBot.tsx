
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your virtual assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Enhanced bot responses based on keywords
  const getBotResponse = (userMessage: string): string => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    // Service & Pricing related queries
    if (lowerCaseMessage.includes("pricing") || lowerCaseMessage.includes("cost") || lowerCaseMessage.includes("price") || lowerCaseMessage.includes("fee")) {
      return "Our pricing varies based on your needs. For single-family homes, plans start at $29.99/month for basic service. Multi-family communities receive volume discounts starting at 10% for 10+ units. Please visit our Services and Prices page for detailed information or use our Subscription tool to get a custom quote.";
    } 
    
    // Collection & Schedule related queries
    else if (lowerCaseMessage.includes("pickup") || lowerCaseMessage.includes("schedule") || lowerCaseMessage.includes("collection") || lowerCaseMessage.includes("when")) {
      return "We offer flexible pickup schedules. Standard residential service includes weekly collection, but we can accommodate more frequent pickups if needed. Multi-family properties can schedule bi-weekly or daily service based on volume. You can manage your pickup schedule through your customer account or contact customer service for changes.";
    } 
    
    // Recycling related queries
    else if (lowerCaseMessage.includes("recycle") || lowerCaseMessage.includes("recycling") || lowerCaseMessage.includes("recyclable")) {
      return "We accept paper, cardboard, glass bottles and jars, plastic containers (types 1-7), and metal cans for recycling. Please ensure all items are clean and dry. Electronics, batteries, and hazardous materials require special handling and can be scheduled for special pickup. Visit our website for detailed recycling guidelines.";
    } 
    
    // Account management queries
    else if (lowerCaseMessage.includes("cancel") || lowerCaseMessage.includes("stop service") || lowerCaseMessage.includes("change service")) {
      return "To cancel or modify your service, please log into your customer account on our website or contact our support team directly at support@wastemanagement.com. Service changes require 7 days' notice, and early termination fees may apply depending on your contract.";
    } 
    
    // Special waste handling queries
    else if (lowerCaseMessage.includes("hazardous") || lowerCaseMessage.includes("electronic") || lowerCaseMessage.includes("special waste") || lowerCaseMessage.includes("battery")) {
      return "Hazardous waste and electronics require special handling and cannot be placed in regular trash bins. We offer scheduled special pickups for these items at an additional fee. Please contact customer service at least 48 hours in advance to arrange for safe disposal of these items.";
    }
    
    // Billing related queries
    else if (lowerCaseMessage.includes("bill") || lowerCaseMessage.includes("payment") || lowerCaseMessage.includes("invoice") || lowerCaseMessage.includes("pay")) {
      return "We offer multiple payment options including credit card, bank transfer, and check. Bills are generated monthly and can be viewed in your customer portal. We offer paperless billing and auto-pay options for your convenience. If you have specific billing questions, please contact our billing department at billing@wastemanagement.com.";
    }
    
    // Container related queries
    else if (lowerCaseMessage.includes("bin") || lowerCaseMessage.includes("container") || lowerCaseMessage.includes("dumpster") || lowerCaseMessage.includes("trash can")) {
      return "We provide various container sizes based on your needs. Standard residential service includes a 65-gallon wheeled bin, but we also offer 35-gallon and 95-gallon options. Multi-family properties can choose from dumpsters ranging from 2 to 8 cubic yards. Container maintenance and replacement is included in your service.";
    }
    
    // Holiday schedule queries
    else if (lowerCaseMessage.includes("holiday") || lowerCaseMessage.includes("christmas") || lowerCaseMessage.includes("thanksgiving")) {
      return "We observe major national holidays, during which service may be delayed by one day. We provide a holiday schedule at the beginning of each year and send reminders via email before affected collection days. The current holiday schedule can be found on our website or in your customer portal.";
    }
    
    // Emergency service queries
    else if (lowerCaseMessage.includes("emergency") || lowerCaseMessage.includes("urgent") || lowerCaseMessage.includes("spill") || lowerCaseMessage.includes("immediate")) {
      return "For waste management emergencies such as spills or hazardous material incidents, please call our 24/7 emergency line at 1-800-555-9876. Our emergency response team is available around the clock to handle urgent situations.";
    }
    
    // Subscription related queries
    else if (lowerCaseMessage.includes("subscription") || lowerCaseMessage.includes("plan") || lowerCaseMessage.includes("sign up") || lowerCaseMessage.includes("register")) {
      return "You can sign up for our services through our website's Subscription page. We offer flexible plans for both single-family homes and multi-family communities with various service frequencies. New customers receive a 10% discount on their first three months of service. Visit our Subscription page to get started.";
    }
    
    // Contact information queries
    else if (lowerCaseMessage.includes("contact") || lowerCaseMessage.includes("phone") || lowerCaseMessage.includes("email") || lowerCaseMessage.includes("reach")) {
      return "You can reach our customer service team by phone at 1-800-555-1234 (Mon-Fri, 8am-6pm), by email at support@wastemanagement.com, or through the contact form on our website. For emergencies, our 24/7 hotline is 1-800-555-9876.";
    }
    
    // Business hours queries
    else if (lowerCaseMessage.includes("hours") || lowerCaseMessage.includes("open") || lowerCaseMessage.includes("closed") || lowerCaseMessage.includes("office")) {
      return "Our customer service team is available Monday through Friday, 8am to 6pm, and Saturday from 9am to 2pm. Our offices are closed on Sundays and major holidays. For urgent matters outside of these hours, we have 24/7 support available at our emergency hotline.";
    }
    
    // Greeting responses
    else if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi") || lowerCaseMessage.includes("hey") || lowerCaseMessage.includes("greetings")) {
      return "Hello! How can I assist you with our waste management services today?";
    } 
    
    // Gratitude responses
    else if (lowerCaseMessage.includes("thank") || lowerCaseMessage.includes("thanks") || lowerCaseMessage.includes("appreciate")) {
      return "You're welcome! Is there anything else I can help you with regarding our waste management services?";
    }
    
    // Default response
    else {
      return "I'm not sure I understand your question about our waste management services. Could you please rephrase or ask about specific topics like pricing, scheduling, recycling, or account management? Alternatively, you can reach our customer service team at 1-800-555-1234.";
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot typing with a slight delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(userMessage.text),
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4">
        <div className="flex flex-col h-[400px]">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-3 pb-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p>{message.text}</p>
                  <div
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-primary-foreground/80"
                        : "text-secondary-foreground/80"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 mr-2"
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatBot;
