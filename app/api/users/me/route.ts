import { requireAuth } from "@/lib/api/auth";
import { userDto } from "@/lib/api/mappers";
import { fail, ok, serverError } from "@/lib/api/response";

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    return ok(userDto(auth.profile));
  } catch {
    return serverError();
  }
}
