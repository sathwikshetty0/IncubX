import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TEST_USERS = [
  { email: "admin@incubx.test", password: "Test1234!", fullName: "Admin User", role: "admin" },
  { email: "ceo@incubx.test", password: "Test1234!", fullName: "CEO User", role: "ceo" },
  { email: "incharge@incubx.test", password: "Test1234!", fullName: "Program Incharge", role: "program_incharge" },
  { email: "finance@incubx.test", password: "Test1234!", fullName: "Finance User", role: "finance_id" },
  { email: "mentor@incubx.test", password: "Test1234!", fullName: "Primary Mentor", role: "primary_mentor" },
  { email: "teamlead@incubx.test", password: "Test1234!", fullName: "Team Lead", role: "team_lead" },
  { email: "alumni@incubx.test", password: "Test1234!", fullName: "Alumni User", role: "alumni" },
  { email: "investor@incubx.test", password: "Test1234!", fullName: "Investor User", role: "investor" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get or create org
    const { data: orgs } = await supabaseAdmin.from("organizations").select("id").limit(1);
    let orgId: string;
    if (orgs && orgs.length > 0) {
      orgId = orgs[0].id;
    } else {
      const { data: newOrg } = await supabaseAdmin.from("organizations").insert({ name: "Demo Incubation Center" }).select("id").single();
      orgId = newOrg!.id;
    }

    const results: any[] = [];

    for (const u of TEST_USERS) {
      // Check if user already exists
      const { data: existingProfiles } = await supabaseAdmin
        .from("profiles")
        .select("user_id")
        .eq("email", u.email)
        .limit(1);

      if (existingProfiles && existingProfiles.length > 0) {
        results.push({ email: u.email, status: "already_exists" });
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.fullName },
      });

      if (authError) {
        results.push({ email: u.email, status: "auth_error", error: authError.message });
        continue;
      }

      const userId = authData.user.id;

      // Update profile with org_id and mark onboarding complete
      await supabaseAdmin.from("profiles").update({
        org_id: orgId,
        full_name: u.fullName,
        disc_completed: true,
        profile_completed: true,
        disc_type: "D",
        disc_d: 80, disc_i: 60, disc_s: 40, disc_c: 50,
      }).eq("user_id", userId);

      // Assign role
      await supabaseAdmin.from("user_roles").insert({
        user_id: userId,
        role: u.role,
      });

      // For team_lead, also add to a team
      if (u.role === "team_lead") {
        const { data: teams } = await supabaseAdmin.from("teams").select("id").eq("org_id", orgId).limit(1);
        if (teams && teams.length > 0) {
          await supabaseAdmin.from("team_members").insert({
            user_id: userId,
            team_id: teams[0].id,
            role_in_team: "lead",
          });
        }
      }

      // For mentor, assign to a team
      if (u.role === "primary_mentor") {
        const { data: teams } = await supabaseAdmin.from("teams").select("id").eq("org_id", orgId).limit(1);
        if (teams && teams.length > 0) {
          await supabaseAdmin.from("mentor_assignments").insert({
            mentor_id: userId,
            team_id: teams[0].id,
          });
        }
      }

      results.push({ email: u.email, status: "created", role: u.role });
    }

    return new Response(JSON.stringify({ success: true, orgId, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
