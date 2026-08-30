import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, MapPin, Calendar, Trash2, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  QUOTE_PLANS,
  MAX_CANS,
  calculateQuotePrice,
  type QuotePlanId,
  type QuotePriceBreakdown,
} from "@/lib/quotePricing";

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

type Step = 0 | 1 | 2 | 3 | 4;
const LAST_STEP: Step = 4;

function PriceBreakdownCard({ breakdown }: { breakdown: QuotePriceBreakdown }) {
  const { plan, extraCans, extraCansCost, recycleCost, total } = breakdown;
  const showsIncludedRecycle = plan.recycleIncluded && recycleCost === 0;
  return (
    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{plan.name} base</span>
        <span>${plan.basePrice.toFixed(2)}</span>
      </div>
      {extraCans > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {extraCans} extra can{extraCans > 1 ? "s" : ""} × ${plan.extraCanPrice.toFixed(2)}
          </span>
          <span>${extraCansCost.toFixed(2)}</span>
        </div>
      )}
      {recycleCost > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Recycle bin</span>
          <span>${recycleCost.toFixed(2)}</span>
        </div>
      )}
      {showsIncludedRecycle && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Recycle bin</span>
          <span className="text-primary">Included</span>
        </div>
      )}
      <div className="flex items-baseline justify-between border-t border-primary/30 pt-2 mt-2">
        <span className="font-semibold">Monthly total</span>
        <span className="text-2xl font-bold">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default function InstantQuoteFlow() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(0);
  const [submitting, setSubmitting] = useState(false);

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("OH");
  const [zip, setZip] = useState("");
  const [trashDay, setTrashDay] = useState<string>("");
  const [planId, setPlanId] = useState<QuotePlanId>("basic");
  const [cans, setCans] = useState<number>(1);
  const [recycle, setRecycle] = useState(false);
  const [email, setEmail] = useState("");
  const [resumeToken, setResumeToken] = useState<string | null>(null);
  const hydrated = useRef(false);
  const saveTimer = useRef<number | null>(null);

  const detectedDay = useMemo(() => (zip.length === 5 ? ZIP_DAYS[zip] || "" : ""), [zip]);
  const breakdown = useMemo(() => calculateQuotePrice(planId, cans, recycle), [planId, cans, recycle]);
  const plan = breakdown.plan;
  const tier = plan.name;
  const price = breakdown.total;

  // Hydrate from ?resume=TOKEN or localStorage
  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const urlToken = url.searchParams.get("resume");
        const stored = window.localStorage.getItem("quote_resume_token");
        const token = urlToken || stored;
        if (!token) {
          hydrated.current = true;
          return;
        }
        const anySb = supabase as any;
        const base =
          anySb.functionsUrl ||
          `${anySb.supabaseUrl || import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
        const apikey = anySb.supabaseKey || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(`${base}/get-quote?token=${encodeURIComponent(token)}`, {
          headers: { apikey, Authorization: `Bearer ${apikey}` },
        });
        const quote: any = res.ok ? (await res.json()).quote : null;
        if (quote && !quote.converted_at) {
          setResumeToken(quote.resume_token);
          window.localStorage.setItem("quote_resume_token", quote.resume_token);
          if (quote.address) setAddress(quote.address);
          if (quote.city) setCity(quote.city);
          if (quote.state) setState(quote.state);
          if (quote.zip) setZip(quote.zip);
          if (quote.trash_day) setTrashDay(quote.trash_day);
          if (typeof quote.cans === "number") setCans(quote.cans);
          if (typeof quote.plan_id === "string") setPlanId(quote.plan_id as QuotePlanId);
          if (typeof quote.recycle === "boolean") setRecycle(quote.recycle);
          if (quote.email) setEmail(quote.email);
          if (typeof quote.step === "number") setStep(Math.max(0, Math.min(LAST_STEP, quote.step)) as Step);
          if (urlToken) {
            toast({ title: "Welcome back", description: "We loaded where you left off." });
          }
        } else if (quote?.converted_at) {
          window.localStorage.removeItem("quote_resume_token");
        }
      } catch (e) {
        console.warn("quote resume skipped:", e);
      } finally {
        hydrated.current = true;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced save on any change once the user has entered enough to be useful.
  useEffect(() => {
    if (!hydrated.current) return;
    const enough = address.trim().length > 4 || /^\d{5}$/.test(zip) || email.includes("@");
    if (!enough) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      try {
        let referralCode: string | null = null;
        try {
          const url = new URL(window.location.href);
          referralCode = url.searchParams.get("ref") || window.localStorage.getItem("pending_ref");
        } catch {}
        const { data, error } = await supabase.functions.invoke("save-quote", {
          body: {
            resumeToken,
            address, city, state, zip,
            trashDay: trashDay || detectedDay,
            cans, recycle,
            planId,
            email,
            step,
            referralCode,
          },
        });
        if (!error && data?.resumeToken) {
          setResumeToken(data.resumeToken);
          window.localStorage.setItem("quote_resume_token", data.resumeToken);
        }
      } catch (e) {
        console.warn("save-quote skipped:", e);
      }
    }, 800);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [address, city, state, zip, trashDay, detectedDay, cans, recycle, planId, email, step, resumeToken]);

  const stepValid = useMemo(() => {
    if (step === 0) return address.trim().length > 4 && city.trim().length > 1 && /^\d{5}$/.test(zip);
    if (step === 1) return DAYS.includes((trashDay || detectedDay) as typeof DAYS[number]);
    if (step === 2) return QUOTE_PLANS.some((p) => p.id === planId);
    if (step === 3) return cans >= 1 && cans <= MAX_CANS;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [step, address, city, zip, trashDay, detectedDay, planId, cans, email]);

  const next = () => {
    if (!stepValid) return;
    if (step === 1 && !trashDay) setTrashDay(detectedDay);
    setStep((s) => (Math.min(LAST_STEP, s + 1) as Step));
  };
  const back = () => setStep((s) => (Math.max(0, s - 1) as Step));

  const submit = async () => {
    if (submitting || !stepValid) return;
    setSubmitting(true);
    try {
      // Pull a referral code from ?ref= or a previously persisted value
      let referralCode: string | null = null;
      try {
        const url = new URL(window.location.href);
        referralCode = url.searchParams.get("ref") || window.localStorage.getItem("pending_ref");
        if (referralCode) {
          referralCode = referralCode.toUpperCase().trim();
          window.localStorage.setItem("pending_ref", referralCode);
        }
      } catch {}

      const { data, error } = await supabase.functions.invoke("instant-quote-checkout", {
        body: {
          address: address.trim(),
          city: city.trim(),
          state: state.trim().toUpperCase(),
          zip: zip.trim(),
          email: email.trim().toLowerCase(),
          trashDay: (trashDay || detectedDay).toLowerCase(),
          planId,
          cans,
          recycle,
          referralCode,
          resumeToken,
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
          {[0, 1, 2, 3, 4].map((i) => (
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
                  <Sparkles className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Choose your plan</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pick the level of service you want — you'll set your can count next.
                </p>
                <div className="space-y-2">
                  {QUOTE_PLANS.map((p) => {
                    const active = planId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlanId(p.id)}
                        aria-pressed={active}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background hover:border-primary/60"
                        }`}
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <span className={`font-semibold ${active ? "text-primary" : ""}`}>{p.name}</span>
                          <span className="text-sm">
                            <span className="font-bold">${p.basePrice.toFixed(2)}</span>
                            <span className="text-muted-foreground">/mo</span>
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Includes {p.includedCans} can{p.includedCans > 1 ? "s" : ""}
                          {p.recycleIncluded ? " + recycle" : ""} · ${p.extraCanPrice.toFixed(2)}/mo per extra can
                        </div>
                        <ul className="mt-2 space-y-0.5">
                          {p.highlights.map((h) => (
                            <li key={h} className="text-xs text-muted-foreground">• {h}</li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="flex items-center gap-2 text-primary">
                  <Trash2 className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">How many cans do you have?</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your {plan.name} plan includes {plan.includedCans} can{plan.includedCans > 1 ? "s" : ""}. Extra cans are
                  ${plan.extraCanPrice.toFixed(2)}/mo each.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {Array.from({ length: MAX_CANS }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCans(n)}
                      aria-pressed={cans === n}
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
                {!plan.recycleIncluded && (
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <Checkbox checked={recycle} onCheckedChange={(v) => setRecycle(!!v)} />
                    <span className="text-sm">
                      Add recycle bin pickup (+${plan.recycleAddOn.toFixed(2)}/mo)
                    </span>
                  </label>
                )}
                {plan.recycleIncluded && (
                  <p className="text-sm text-muted-foreground pt-1">Recycle bin pickup is included in {plan.name}.</p>
                )}

                <div className="mt-4">
                  <PriceBreakdownCard breakdown={breakdown} />
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Confirm and pay</h2>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="text-right">{address}, {city}, {state} {zip}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Trash day</span><span className="capitalize">{trashDay || detectedDay}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="text-primary font-medium">{tier}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cans</span><span>{cans}{(recycle || plan.recycleIncluded) ? " + recycle" : ""}</span></div>
                  {breakdown.extraCans > 0 && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Extra cans</span><span>+${breakdown.extraCansCost.toFixed(2)}</span></div>
                  )}
                  {breakdown.recycleCost > 0 && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Recycle bin</span><span>+${breakdown.recycleCost.toFixed(2)}</span></div>
                  )}
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
          {step < LAST_STEP ? (
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