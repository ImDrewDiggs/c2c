import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Gift, Share2, Users, Wallet } from "lucide-react";
import { Seo } from "@/components/seo/Seo";

interface Referral {
  id: string;
  referee_email: string | null;
  status: string;
  reward_amount_cents: number;
  created_at: string;
  rewarded_at: string | null;
}

export default function CustomerReferrals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState<string>("");
  const [balanceCents, setBalanceCents] = useState<number>(0);
  const [lifetimeCents, setLifetimeCents] = useState<number>(0);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  const shareLink = code
    ? `${window.location.origin}/customer/register?ref=${code}`
    : "";

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        // Ensure user has a referral code (idempotent)
        const { data: ensuredCode, error: codeErr } = await supabase.rpc("ensure_referral_code", {
          _user_id: user.id,
        });
        if (codeErr) throw codeErr;
        if (!cancelled && typeof ensuredCode === "string") setCode(ensuredCode);

        // Load balance
        const { data: creditRow } = await supabase
          .from("referral_credits")
          .select("balance_cents, lifetime_earned_cents")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!cancelled && creditRow) {
          setBalanceCents(creditRow.balance_cents || 0);
          setLifetimeCents(creditRow.lifetime_earned_cents || 0);
        }

        // Load referrals
        const { data: refRows } = await supabase
          .from("referrals")
          .select("id, referee_email, status, reward_amount_cents, created_at, rewarded_at")
          .eq("referrer_user_id", user.id)
          .order("created_at", { ascending: false });
        if (!cancelled && refRows) setReferrals(refRows as Referral[]);
      } catch (err) {
        console.error("Failed to load referrals:", err);
        toast({
          variant: "destructive",
          title: "Could not load referrals",
          description: "Please try again in a moment.",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, toast]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast({ title: "Link copied", description: "Share it with a friend to give and get $20." });
    } catch {
      toast({ variant: "destructive", title: "Copy failed", description: "Copy the link manually." });
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Get $20 off trash can service with Can2Curb",
          text: "I use Can2Curb for trash concierge in Cincinnati. Use my link for $20 off:",
          url: shareLink,
        });
      } catch {
        // user cancelled — ignore
      }
    } else {
      copyLink();
    }
  };

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      pending: { label: "Pending", variant: "outline" },
      qualified: { label: "Qualified", variant: "secondary" },
      rewarded: { label: "Rewarded", variant: "default" },
      cancelled: { label: "Cancelled", variant: "outline" },
    };
    const cfg = map[status] || { label: status, variant: "outline" as const };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  return (
    <RequireAuth allowedRoles={["customer"]} redirectTo="/customer/login">
      <Seo
        title="Refer a Friend — Give $20, Get $20 | Can2Curb"
        description="Share Can2Curb with a friend in Cincinnati. They get $20 off their first month, you get $20 credit when they subscribe."
        canonical="/customer/referrals"
        robots="noindex"
      />
      <div className="container mx-auto py-10 px-4 md:px-6 space-y-8">
        <div className="flex items-center gap-3">
          <Gift className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Give $20, Get $20</h1>
            <p className="text-muted-foreground">
              Share your link. Friends get $20 off. You get $20 credit when they subscribe.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Available credit
              </CardDescription>
              <CardTitle as="h2" className="text-3xl">{fmt(balanceCents)}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Applied automatically at your next checkout.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Lifetime earned</CardDescription>
              <CardTitle as="h2" className="text-3xl">{fmt(lifetimeCents)}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Total rewards you've received from referrals.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Friends invited
              </CardDescription>
              <CardTitle as="h2" className="text-3xl">{referrals.length}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {referrals.filter((r) => r.status === "rewarded").length} converted to paid customers.
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle as="h2">Your referral link</CardTitle>
            <CardDescription>
              Send this link to friends and neighbors. Rewards post automatically once they sign
              up and complete their first paid service.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input readOnly value={loading ? "Loading…" : shareLink} className="font-mono text-sm" />
              <Button onClick={copyLink} disabled={!code} variant="secondary">
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
              <Button onClick={shareNative} disabled={!code}>
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
            </div>
            {code && (
              <p className="text-sm text-muted-foreground">
                Your code: <span className="font-mono font-semibold">{code}</span>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2">Referral activity</CardTitle>
            <CardDescription>Every friend who signs up with your link.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : referrals.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No referrals yet. Share your link above to get started.
              </p>
            ) : (
              <div className="divide-y">
                {referrals.map((r) => (
                  <div
                    key={r.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div>
                      <p className="font-medium">{r.referee_email || "Friend"}</p>
                      <p className="text-xs text-muted-foreground">
                        Invited {new Date(r.created_at).toLocaleDateString()}
                        {r.rewarded_at &&
                          ` · Rewarded ${new Date(r.rewarded_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{fmt(r.reward_amount_cents)}</span>
                      {statusBadge(r.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}