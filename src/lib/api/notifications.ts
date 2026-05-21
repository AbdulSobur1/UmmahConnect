import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function notifyUser(input: { userId: string; type: string; content: string; referenceId?: string }) {
  const supabase = createSupabaseServiceClient();
  await supabase.from("notifications").insert({
    user_id: input.userId,
    type: input.type,
    content: input.content,
    reference_id: input.referenceId,
  });
}

export async function notifyUsersByIndustry(industry: string, content: string, referenceId: string) {
  const supabase = createSupabaseServiceClient();
  const { data: users } = await supabase.from("users").select("id").eq("industry", industry);
  if (!users?.length) return;
  await supabase.from("notifications").insert(
    users.map((user) => ({
      user_id: user.id,
      type: "job",
      content,
      reference_id: referenceId,
    })),
  );
}

export async function notifyAllUsers(content: string, referenceId: string) {
  const supabase = createSupabaseServiceClient();
  const { data: users } = await supabase.from("users").select("id");
  if (!users?.length) return;
  await supabase.from("notifications").insert(
    users.map((user) => ({
      user_id: user.id,
      type: "sponsored",
      content,
      reference_id: referenceId,
    })),
  );
}
