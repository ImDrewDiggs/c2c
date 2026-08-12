import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface LocationPayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
}

function isValidCoordinate(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization") || "",
        },
      },
    },
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: "Authentication required" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let payload: LocationPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!isValidCoordinate(payload.latitude) || !isValidCoordinate(payload.longitude)) {
    return new Response(
      JSON.stringify({ error: "Invalid coordinates" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const latitude = Math.round(payload.latitude * 1_000_000) / 1_000_000;
  const longitude = Math.round(payload.longitude * 1_000_000) / 1_000_000;

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return new Response(
      JSON.stringify({ error: "Coordinates out of range" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("employee_locations")
    .upsert(
      {
        employee_id: user.id,
        latitude,
        longitude,
        timestamp: payload.timestamp || now,
        is_online: true,
        last_seen_at: now,
      },
      { onConflict: "employee_id", ignoreDuplicates: false },
    );

  if (error) {
    console.error("Failed to record location:", error);
    return new Response(
      JSON.stringify({ error: "Unable to save location" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
