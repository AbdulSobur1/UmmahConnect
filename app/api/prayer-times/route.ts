import { requireAuth } from "@/lib/api/auth";
import { getNextPrayer } from "@/lib/api/prayer";
import { fail, ok, serverError } from "@/lib/api/response";
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    return ok(await getNextPrayer(auth.profile.city ?? "Lagos"));
  } catch {
    return serverError();
  }
}

