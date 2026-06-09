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
  avatar_url: string | null;
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
    avatar_url: null,
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
    avatar_url: null,
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
    avatar_url: null,
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
    avatar_url: null,
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
    avatar_url: null,
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
  { id: "c13", name: "Muslim Academia", icon: "AC", member_count: 1120, description: "Researchers and lecturers", is_private: false },
  { id: "c14", name: "Muslim Engineering", icon: "EN", member_count: 2050, description: "Civil, mechanical, electrical, and software engineers", is_private: false },
  { id: "c15", name: "Halal Food & Hospitality", icon: "FH", member_count: 1640, description: "Restaurants, catering, travel, and hotels", is_private: false },
  { id: "c16", name: "Muslim Real Estate", icon: "RE", member_count: 1180, description: "Property, housing, and ethical development", is_private: false },
  { id: "c17", name: "Islamic Art & Design", icon: "AD", member_count: 940, description: "Artists, designers, calligraphers, and makers", is_private: false },
  { id: "c18", name: "Muslim Mental Health Professionals", icon: "MH", member_count: 860, description: "Therapists, counsellors, and wellbeing practitioners", is_private: true },
  { id: "c19", name: "Muslimas in STEM", icon: "MS", member_count: 1750, description: "Women in science, technology, engineering, and math", is_private: true },
  { id: "c20", name: "Muslim Sports Professionals", icon: "SP", member_count: 630, description: "Athletes, coaches, trainers, and sports operators", is_private: false },
  { id: "c21", name: "Muslim Product Managers", icon: "PM", member_count: 1420, description: "Product thinkers and operators", is_private: false },
  { id: "c22", name: "Muslim Data Professionals", icon: "DA", member_count: 1210, description: "Analysts, scientists, and AI builders", is_private: false },
  { id: "c23", name: "Muslim Cybersecurity", icon: "CS", member_count: 780, description: "Security engineers and governance specialists", is_private: false },
  { id: "c24", name: "Muslim Founders", icon: "MF", member_count: 2210, description: "Startup founders and indie builders", is_private: true },
  { id: "c25", name: "Muslim Investors", icon: "MI", member_count: 970, description: "Angels, VCs, and ethical capital allocators", is_private: true },
  { id: "c26", name: "Islamic Banking", icon: "IB", member_count: 830, description: "Banking, compliance, and shariah products", is_private: false },
  { id: "c27", name: "Muslim Public Sector", icon: "PS", member_count: 760, description: "Civil servants and policy operators", is_private: false },
  { id: "c28", name: "Muslim HR & People Ops", icon: "HR", member_count: 690, description: "Recruiters and people leaders", is_private: false },
  { id: "c29", name: "Muslim Sales Professionals", icon: "SA", member_count: 870, description: "Sales, partnerships, and business development", is_private: false },
  { id: "c30", name: "Muslim Marketing", icon: "MK", member_count: 1280, description: "Growth, brand, content, and performance marketing", is_private: false },
  { id: "c31", name: "Muslim Writers", icon: "WR", member_count: 920, description: "Authors, editors, and content strategists", is_private: false },
  { id: "c32", name: "Muslim Film & Photography", icon: "FP", member_count: 810, description: "Visual storytellers and production teams", is_private: false },
  { id: "c33", name: "Muslim Pharmacists", icon: "PH", member_count: 640, description: "Pharmacy and medicine safety professionals", is_private: false },
  { id: "c34", name: "Muslim Nurses", icon: "NU", member_count: 1050, description: "Nursing professionals and care leaders", is_private: false },
  { id: "c35", name: "Muslim Doctors", icon: "DR", member_count: 1340, description: "Physicians, specialists, and residents", is_private: true },
  { id: "c36", name: "Muslim Accountants", icon: "AC", member_count: 990, description: "Accounting, audit, and ethical finance operations", is_private: false },
  { id: "c37", name: "Muslim Project Managers", icon: "PJ", member_count: 1110, description: "Delivery, PMO, and operations leaders", is_private: false },
  { id: "c38", name: "Muslim UX Researchers", icon: "UX", member_count: 610, description: "Research, service design, and user insight", is_private: false },
  { id: "c39", name: "Muslim Climate Professionals", icon: "CL", member_count: 540, description: "Climate, energy, and sustainability work", is_private: false },
  { id: "c40", name: "Muslim Students & Graduates", icon: "SG", member_count: 2580, description: "Students, NYSC members, and first-job seekers", is_private: false },
  { id: "c41", name: "Muslim Remote Workers", icon: "RW", member_count: 1460, description: "Distributed workers and global contractors", is_private: false },
  { id: "c42", name: "Muslim Customer Success", icon: "CS", member_count: 700, description: "Support, success, and account management", is_private: false },
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
    salary_range: "₦800k-₦1.2m/mo",
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
    salary_range: "₦500k-₦700k/mo",
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
    salary_range: "₦1.2m-₦1.8m/mo",
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
    salary_range: "₦700k-₦1m/mo",
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
