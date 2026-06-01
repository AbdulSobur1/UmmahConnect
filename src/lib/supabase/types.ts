export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRow = {
  id: string;
  full_name: string;
  email: string;
  industry: string | null;
  career_stage: string | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  skills: string[] | null;
  plan: "free" | "pro" | "sponsor" | null;
  show_photo: boolean | null;
  open_to_opportunities: boolean | null;
  avatar_url: string | null;
  created_at: string | null;
};

export type CommunityRow = {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  is_private: boolean | null;
  member_count: number | null;
  created_at: string | null;
};

export type PostRow = {
  id: string;
  user_id: string | null;
  content: string;
  community_id: string | null;
  likes_count: number | null;
  comments_count: number | null;
  created_at: string | null;
};

export type CommentRow = {
  id: string;
  post_id: string | null;
  user_id: string | null;
  content: string;
  created_at: string | null;
};

export type MessageRow = {
  id: string;
  sender_id: string | null;
  receiver_id: string | null;
  content: string;
  is_read: boolean | null;
  created_at: string | null;
};

export type JobRow = {
  id: string;
  posted_by: string | null;
  title: string;
  company: string;
  description: string | null;
  industry: string | null;
  location: string | null;
  is_remote: boolean | null;
  job_type: string | null;
  career_stage: string | null;
  salary_range: string | null;
  is_halal_verified: boolean | null;
  is_active: boolean | null;
  created_at: string | null;
};

export type MentorshipProfileRow = {
  user_id: string;
  role: "mentor" | "mentee" | "both" | null;
  industries: string[] | null;
  languages: string[] | null;
  values_tags: string[] | null;
  career_stage: string | null;
  bio: string | null;
  years_experience: number | null;
};

export type EventListingRow = {
  id: string;
  sponsor_id: string | null;
  title: string;
  description: string | null;
  event_date: string | null;
  location_type: string | null;
  location_detail: string | null;
  target_industry: string | null;
  banner_url: string | null;
  is_active: boolean | null;
  views_count: number | null;
  clicks_count: number | null;
  created_at: string | null;
};

export type NotificationRow = {
  id: string;
  user_id: string | null;
  type: string;
  content: string;
  is_read: boolean | null;
  reference_id: string | null;
  created_at: string | null;
};

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      users: Table<UserRow, Partial<UserRow> & Pick<UserRow, "id" | "full_name" | "email">, Partial<UserRow>>;
      communities: Table<CommunityRow, Partial<CommunityRow> & Pick<CommunityRow, "name">, Partial<CommunityRow>>;
      posts: Table<PostRow, Partial<PostRow> & Pick<PostRow, "content">, Partial<PostRow>>;
      post_likes: Table<{ post_id: string; user_id: string }, { post_id: string; user_id: string }, never>;
      comments: Table<CommentRow, Partial<CommentRow> & Pick<CommentRow, "content">, Partial<CommentRow>>;
      community_members: Table<{ community_id: string; user_id: string; joined_at: string | null }, { community_id: string; user_id: string }, never>;
      connections: Table<{ id: string; requester_id: string | null; receiver_id: string | null; status: string | null; created_at: string | null }, { requester_id: string; receiver_id: string; status?: string }, { status?: string }>;
      messages: Table<MessageRow, Partial<MessageRow> & Pick<MessageRow, "sender_id" | "receiver_id" | "content">, Partial<MessageRow>>;
      message_weekly_counts: Table<{ user_id: string; week_start: string; count: number | null }, { user_id: string; week_start: string; count?: number }, { count?: number }>;
      jobs: Table<JobRow, Partial<JobRow> & Pick<JobRow, "posted_by" | "title" | "company">, Partial<JobRow>>;
      mentorship_profiles: Table<MentorshipProfileRow, MentorshipProfileRow, Partial<MentorshipProfileRow>>;
      mentorship_requests: Table<{ id: string; mentee_id: string | null; mentor_id: string | null; status: string | null; message: string | null; created_at: string | null }, { mentee_id: string; mentor_id: string; message?: string }, { status?: string }>;
      event_listings: Table<EventListingRow, Partial<EventListingRow> & Pick<EventListingRow, "sponsor_id" | "title">, Partial<EventListingRow>>;
      notifications: Table<NotificationRow, Partial<NotificationRow> & Pick<NotificationRow, "user_id" | "type" | "content">, Partial<NotificationRow>>;
      subscriptions: Table<{ id: string; user_id: string | null; plan: string; paystack_subscription_code: string | null; paystack_customer_code: string | null; status: string | null; current_period_start: string | null; current_period_end: string | null; created_at: string | null }, { user_id: string; plan: string; paystack_subscription_code?: string | null; paystack_customer_code?: string | null; status?: string; current_period_start?: string | null; current_period_end?: string | null }, { status?: string; paystack_customer_code?: string | null; current_period_start?: string | null; current_period_end?: string | null }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
