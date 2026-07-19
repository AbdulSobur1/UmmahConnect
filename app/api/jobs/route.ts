import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api/auth";
import { jobDto } from "@/lib/api/mappers";
import { notifyUsersByIndustry } from "@/lib/api/notifications";
import { fail, ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const industry = request.nextUrl.searchParams.get("industry");
    const isRemoteParam = request.nextUrl.searchParams.get("is_remote");
    const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? "1"));
    const limit = Math.min(
      20,
      Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? "20")),
    );

    const supabase = await createClient();
    let query = supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .eq("is_halal_verified", true)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (industry) {
      query = query.eq("industry", industry);
    }
    if (isRemoteParam === "true") {
      query = query.eq("is_remote", true);
    } else if (isRemoteParam === "false") {
      query = query.eq("is_remote", false);
    }

    const { data } = await query;
    return ok((data ?? []).map(jobDto as any));
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    if (auth.plan !== "pro") return fail("pro_required", 403);

    const body = await request.json();
    if (!body.halal_confirmed) return fail("halal_confirmation_required", 400);
    if (!body.title || !body.company) return fail("missing_fields", 400);

    const supabase = await createClient();
    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        posted_by: auth.userId,
        title: body.title,
        company: body.company,
        description: body.description ?? null,
        industry: body.industry ?? null,
        location: body.location ?? null,
        is_remote: body.is_remote ?? false,
        job_type: body.job_type ?? null,
        career_stage: body.career_stage ?? null,
        salary_range: body.salary_range ?? null,
        is_halal_verified: true,
      })
      .select()
      .single();

    if (error || !job) return fail("create_failed", 400);

    if (job.industry) {
      await notifyUsersByIndustry(
        job.industry,
        `New job match: ${job.title} at ${job.company}`,
        job.id,
      );
    }

    return ok(jobDto(job as any), 201);
  } catch {
    return serverError();
  }
}
