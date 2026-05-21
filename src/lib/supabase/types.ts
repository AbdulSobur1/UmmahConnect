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

export type Database = {
  public: {
    Tables: {
      users: { Row: UserRow; Insert: Partial<UserRow> & Pick<UserRow, "id" | "full_name" | "email">; Update: Partial<UserRow> };
      communities: { Row: CommunityRow; Insert: Partial<CommunityRow> & Pick<CommunityRow, "name">; Update: Partial<CommunityRow> };
      posts: { Row: PostRow; Insert: Partial<PostRow> & Pick<PostRow, "content">; Update: Partial<PostRow> };
      post_likes: { Row: { post_id: string; user_id: string }; Insert: { post_id: string; user_id: string }; Update: never };
      comments: { Row: CommentRow; Insert: Partial<CommentRow> & Pick<CommentRow, "content">; Update: Partial<CommentRow> };
      community_members: { Row: { community_id: string; user_id: string; joined_at: string | null }; Insert: { community_id: string; user_id: string }; Update: never };
      connections: { Row: { id: string; requester_id: string | null; receiver_id: string | null; status: string | null; created_at: string | null }; Insert: { requester_id: string; receiver_id: string; status?: string }; Update: { status?: string } };
      messages: { Row: MessageRow; Insert: Partial<MessageRow> & Pick<MessageRow, "sender_id" | "receiver_id" | "content">; Update: Partial<MessageRow> };
      message_weekly_counts: { Row: { user_id: string; week_start: string; count: number | null }; Insert: { user_id: string; week_start: string; count?: number }; Update: { count?: number } };
      jobs: { Row: JobRow; Insert: Partial<JobRow> & Pick<JobRow, "posted_by" | "title" | "company">; Update: Partial<JobRow> };
      mentorship_profiles: { Row: MentorshipProfileRow; Insert: MentorshipProfileRow; Update: Partial<MentorshipProfileRow> };
      mentorship_requests: { Row: { id: string; mentee_id: string | null; mentor_id: string | null; status: string | null; message: string | null; created_at: string | null }; Insert: { mentee_id: string; mentor_id: string; message?: string }; Update: { status?: string } };
      event_listings: { Row: EventListingRow; Insert: Partial<EventListingRow> & Pick<EventListingRow, "sponsor_id" | "title">; Update: Partial<EventListingRow> };
      notifications: { Row: NotificationRow; Insert: Partial<NotificationRow> & Pick<NotificationRow, "user_id" | "type" | "content">; Update: Partial<NotificationRow> };
      subscriptions: { Row: { id: string; user_id: string | null; plan: string; paystack_subscription_code: string | null; paystack_customer_code: string | null; status: string | null; current_period_start: string | null; current_period_end: string | null; created_at: string | null }; Insert: { user_id: string; plan: string; paystack_subscription_code?: string | null; paystack_customer_code?: string | null; status?: string; current_period_start?: string | null; current_period_end?: string | null }; Update: { status?: string; current_period_end?: string | null } };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
