import type { EventListingRow, MentorshipProfileRow, UserRow } from "@/lib/supabase/types";

export function mondayWeekStart(date = new Date()) {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = copy.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setUTCDate(copy.getUTCDate() + diff);
  return copy.toISOString().slice(0, 10);
}

export function isPro(profile: Pick<UserRow, "plan">) {
  return profile.plan === "pro";
}

const careerStages = ["Student", "Early Career", "Mid-Level", "Senior", "Executive", "Entrepreneur"];

export function scoreMentor(user: UserRow, mentor: MentorshipProfileRow & { users?: UserRow | null }) {
  const mentorUser = mentor.users;
  const industryScore = mentor.industries?.includes(user.industry ?? "") ? 40 : 0;
  const userStageIndex = careerStages.indexOf(user.career_stage ?? "");
  const mentorStageIndex = careerStages.indexOf(mentor.career_stage ?? "");
  const stageDistance = Math.abs(userStageIndex - mentorStageIndex);
  const careerScore = userStageIndex === -1 || mentorStageIndex === -1 ? 0 : stageDistance === 0 ? 25 : stageDistance === 1 ? 15 : 0;
  const userLanguages = ["English"];
  const mentorLanguages = mentor.languages ?? [];
  const overlap = mentorLanguages.filter((language) => userLanguages.includes(language)).length;
  const locationScore = mentorUser?.city === user.city ? 20 : mentorUser?.country === user.country ? 10 : 0;
  const languageScore = mentorLanguages.length > 0 ? Math.round((overlap / mentorLanguages.length) * 15) : 0;
  return industryScore + careerScore + languageScore + locationScore;
}

export function mapEventForFrontend(event: EventListingRow) {
  return {
    id: event.id,
    sponsor_id: event.sponsor_id ?? "",
    title: event.title,
    event_date: event.event_date ?? "",
    location_type: event.location_type ?? "",
    location_detail: event.location_detail ?? "",
    is_active: Boolean(event.is_active),
    views_count: event.views_count ?? 0,
    clicks_count: event.clicks_count ?? 0,
  };
}
