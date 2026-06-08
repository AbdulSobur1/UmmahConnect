interface UserRow {
  id: string;
  industry: string | null;
  careerStage: string | null;
  city: string | null;
  country: string;
  plan: string;
}

interface MentorshipProfileRow {
  userId: string;
  role: string | null;
  industries: string[] | null;
  languages: string[] | null;
  valuesTags: string[] | null;
  careerStage: string | null;
  bio: string | null;
  yearsExperience: number | null;
  users?: { city?: string | null; country?: string } | null;
}

interface EventListingRow {
  id: string;
  sponsorId: string | null;
  title: string;
  eventDate: string | null;
  locationType: string | null;
  locationDetail: string | null;
  isActive: boolean;
  viewsCount: number | null;
  clicksCount: number | null;
}

export function mondayWeekStart(date = new Date()) {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = copy.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setUTCDate(copy.getUTCDate() + diff);
  return copy.toISOString().slice(0, 10);
}

export function isPro(profile: Pick<UserRow, 'plan'>) {
  return profile.plan === 'pro';
}

const careerStages = ['Student', 'Early Career', 'Mid-Level', 'Senior', 'Executive', 'Entrepreneur'];

export function scoreMentor(user: UserRow, mentor: MentorshipProfileRow & { users?: UserRow | null }) {
  const mentorUser = mentor.users;
  const industryScore = mentor.industries?.includes(user.industry ?? '') ? 40 : 0;
  const userStageIndex = careerStages.indexOf(user.careerStage ?? '');
  const mentorStageIndex = careerStages.indexOf(mentor.careerStage ?? '');
  const stageDistance = Math.abs(userStageIndex - mentorStageIndex);
  const careerScore = userStageIndex === -1 || mentorStageIndex === -1 ? 0 : stageDistance === 0 ? 25 : stageDistance === 1 ? 15 : 0;
  const userLanguages = ['English'];
  const mentorLanguages = mentor.languages ?? [];
  const overlap = mentorLanguages.filter((language) => userLanguages.includes(language)).length;
  const locationScore = mentorUser?.city === user.city ? 20 : mentorUser?.country === user.country ? 10 : 0;
  const languageScore = mentorLanguages.length > 0 ? Math.round((overlap / mentorLanguages.length) * 15) : 0;
  return industryScore + careerScore + languageScore + locationScore;
}

export function mapEventForFrontend(event: EventListingRow) {
  return {
    id: event.id,
    sponsor_id: event.sponsorId ?? '',
    title: event.title,
    event_date: event.eventDate ?? '',
    location_type: event.locationType ?? '',
    location_detail: event.locationDetail ?? '',
    is_active: Boolean(event.isActive),
    views_count: event.viewsCount ?? 0,
    clicks_count: event.clicksCount ?? 0,
  };
}
