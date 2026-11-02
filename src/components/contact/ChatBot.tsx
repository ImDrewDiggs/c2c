import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { sanitizeInput } from "@/utils/inputSanitization";

/** Pricing is NDA-protected: the public chat never reveals amounts. */
const PRICING_GATED_REPLY =
  "Our plans and pricing are available to signed-in customers after accepting our Confidentiality Agreement. Create a free account or sign in, then visit the Subscription page to see every plan and build your total.";

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

  // Enhanced bot responses with comprehensive business knowledge
  const getBotResponse = (userMessage: string): string => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    // Service & Pricing related queries - Enhanced with specific details
    if (lowerCaseMessage.includes("pricing") || lowerCaseMessage.includes("cost") || lowerCaseMessage.includes("price") || lowerCaseMessage.includes("fee")) {
      return PRICING_GATED_REPLY;
    }
    
    // Collection & Schedule related queries - Enhanced
    else if (lowerCaseMessage.includes("pickup") || lowerCaseMessage.includes("schedule") || lowerCaseMessage.includes("collection") || lowerCaseMessage.includes("when")) {
      return "Can2Curb offers flexible pickup scheduling:\n\n📅 Residential:\n• Weekly standard service\n• Same-day pickup for Premiere members\n• Schedule through your customer dashboard\n• Time slots: 8 AM - 6 PM\n\n🏢 Multi-Family:\n• 1x/week to daily service options\n• Customizable schedules\n• Common area cleaning included in higher tiers\n\n⏰ Scheduling Options:\n• Online scheduling: Log into your dashboard\n• Advance notice: 48 hours for hazardous materials\n• Holiday schedule: Posted annually\n\nNeed to schedule? Visit our customer dashboard!";
    }
    
    // Recycling related queries - Enhanced
    else if (lowerCaseMessage.includes("recycle") || lowerCaseMessage.includes("recycling") || lowerCaseMessage.includes("recyclable")) {
      return "Can2Curb's comprehensive recycling services:\n\n♻️ Accepted Recyclables:\n• Paper & cardboard\n• Glass bottles & jars\n• Plastic containers (types 1-7)\n• Metal cans (aluminum, steel)\n• Clean & dry items only\n\n🔋 Special Recycling:\n• Electronics: Scheduled pickup\n• Batteries: Special handling\n• Hazardous materials: 48-hr advance notice\n\n📦 Service Levels:\n• Standard+: Includes recycling can\n• Premium+: Bi-weekly can cleaning\n• Premiere: Weekly recycling pickup\n\nTip: Rinse containers and remove caps for better recycling!";
    }
    
    // Account management queries
    else if (lowerCaseMessage.includes("cancel") || lowerCaseMessage.includes("stop service") || lowerCaseMessage.includes("change service")) {
      return "To cancel or modify your service, please log into your customer account on our website or contact our support team directly at support@can2curb.com. Service changes require 7 days' notice, and early termination fees may apply depending on your contract.";
    } 
    
    // Special waste handling queries
    else if (lowerCaseMessage.includes("hazardous") || lowerCaseMessage.includes("electronic") || lowerCaseMessage.includes("special waste") || lowerCaseMessage.includes("battery")) {
      return "Hazardous waste and electronics require special handling and cannot be placed in regular trash bins. We offer scheduled special pickups for these items at an additional fee. Please contact customer service at least 48 hours in advance to arrange for safe disposal of these items.";
    }
    
    // Billing related queries
    else if (lowerCaseMessage.includes("bill") || lowerCaseMessage.includes("payment") || lowerCaseMessage.includes("invoice") || lowerCaseMessage.includes("pay")) {
      return "We offer multiple payment options including credit card, bank transfer, and check. Bills are generated monthly and can be viewed in your customer portal. We offer paperless billing and auto-pay options for your convenience. If you have specific billing questions, please contact our billing department at billing@wastemanagement.com.";
    }
    
    // Container related queries - Enhanced with service details
    else if (lowerCaseMessage.includes("bin") || lowerCaseMessage.includes("container") || lowerCaseMessage.includes("dumpster") || lowerCaseMessage.includes("trash can") || lowerCaseMessage.includes("cleaning")) {
      return PRICING_GATED_REPLY;
    }
    
    // Holiday schedule queries
    else if (lowerCaseMessage.includes("holiday") || lowerCaseMessage.includes("christmas") || lowerCaseMessage.includes("thanksgiving")) {
      return "We observe major national holidays, during which service may be delayed by one day. We provide a holiday schedule at the beginning of each year and send reminders via email before affected collection days. The current holiday schedule can be found on our website or in your customer portal.";
    }
    
    // Emergency service queries
    else if (lowerCaseMessage.includes("emergency") || lowerCaseMessage.includes("urgent") || lowerCaseMessage.includes("spill") || lowerCaseMessage.includes("immediate")) {
      return "For urgent issues such as spills or hazardous materials, email support@can2curb.com with \"URGENT\" in the subject line and our team will respond as quickly as possible.";
    }
    
    // Bulk item queries - New detailed section
    else if (lowerCaseMessage.includes("bulk") || lowerCaseMessage.includes("large item") || lowerCaseMessage.includes("furniture") || lowerCaseMessage.includes("appliance")) {
      return PRICING_GATED_REPLY;
    }
    
    // Subscription related queries - Enhanced
    else if (lowerCaseMessage.includes("subscription") || lowerCaseMessage.includes("plan") || lowerCaseMessage.includes("sign up") || lowerCaseMessage.includes("register") || lowerCaseMessage.includes("tier")) {
      return PRICING_GATED_REPLY;
    }
    
    // Account management queries - Enhanced
    else if (lowerCaseMessage.includes("cancel") || lowerCaseMessage.includes("stop service") || lowerCaseMessage.includes("change service") || lowerCaseMessage.includes("pause")) {
      return "Can2Curb Account Management:\n\n📊 Modify Your Service:\n• Log into your customer dashboard\n• No long-term contracts required\n• Month-to-month flexibility\n\n⚠️ Service Changes:\n• Upgrade: Effective immediately\n• Downgrade: 7-day notice required\n• Pause service: Available for up to 2 months\n• Cancellation: 7-day notice, no fees\n\n💳 Billing Adjustments:\n• Pro-rated for mid-month changes\n• Credits applied automatically\n• Refunds processed within 5-7 business days\n\n📞 Need Help?\n• Online: Customer dashboard\n• Email: support@can2curb.com\n• Phone: 1-800-555-1234\n\nWe're here to make changes easy!";
    }
    
    // Contact information queries - Enhanced
    else if (lowerCaseMessage.includes("contact") || lowerCaseMessage.includes("phone") || lowerCaseMessage.includes("email") || lowerCaseMessage.includes("reach") || lowerCaseMessage.includes("support")) {
      return "📞 Contact Can2Curb:\n\n• Email: support@can2curb.com\n• Hours: Mon-Fri 8 AM - 6 PM, Sat 9 AM - 2 PM\n• Response time: Within 24 hours\n\nYou can also use the Contact page to send us a message.";
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
    
    // Multi-family specific queries - New
    else if (lowerCaseMessage.includes("multi-family") || lowerCaseMessage.includes("apartment") || lowerCaseMessage.includes("property manager") || lowerCaseMessage.includes("hoa")) {
      return PRICING_GATED_REPLY;
    }
    
    // Premiere membership queries - New
    else if (lowerCaseMessage.includes("elite") || lowerCaseMessage.includes("premium service") || lowerCaseMessage.includes("vip")) {
      return PRICING_GATED_REPLY;
    }
    
    // Business services - Enhanced
    else if (lowerCaseMessage.includes("business") || lowerCaseMessage.includes("commercial") || lowerCaseMessage.includes("restaurant") || lowerCaseMessage.includes("office")) {
      return PRICING_GATED_REPLY;
    }
    
    // Dashboard/account help - New
    else if (lowerCaseMessage.includes("dashboard") || lowerCaseMessage.includes("login") || lowerCaseMessage.includes("account") || lowerCaseMessage.includes("portal")) {
      return "Can2Curb Customer Dashboard:\n\n🖥️ Dashboard Features:\n• Schedule pickups\n• Request bulk item removal\n• View service history\n• Manage payment methods\n• Update account information\n• Track current pickups\n• Submit service requests\n• Access billing statements\n• Contact support\n\n🔐 Account Access:\n1. Visit can2curb.com\n2. Click 'Customer Login'\n3. Enter your email & password\n4. Access your dashboard\n\n❓ Login Issues?\n• Forgot password: Use 'Reset Password' link\n• New customer: Create account during signup\n• Technical help: support@can2curb.com\n\n📱 Mobile Access:\n• Fully responsive design\n• All features available\n• Optimized for smartphones\n\nManage everything in one place!";
    }
    
    // Default response - Enhanced
    else {
      return "I'm your Can2Curb virtual assistant! I can help you with:\n\n🏠 Services:\n• Pricing & plans for all property types\n• Scheduling & pickup information\n• Recycling & waste management\n• Bulk item removal\n• Premiere membership benefits\n\n💼 Account Management:\n• Dashboard navigation\n• Service changes\n• Billing questions\n• Technical support\n\n🏢 Specialized Services:\n• Multi-family solutions\n• Business & commercial\n• Property management\n\nWhat would you like to know? Or call us at 1-800-555-1234 (Mon-Fri 8 AM - 6 PM).";
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    // Sanitize and validate user input
    const sanitizedText = sanitizeInput(inputValue.trim());
    
    // Limit message length to prevent abuse
    if (sanitizedText.length > 1000) {
      return; // Silently reject overly long messages
    }

    // Add user message with sanitized input
    const userMessage: Message = {
      id: Date.now().toString(),
      text: sanitizedText,
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
