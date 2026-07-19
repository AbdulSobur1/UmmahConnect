import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api/auth";
import { fail, ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const body = await request.json();
    const status = typeof body?.status === "string" ? body.status : undefined;
    if (status !== "accepted" && status !== "declined")
      return fail("invalid_status", 400);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mentorship_requests")
      .update({ status })
      .eq("id", params.id)
      .select()
      .single();

    if (error) return fail("update_failed", 400);
    return ok(data);
  } catch {
    return serverError();
  }
}
