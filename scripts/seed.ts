import { createClient } from "@supabase/supabase-js";
import { communities, events, feedPosts, jobs, mentors, notifications, users } from "../src/lib/mock";
import type { Database } from "../src/lib/supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient<Database>(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const password = "SeedUser2026!";

async function main() {
  const userIdByMockId = new Map<string, string>();

  for (const user of users) {
    const { data: authUser, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: user.full_name },
    });
    if (error && !error.message.includes("already")) throw error;

    const id = authUser.user?.id ?? (await supabase.from("users").select("id").eq("email", user.email).single()).data?.id;
    if (!id) throw new Error(`Could not create ${user.email}`);
    userIdByMockId.set(user.id, id);
    await supabase.from("users").upsert({
      id,
      full_name: user.full_name,
      email: user.email,
      industry: user.industry,
      career_stage: user.career_stage,
      country: user.country,
      city: user.city,
      bio: user.bio,
      skills: user.skills,
      plan: user.plan,
      show_photo: user.show_photo,
      open_to_opportunities: user.open_to_opportunities,
    });
  }

  const communityRows = communities.map((community) => ({
    name: community.name,
    icon: community.icon,
    description: community.description,
    is_private: community.is_private,
    member_count: community.member_count,
  }));
  const { data: insertedCommunities } = await supabase.from("communities").insert(communityRows).select("*");
  const communityIdByName = new Map((insertedCommunities ?? []).map((community) => [community.name, community.id]));

  const communityIds = [...communityIdByName.values()];
  for (const userId of userIdByMockId.values()) {
    await supabase.from("community_members").insert(communityIds.slice(0, 3).map((community_id) => ({ community_id, user_id: userId })));
  }

  const yusufId = userIdByMockId.get("u2") ?? "";
  await supabase.from("jobs").insert(jobs.map((job) => ({
    posted_by: yusufId,
    title: job.title,
    company: job.company,
    industry: job.industry,
    location: job.location,
    is_remote: job.is_remote,
    job_type: job.job_type,
    career_stage: job.career_stage,
    salary_range: job.salary_range,
    is_halal_verified: true,
  })));

  const mentorUsers = ["u4", "u2", "u3"];
  await supabase.from("mentorship_profiles").insert(mentors.map((mentor, index) => ({
    user_id: userIdByMockId.get(mentorUsers[index]) ?? "",
    role: "mentor",
    industries: mentor.industries,
    languages: ["English", "Hausa"],
    values_tags: mentor.values_tags,
    career_stage: users[index + 1]?.career_stage ?? "Senior",
    bio: mentor.bio,
    years_experience: index === 0 ? 12 : 7,
  })));

  await supabase.from("event_listings").insert(events.map((event) => ({
    sponsor_id: userIdByMockId.get("u5") ?? "",
    title: event.title,
    description: event.title,
    event_date: event.event_date === "15 July 2026" ? "2026-07-15" : "2026-08-02",
    location_type: event.location_type.toLowerCase(),
    location_detail: event.location_detail,
    is_active: true,
    views_count: event.views_count,
    clicks_count: event.clicks_count,
  })));

  await supabase.from("posts").insert(feedPosts.map((post) => ({
    user_id: userIdByMockId.get(post.user_id) ?? "",
    content: post.content,
    community_id: communityIdByName.get(communities.find((community) => community.id === post.community_id)?.name ?? "") ?? null,
    likes_count: post.likes_count,
    comments_count: post.comments_count,
  })));

  await supabase.from("connections").insert([
    { requester_id: userIdByMockId.get("u2") ?? "", receiver_id: userIdByMockId.get("u1") ?? "", status: "pending" },
    { requester_id: userIdByMockId.get("u1") ?? "", receiver_id: userIdByMockId.get("u3") ?? "", status: "accepted" },
  ]);

  await supabase.from("notifications").insert(notifications.map((notification) => ({
    user_id: userIdByMockId.get("u1") ?? "",
    type: notification.type,
    content: notification.content,
    is_read: notification.is_read,
  })));

  await supabase.from("messages").insert([
    { sender_id: userIdByMockId.get("u2") ?? "", receiver_id: userIdByMockId.get("u1") ?? "", content: "Assalamu alaikum Aisha, loved your note on ethical product work.", is_read: true },
    { sender_id: userIdByMockId.get("u1") ?? "", receiver_id: userIdByMockId.get("u2") ?? "", content: "Wa alaikum salaam Yusuf. Your finance thread helped me connect a few dots too.", is_read: true },
  ]);

  console.log("Seed complete", {
    users: users.length,
    communities: communities.length,
    jobs: jobs.length,
    mentors: mentors.length,
    events: events.length,
    posts: feedPosts.length,
    notifications: notifications.length,
    messages: 2,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
