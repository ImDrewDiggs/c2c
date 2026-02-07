import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AssignmentRow {
  id: string;
  house_id: string;
  employee_id: string;
  status: string;
  assigned_date: string;
  completed_at: string | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth check – caller must be admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin role
    const { data: roleData } = await userClient.rpc("is_admin_user");
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse params
    const body = await req.json().catch(() => ({}));
    const now = new Date();
    // Default: previous month
    let targetMonth: Date;
    if (body.month) {
      targetMonth = new Date(body.month + "-01");
    } else {
      targetMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }
    const monthStr = targetMonth.toISOString().slice(0, 10); // YYYY-MM-DD
    const nextMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 1);
    const nextMonthStr = nextMonth.toISOString().slice(0, 10);

    // Optional: single house
    const houseIdFilter: string | null = body.house_id || null;

    // Use service role for data aggregation
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Fetch houses
    let housesQuery = admin.from("houses").select("id, address");
    if (houseIdFilter) {
      housesQuery = housesQuery.eq("id", houseIdFilter);
    }
    const { data: houses, error: hErr } = await housesQuery;
    if (hErr) throw hErr;
    if (!houses || houses.length === 0) {
      return new Response(JSON.stringify({ generated: 0, message: "No locations found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch assignments for the target month
    const { data: assignments, error: aErr } = await admin
      .from("assignments")
      .select("id, house_id, employee_id, status, assigned_date, completed_at, created_at, profiles!assignments_employee_id_fkey(full_name)")
      .gte("assigned_date", monthStr)
      .lt("assigned_date", nextMonthStr) as { data: AssignmentRow[] | null; error: unknown };
    if (aErr) throw aErr;

    const allAssignments = (assignments || []) as AssignmentRow[];
    console.log(`Processing ${houses.length} houses, ${allAssignments.length} assignments for ${monthStr}`);

    const reports: unknown[] = [];

    for (const house of houses) {
      const houseAssignments = allAssignments.filter((a) => a.house_id === house.id);
      const total = houseAssignments.length;
      const completed = houseAssignments.filter((a) => a.status === "completed").length;
      const missed = houseAssignments.filter((a) => a.status === "missed" || a.status === "cancelled").length;
      // Late: completed but completed_at > assigned_date + 1 day (rough heuristic)
      const late = houseAssignments.filter((a) => {
        if (a.status !== "completed" || !a.completed_at) return false;
        const assignedEnd = new Date(a.assigned_date);
        assignedEnd.setDate(assignedEnd.getDate() + 1);
        return new Date(a.completed_at) > assignedEnd;
      }).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 10000) / 100 : 0;

      // Employee performance
      const empMap = new Map<string, { name: string; completed: number; totalMinutes: number }>();
      for (const a of houseAssignments) {
        const eid = a.employee_id;
        if (!empMap.has(eid)) {
          const name = (a.profiles as { full_name: string | null } | null)?.full_name || "Unknown";
          empMap.set(eid, { name, completed: 0, totalMinutes: 0 });
        }
        const emp = empMap.get(eid)!;
        if (a.status === "completed" && a.completed_at) {
          emp.completed++;
          const mins = (new Date(a.completed_at).getTime() - new Date(a.assigned_date).getTime()) / 60000;
          if (mins > 0 && mins < 14400) emp.totalMinutes += mins; // cap at 10 days
        }
      }
      const employeesAssigned = Array.from(empMap.entries()).map(([eid, e]) => ({
        employee_id: eid,
        name: e.name,
        pickups_completed: e.completed,
        avg_time_minutes: e.completed > 0 ? Math.round(e.totalMinutes / e.completed) : 0,
      }));

      // Issues
      const issues = houseAssignments
        .filter((a) => a.status === "missed" || a.status === "cancelled")
        .map((a) => ({
          date: a.assigned_date,
          type: a.status,
          description: `Pickup ${a.status} on ${a.assigned_date}`,
        }));

      // Overall score: start at 100, deduct for missed/late
      const deductions = missed * 15 + late * 5;
      const overallScore = Math.max(0, Math.min(100, 100 - deductions));

      const report = {
        house_id: house.id,
        report_month: monthStr,
        total_scheduled_pickups: total,
        completed_pickups: completed,
        late_pickups: late,
        missed_pickups: missed,
        completion_rate: completionRate,
        employees_assigned: employeesAssigned,
        issues,
        overall_score: overallScore,
        generated_at: new Date().toISOString(),
      };

      // Upsert
      const { error: uErr } = await admin
        .from("service_integrity_reports")
        .upsert(report, { onConflict: "house_id,report_month" });
      if (uErr) {
        console.error(`Error upserting report for house ${house.id}:`, uErr);
      } else {
        reports.push({ house_id: house.id, address: house.address, score: overallScore });
      }
    }

    console.log(`Generated ${reports.length} reports for ${monthStr}`);

    return new Response(
      JSON.stringify({ generated: reports.length, month: monthStr, reports }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Report generation error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
