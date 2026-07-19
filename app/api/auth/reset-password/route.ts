import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withHandler, parseBody, ok } from "@/lib/api/helpers";
import { passwordResetSchema } from "@/lib/validation";

export const POST = withHandler(async (req: NextRequest) => {
  const body = await parseBody(req, passwordResetSchema);

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(body.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/update-password`,
  });

  if (error) {
    throw { status: 400, message: error.message };
  }

  return ok({ sent: true });
});
