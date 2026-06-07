export type Plan = "free" | "pro" | "sponsor";

export type User = {
  id: string;
  full_name: string;
  email: string;
  industry: string;
  career_stage: string;
  city: string;
  country: string;
  bio: string;
  skills: string[];
  plan: Plan;
  show_photo: boolean;
  open_to_opportunities: boolean;
  created_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  community_id: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user: User;
};

export type Community = {
  id: string;
  name: string;
  icon: string;
  description: string;
  is_private: boolean;
  member_count: number;
  created_at?: string;
};

export type Job = {
  id: string;
  posted_by: string;
  title: string;
  company: string;
  location: string;
  is_remote: boolean;
  job_type: string;
  industry: string;
  is_halal_verified: boolean;
  career_stage: string;
  salary_range: string;
  created_at: string;
};

export type EventListing = {
  id: string;
  sponsor_id: string;
  title: string;
  event_date: string;
  location_type: string;
  location_detail: string;
  is_active: boolean;
  views_count: number;
  clicks_count: number;
};

export type MentorProfile = {
  user_id: string;
  full_name: string;
  role: string;
  city: string;
  match_score: number;
  industries: string[];
  values_tags: string[];
  bio: string;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export type Conversation = {
  id: string;
  user: User;
  last_message: string;
  last_message_at: string;
  unread_count: number;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  content: string;
  is_read: boolean;
  created_at: string;
  reference_id?: string;
};

export const users: User[] = [
  {
    id: "u1",
    full_name: "Aisha Bello",
    email: "aisha.bello@example.com",
    industry: "Muslim Tech",
    career_stage: "Early Career",
    city: "Lagos",
    country: "Nigeria",
    bio: "Software engineer building useful, ethical products for Nigerian teams.",
    skills: ["React", "TypeScript", "Product Thinking", "Community Building"],
    plan: "free",
    show_photo: true,
    open_to_opportunities: true,
    created_at: "2026-05-01T09:00:00.000Z",
  },
  {
    id: "u2",
    full_name: "Yusuf Adamu",
    email: "yusuf.adamu@example.com",
    industry: "Halal Finance",
    career_stage: "Mid-Level",
    city: "Abuja",
    country: "Nigeria",
    bio: "Product manager focused on ethical financial tools and access.",
    skills: ["Product Strategy", "Fintech", "Research", "Roadmapping"],
    plan: "pro",
    show_photo: true,
    open_to_opportunities: false,
    created_at: "2026-04-22T12:00:00.000Z",
  },
  {
    id: "u3",
    full_name: "Fatima Sule",
    email: "fatima.sule@example.com",
    industry: "Muslim Creatives",
    career_stage: "Early Career",
    city: "Kano",
    country: "Nigeria",
    bio: "UX designer shaping inclusive digital experiences for communities.",
    skills: ["UX Design", "Brand Systems", "User Research", "Figma"],
    plan: "free",
    show_photo: true,
    open_to_opportunities: true,
    created_at: "2026-04-18T16:30:00.000Z",
  },
  {
    id: "u4",
    full_name: "Ibrahim Okafor",
    email: "ibrahim.okafor@example.com",
    industry: "Muslim Healthcare",
    career_stage: "Senior",
    city: "Lagos",
    country: "Nigeria",
    bio: "Healthcare professional mentoring values-led clinical leaders.",
    skills: ["Healthcare Ethics", "Clinical Operations", "Leadership"],
    plan: "pro",
    show_photo: true,
    open_to_opportunities: false,
    created_at: "2026-03-29T08:00:00.000Z",
  },
  {
    id: "u5",
    full_name: "Maryam Danladi",
    email: "maryam.danladi@example.com",
    industry: "Muslim Entrepreneurs",
    career_stage: "Executive",
    city: "Kaduna",
    country: "Nigeria",
    bio: "Entrepreneur helping Muslim-led ventures grow with operational discipline.",
    skills: ["Operations", "Sales", "Partnerships", "Mentorship"],
    plan: "sponsor",
    show_photo: true,
    open_to_opportunities: true,
    created_at: "2026-03-12T10:15:00.000Z",
  },
];

export const currentUser = users[0];

export const communities: Community[] = [
  { id: "c1", name: "Muslim Tech", icon: "MT", member_count: 4200, description: "Engineers, founders, builders", is_private: false },
  { id: "c2", name: "Halal Finance", icon: "HF", member_count: 2800, description: "Ethical money, halal investing", is_private: false },
  { id: "c3", name: "Muslim Creatives", icon: "MC", member_count: 3100, description: "Designers, writers, artists", is_private: false },
  { id: "c4", name: "Muslim Healthcare", icon: "MH", member_count: 1900, description: "Doctors, nurses, researchers", is_private: false },
  { id: "c5", name: "Muslimas in Business", icon: "MB", member_count: 2400, description: "Women leading enterprises", is_private: true },
  { id: "c6", name: "Muslim Entrepreneurs", icon: "ME", member_count: 3600, description: "Founders and makers", is_private: false },
  { id: "c7", name: "Muslim Educators", icon: "ED", member_count: 1500, description: "Teachers and academics", is_private: false },
  { id: "c8", name: "Halal Legal Network", icon: "HL", member_count: 980, description: "Lawyers and legal pros", is_private: true },
  { id: "c9", name: "Muslim Media", icon: "MM", member_count: 1700, description: "Storytellers and journalists", is_private: false },
  { id: "c10", name: "Muslim Architecture", icon: "MA", member_count: 720, description: "Builders of beautiful spaces", is_private: false },
  { id: "c11", name: "Muslim NGO Workers", icon: "NG", member_count: 1300, description: "Service and impact", is_private: false },
  { id: "c12", name: "Islamic Finance Scholars", icon: "IS", member_count: 540, description: "Shariah-compliant finance", is_private: true },
];

export const jobs: Job[] = [
  {
    id: "j1",
    posted_by: "u2",
    title: "Frontend Engineer",
    company: "Cowrywise",
    location: "Lagos",
    is_remote: true,
    job_type: "Remote",
    industry: "Tech",
    is_halal_verified: true,
    career_stage: "Early Career",
    salary_range: "₦600k - ₦900k/month",
    created_at: "2026-05-18T09:00:00.000Z",
  },
  {
    id: "j2",
    posted_by: "u3",
    title: "Brand Designer",
    company: "Sabi",
    location: "Abuja",
    is_remote: false,
    job_type: "On-site",
    industry: "Creative",
    is_halal_verified: true,
    career_stage: "Mid-Level",
    salary_range: "₦450k - ₦650k/month",
    created_at: "2026-05-17T11:00:00.000Z",
  },
  {
    id: "j3",
    posted_by: "u2",
    title: "Product Manager",
    company: "PiggyVest",
    location: "Lagos",
    is_remote: false,
    job_type: "Hybrid",
    industry: "Finance",
    is_halal_verified: true,
    career_stage: "Mid-Level",
    salary_range: "₦850k - ₦1.3m/month",
    created_at: "2026-05-16T14:00:00.000Z",
  },
  {
    id: "j4",
    posted_by: "u1",
    title: "Data Analyst",
    company: "Moniepoint",
    location: "Remote",
    is_remote: true,
    job_type: "Remote",
    industry: "Tech",
    is_halal_verified: true,
    career_stage: "Early Career",
    salary_range: "₦500k - ₦750k/month",
    created_at: "2026-05-15T10:00:00.000Z",
  },
];

export const events: EventListing[] = [
  {
    id: "e1",
    sponsor_id: "u5",
    title: "Lagos Muslim Professionals Meetup",
    event_date: "15 July 2026",
    location_detail: "Lagos",
    location_type: "In-person",
    is_active: true,
    views_count: 1200,
    clicks_count: 184,
  },
  {
    id: "e2",
    sponsor_id: "u5",
    title: "Halal Finance & Investment Summit",
    event_date: "2 August 2026",
    location_detail: "Abuja",
    location_type: "Hybrid",
    is_active: true,
    views_count: 2100,
    clicks_count: 330,
  },
];

export const mentors: MentorProfile[] = [
  {
    user_id: "m1",
    full_name: "Dr. Khadijah Usman",
    role: "Chief Medical Officer",
    city: "Abuja",
    match_score: 97,
    industries: ["Healthcare", "Leadership", "Mid-career"],
    values_tags: ["Ethics", "Service", "Career transitions"],
    bio: "Shared values in healthcare ethics and 12+ years guiding Muslim professionals through career transitions.",
  },
  {
    user_id: "m2",
    full_name: "Ibrahim Al-Amin",
    role: "Tech Lead at Interswitch",
    city: "Lagos",
    match_score: 93,
    industries: ["Tech", "Engineering", "Lagos"],
    values_tags: ["Craft", "Fintech", "Mentorship"],
    bio: "Engineering pathway alignment, mentors early-career Muslim devs navigating Nigerian fintech.",
  },
  {
    user_id: "m3",
    full_name: "Nadia Kamara",
    role: "Creative Director",
    city: "Lagos",
    match_score: 88,
    industries: ["Creative", "Brand", "Lagos"],
    values_tags: ["Storytelling", "Design thinking", "Faith-led brands"],
    bio: "Cross-discipline mentor, with design thinking applied to product and faith-led brand work.",
  },
];

export const feedPosts: Post[] = [
  {
    id: "p1",
    user_id: "u2",
    user: users[1],
    community_id: "c2",
    created_at: "2h ago",
    content:
      "Just closed my first halal investment deal. Alhamdulillah. Here's what I learnt navigating the finance space as a Muslim professional 🧵",
    likes_count: 47,
    comments_count: 12,
  },
  {
    id: "p2",
    user_id: "u3",
    user: users[2],
    community_id: "c3",
    created_at: "5h ago",
    content:
      "Muslim Creatives Lagos meetup this Saturday — who's coming? Drop a 🙋🏾 below. Connecting with people who get it is something else.",
    likes_count: 89,
    comments_count: 34,
  },
  {
    id: "p3",
    user_id: "u4",
    user: users[3],
    community_id: "c4",
    created_at: "1d ago",
    content:
      "Three years in healthcare and I still get asked if my values conflict with my work. They don't — they drive it. 🌙",
    likes_count: 134,
    comments_count: 28,
  },
];

export const notifications: Notification[] = [
  { id: "n1", user_id: "u1", type: "connection", content: "Yusuf Adamu sent you a connection request", created_at: "10m ago", is_read: false, reference_id: "u2" },
  { id: "n2", user_id: "u1", type: "job", content: "New job match: Frontend Engineer at Cowrywise", created_at: "1h ago", is_read: false, reference_id: "j1" },
  { id: "n3", user_id: "u1", type: "like", content: "Ibrahim Okafor liked your post", created_at: "3h ago", is_read: false, reference_id: "p3" },
  { id: "n4", user_id: "u1", type: "sponsored", content: "Sponsored: Halal Finance Summit - Register now", created_at: "1d ago", is_read: true, reference_id: "e2" },
  { id: "n5", user_id: "u1", type: "mentor", content: "Fatima Sule requested mentorship", created_at: "2d ago", is_read: true, reference_id: "u3" },
];

export const conversations: Conversation[] = [
  { id: "c1", user: users[1], last_message: "Brother, that finance thread was useful.", last_message_at: "2m", unread_count: 2 },
  { id: "c2", user: users[2], last_message: "See you at the meetup insha'Allah", last_message_at: "1h", unread_count: 0 },
  { id: "c3", user: users[3], last_message: "Thank you for the kind words.", last_message_at: "4h", unread_count: 1 },
  { id: "c4", user: users[4], last_message: "Let's jump on a call next week", last_message_at: "1d", unread_count: 0 },
];

export const messages: Message[] = [
  { id: "msg1", sender_id: "u2", receiver_id: "u1", content: "Assalamu alaikum Aisha, loved your note on ethical product work.", is_read: true, created_at: "9:12" },
  { id: "msg2", sender_id: "u1", receiver_id: "u2", content: "Wa alaikum salaam Yusuf. Your finance thread helped me connect a few dots too.", is_read: true, created_at: "9:16" },
  { id: "msg3", sender_id: "u2", receiver_id: "u1", content: "Brother, that finance thread was useful.", is_read: false, created_at: "9:18" },
];

const avatarColors = ["#1A6B5C", "#C9A84C", "#132420", "#5ECDB5", "#0D1B1E"];

export function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")).toUpperCase();
}

export function avatarColor(fullName: string) {
  let hash = 0;
  for (let index = 0; index < fullName.length; index += 1) {
    hash = (hash * 31 + fullName.charCodeAt(index)) | 0;
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}
