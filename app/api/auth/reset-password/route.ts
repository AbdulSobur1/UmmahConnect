import { NextRequest } from "next/server";
import { withHandler, parseBody, ok } from "@/lib/api/helpers";
import { passwordResetSchema } from "@/lib/validation";

export const POST = withHandler(async (req: NextRequest) => {
  const body = await parseBody(req, passwordResetSchema);

  // Clerk handles password reset through its own flow
  // This endpoint is kept for backward compatibility

  return ok({ sent: true });
});
