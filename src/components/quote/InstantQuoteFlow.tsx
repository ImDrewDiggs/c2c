import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, MapPin, Calendar, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Mirrors the server-side ladder so the user sees the same price.
// Server is authoritative — this is for display only.
const PRICE_LADDER: Record<number, { tier: string; price: number }> = {
  1: { tier: "Basic", price: 24.99 },
  2: { tier: "Standard", price: 49.99 },
  3: { tier: "Premium", price: 79.99 },
  4: { tier: "Comprehensive", price: 119.99 },
  5: { tier: "Elite", price: 169.99 },
};

const ZIP_DAYS: Record<string, string> = {
  "45202": "monday", "45203": "monday", "45204": "tuesday", "45205": "tuesday",
  "45206": "wednesday", "45207": "wednesday", "45208": "thursday", "45209": "thursday",
  "45211": "friday", "45212": "friday", "45213": "monday", "45214": "tuesday",
  "45215": "wednesday", "45216": "thursday", "45217": "friday", "45218": "monday",
  "45219": "tuesday", "45220": "wednesday", "45223": "thursday", "45224": "friday",
  "45225": "monday", "45226": "tuesday", "45227": "wednesday", "45229": "thursday",
  "45230": "friday", "45231": "monday", "45232": "tuesday", "45233": "wednesday",
  "45236": "thursday", "45237": "friday", "45238": "monday", "45239": "tuesday",
  "45240": "wednesday", "45241": "thursday", "45242": "friday", "45243": "monday",
  "45244": "tuesday", "45245": "wednesday", "45246": "thursday", "45247": "friday",
  "45248": "monday", "45249": "tuesday", "45251": "wednesday", "45252": "thursday",
  "45255": "friday",
};

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;

const priceFor = (cans: number, recycle: boolean) => {
  const effective = Math.max(1, Math.min(5, (recycle ? cans + 1 : cans)));
  return PRICE_LADDER[effective];
};

type Step = 0 | 1 | 2 | 3;

export default function InstantQuoteFlow() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(0);
  const [submitting, setSubmitting] = useState(false);

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("OH");
  const [zip, setZip] = useState("");
  const [trashDay, setTrashDay] = useState<string>("");
  const [cans, setCans] = useState<number>(1);
  const [recycle, setRecycle] = useState(false);
  const [email, setEmail] = useState("");

  const detectedDay = useMemo(() => (zip.length === 5 ? ZIP_DAYS[zip] || "" : ""), [zip]);
  const { tier, price } = priceFor(cans, recycle);

  const stepValid = useMemo(() => {
    if (step === 0) return address.trim().length > 4 && city.trim().length > 1 && /^\d{5}$/.test(zip);
    if (step === 1) return DAYS.includes((trashDay || detectedDay) as typeof DAYS[number]);
    if (step === 2) return cans >= 1 && cans <= 5;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [step, address, city, zip, trashDay, detectedDay, cans, email]);

  const next = () => {
    if (!stepValid) return;
    if (step === 1 && !trashDay) setTrashDay(detectedDay);
    setStep((s) => (Math.min(3, s + 1) as Step));
  };
  const back = () => setStep((s) => (Math.max(0, s - 1) as Step));

  const submit = async () => {
    if (submitting || !stepValid) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("instant-quote-checkout", {
        body: {
          address: address.trim(),
          city: city.trim(),
          state: state.trim().toUpperCase(),
          zip: zip.trim(),
          email: email.trim().toLowerCase(),
          trashDay: (trashDay || detectedDay).toLowerCase(),
          cans,
          recycle,
        },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("Checkout unavailable");
      window.location.assign(data.url);
    } catch (e: any) {
      console.error("quote checkout error:", e);
      toast({
        variant: "destructive",
        title: "Couldn't start checkout",
        description: "Please verify your details and try again.",
      });
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur shadow-xl max-w-2xl mx-auto w-full">
      <CardContent className="p-6 md:p-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6" aria-label="Quote progress">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            {step === 0 && (
              <>
                <div className="flex items-center gap-2 text-primary">
                  <MapPin className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Where do you need service?</h2>
                </div>
                <p className="text-sm text-muted-foreground">Greater Cincinnati only.</p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="q-addr">Street address</Label>
                    <Input id="q-addr" autoComplete="street-address" value={address}
                      onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Label htmlFor="q-city">City</Label>
                      <Input id="q-city" autoComplete="address-level2" value={city}
                        onChange={(e) => setCity(e.target.value)} placeholder="Cincinnati" />
                    </div>
                    <div>
                      <Label htmlFor="q-zip">ZIP</Label>
                      <Input id="q-zip" inputMode="numeric" maxLength={5} value={zip}
                        onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                        placeholder="45202" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="flex items-center gap-2 text-primary">
                  <Calendar className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">When is your trash day?</h2>
                </div>
                {detectedDay && !trashDay && (
                  <p className="text-sm text-muted-foreground">
                    We think it's <span className="text-primary font-medium capitalize">{detectedDay}</span> for {zip}. Confirm or pick another.
                  </p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {DAYS.map((d) => {
                    const active = (trashDay || detectedDay) === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setTrashDay(d)}
                        className={`px-3 py-2 rounded-md border text-sm capitalize transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:border-primary/60"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex items-center gap-2 text-primary">
                  <Trash2 className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">How many cans?</h2>
                </div>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCans(n)}
                      className={`w-12 h-12 rounded-md border font-semibold transition-colors ${
                        cans === n
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:border-primary/60"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <Checkbox checked={recycle} onCheckedChange={(v) => setRecycle(!!v)} />
                  <span className="text-sm">Add recycle bin pickup (+$ tier bump)</span>
                </label>

                <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Your plan</div>
                      <div className="text-lg font-semibold text-primary">{tier}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">${price.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">/month</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Confirm and pay</h2>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="text-right">{address}, {city}, {state} {zip}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Trash day</span><span className="capitalize">{trashDay || detectedDay}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cans</span><span>{cans}{recycle ? " + recycle" : ""}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="text-primary font-medium">{tier}</span></div>
                  <div className="flex justify-between border-t border-border pt-2 mt-2"><span className="font-semibold">Monthly total</span><span className="font-bold">${price.toFixed(2)}</span></div>
                </div>
                <div className="pt-2">
                  <Label htmlFor="q-email">Email for receipts & dashboard access</Label>
                  <Input id="q-email" type="email" autoComplete="email" value={email}
                    onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={back} disabled={step === 0 || submitting}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {step < 3 ? (
            <Button type="button" onClick={next} disabled={!stepValid}>
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={!stepValid || submitting} className="min-w-[160px]">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Pay ${price.toFixed(2)}/mo</>}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}