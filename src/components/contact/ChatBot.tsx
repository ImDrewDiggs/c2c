import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { sanitizeInput } from "@/utils/inputSanitization";

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
      return "Can2Curb offers flexible pricing for all property types:\n\n🏠 Single-Family Homes:\n• Basic: $24.99/mo (1 trash can concierge)\n• Standard: $49.99/mo (trash + recycle)\n• Premium: $79.99/mo (2 trash + recycle)\n• Comprehensive: $119.99/mo (3 cans + cleaning)\n• Premiere: $169.99/mo (all services + account manager)\n\n🏢 Multi-Family Properties:\n• Starting at $9.99/unit/month\n• Volume discounts available\n• Daily service options for Premiere\n\n💼 Business Services:\n• Grease hood cleaning: $249-$399\n• Pressure washing: Custom quotes\n• Cardboard pickup: $79-$99/mo\n\nVisit our Subscription page for detailed plans!";
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
    
    // Container related queries - Enhanced with service details
    else if (lowerCaseMessage.includes("bin") || lowerCaseMessage.includes("container") || lowerCaseMessage.includes("dumpster") || lowerCaseMessage.includes("trash can") || lowerCaseMessage.includes("cleaning")) {
      return "Can2Curb container services:\n\n🗑️ Residential Containers:\n• Standard 65-gallon wheeled bins\n• Additional cans: +$9.99/month\n• Can cleaning: +$14.99/month\n\n🏢 Multi-Family Dumpsters:\n• 2-8 cubic yard options\n• Monthly cleaning included (Standard+)\n• Deodorizing (Premium+)\n• Daily cleaning (Premiere)\n\n✨ Cleaning Services:\n• Standard: 1x/month\n• Premium: Bi-weekly + deodorizing\n• Comprehensive: Weekly cleaning\n• Premiere: Weekly + area cleanup\n\nAll maintenance & replacement included!";
    }
    
    // Holiday schedule queries
    else if (lowerCaseMessage.includes("holiday") || lowerCaseMessage.includes("christmas") || lowerCaseMessage.includes("thanksgiving")) {
      return "We observe major national holidays, during which service may be delayed by one day. We provide a holiday schedule at the beginning of each year and send reminders via email before affected collection days. The current holiday schedule can be found on our website or in your customer portal.";
    }
    
    // Emergency service queries
    else if (lowerCaseMessage.includes("emergency") || lowerCaseMessage.includes("urgent") || lowerCaseMessage.includes("spill") || lowerCaseMessage.includes("immediate")) {
      return "For waste management emergencies such as spills or hazardous material incidents, please call our 24/7 emergency line at 1-800-555-9876. Our emergency response team is available around the clock to handle urgent situations.";
    }
    
    // Bulk item queries - New detailed section
    else if (lowerCaseMessage.includes("bulk") || lowerCaseMessage.includes("large item") || lowerCaseMessage.includes("furniture") || lowerCaseMessage.includes("appliance")) {
      return "Can2Curb Bulk Item Pickup Service:\n\n📦 Standard Bulk Items: $45/item\n• Furniture (couches, chairs, tables)\n• Small appliances\n• Exercise equipment\n• Electronics\n\n🏠 Large Items: $75-$99/item\n• Mattresses & box springs\n• Large appliances\n• Heavy furniture sets\n\n⭐ Service Levels:\n• Premium: 1x/month large item pickup\n• Comprehensive: Bi-weekly pickup\n• Premiere: Weekly large item pickup\n\n📱 How to Request:\n1. Log into customer dashboard\n2. Go to 'Bulk Item Request'\n3. Add items & submit\n4. We'll contact you within 24 hours\n\nPremiere members get priority scheduling!";
    }
    
    // Subscription related queries - Enhanced
    else if (lowerCaseMessage.includes("subscription") || lowerCaseMessage.includes("plan") || lowerCaseMessage.includes("sign up") || lowerCaseMessage.includes("register") || lowerCaseMessage.includes("tier")) {
      return "Welcome to Can2Curb! Here's how to get started:\n\n🎯 Choose Your Plan:\n• Single-Family: 5 tiers from $24.99-$169.99/mo\n• Multi-Family: $9.99-$32.99 per unit/month\n• Business: Custom solutions available\n\n✨ New Customer Benefits:\n• Flexible month-to-month contracts\n• No setup fees\n• First pickup within 48 hours\n• 30-day satisfaction guarantee\n\n📝 Sign Up Process:\n1. Visit our Subscription page\n2. Select your property type\n3. Choose your service tier\n4. Complete secure checkout\n5. Schedule your first pickup\n\n💡 Not sure which plan? Our chatbot can help guide you, or contact us for a personalized consultation!";
    }
    
    // Account management queries - Enhanced
    else if (lowerCaseMessage.includes("cancel") || lowerCaseMessage.includes("stop service") || lowerCaseMessage.includes("change service") || lowerCaseMessage.includes("pause")) {
      return "Can2Curb Account Management:\n\n📊 Modify Your Service:\n• Log into your customer dashboard\n• No long-term contracts required\n• Month-to-month flexibility\n\n⚠️ Service Changes:\n• Upgrade: Effective immediately\n• Downgrade: 7-day notice required\n• Pause service: Available for up to 2 months\n• Cancellation: 7-day notice, no fees\n\n💳 Billing Adjustments:\n• Pro-rated for mid-month changes\n• Credits applied automatically\n• Refunds processed within 5-7 business days\n\n📞 Need Help?\n• Online: Customer dashboard\n• Email: support@can2curb.com\n• Phone: 1-800-555-1234\n\nWe're here to make changes easy!";
    }
    
    // Contact information queries - Enhanced
    else if (lowerCaseMessage.includes("contact") || lowerCaseMessage.includes("phone") || lowerCaseMessage.includes("email") || lowerCaseMessage.includes("reach") || lowerCaseMessage.includes("support")) {
      return "📞 Contact Can2Curb:\n\n🏢 Customer Service:\n• Phone: 1-800-555-1234\n• Hours: Mon-Fri 8 AM - 6 PM, Sat 9 AM - 2 PM\n• Email: support@can2curb.com\n• Response time: Within 24 hours\n\n🚨 Emergency Hotline:\n• Available 24/7: 1-800-555-9876\n• For spills, hazmat incidents, urgent issues\n\n💻 Online Support:\n• Customer Dashboard: Manage account\n• Live Chat: Available during business hours\n• Help Center: Comprehensive guides\n\n📧 Specialized Departments:\n• Billing: billing@can2curb.com\n• Business Services: commercial@can2curb.com\n• Premiere Support: PRESERVE_Premiere_EMAIL\n\nWe're here to help!";
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
      return "Can2Curb Multi-Family Solutions:\n\n🏢 Service Tiers (Per Unit/Month):\n• Basic: $9.99 - 1x/week concierge\n• Standard: $12.99 - Weekly + dumpster cleaning\n• Premium: $18.99 - 2x/week + area cleanup\n• Comprehensive: $24.99 - 3x/week + hallway cleaning\n• Premiere: $32.99 - Daily service + full amenities\n\n✨ Property Services Include:\n• Dumpster management & cleaning\n• Common area cleanup\n• Graffiti removal (Premium+)\n• Hallway/stair sweeping (Comprehensive+)\n\n💼 Property Manager Benefits:\n• Dedicated account representative\n• Online portal for all units\n• Consolidated billing\n• Resident satisfaction reports\n• Volume discounts available\n\n📊 Perfect For:\n• Apartment complexes\n• Condos & townhomes\n• HOA communities\n• Student housing\n\nContact us for custom property solutions!";
    }
    
    // Premiere membership queries - New
    else if (lowerCaseMessage.includes("elite") || lowerCaseMessage.includes("premium service") || lowerCaseMessage.includes("vip")) {
      return "Can2Curb Premiere Membership - The Ultimate Service:\n\n👑 Premiere Benefits:\n\n🏠 Single-Family Premiere ($169.99/mo):\n• All Comprehensive services included\n• 3 trash cans + 1 recycle can\n• Weekly can cleaning & deodorizing\n• Weekly hazardous pickup\n• Weekly large item pickup\n• Yard waste pickup (extra for large yards)\n• Weekly trash area cleaning\n• Priority same-day service\n• Dedicated account manager\n• 24/7 priority support line\n\n🏢 Multi-Family Premiere ($32.99/unit/mo):\n• Daily door-to-door concierge\n• Daily trash area cleanup\n• Weekly large item pickup\n• Complete hallway & stair service\n• Wall & common area cleaning\n• Priority emergency response\n• Property manager dashboard\n\n⚡ Exclusive Premiere Perks:\n• Zero wait times\n• Guaranteed same-day callbacks\n• Complimentary quarterly deep cleans\n• First access to new services\n• Special event support\n• Holiday service guarantee\n\nExperience the Can2Curb difference - upgrade to Premiere today!";
    }
    
    // Business services - Enhanced
    else if (lowerCaseMessage.includes("business") || lowerCaseMessage.includes("commercial") || lowerCaseMessage.includes("restaurant") || lowerCaseMessage.includes("office")) {
      return "Can2Curb Business & Commercial Services:\n\n🍽️ Restaurant Services:\n• Grease Hood Cleaning: $249-$399\n• Daily waste management\n• Grease trap maintenance\n• Health inspection prep\n• Back-of-house cleaning\n\n🏪 Retail & Office:\n• Cardboard/recycling: $79-$99/mo\n• Daily or weekly service\n• After-hours pickup available\n• Confidential document destruction\n\n🧼 Facility Services:\n• Pressure Washing:\n  - Small lots (<10k sqft): $399\n  - Medium (10-50k): $699\n  - Large (50k+): $999+\n• Drive-thru cleaning: $249\n• Building exterior washing: $499+\n\n💼 Business Advantages:\n• Flexible scheduling\n• Volume discounts\n• Monthly billing\n• Tax-deductible service\n• EPA compliance support\n• COI certificates provided\n\n📞 Get a custom quote: commercial@can2curb.com";
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
