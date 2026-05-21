import type { CommunityRow, EventListingRow, JobRow, MessageRow, NotificationRow, PostRow, UserRow } from "@/lib/supabase/types";

export function userDto(user: UserRow) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    industry: user.industry ?? "",
    career_stage: user.career_stage ?? "",
    city: user.city ?? "",
    country: user.country ?? "Nigeria",
    bio: user.bio ?? "",
    skills: user.skills ?? [],
    plan: user.plan ?? "free",
    show_photo: Boolean(user.show_photo),
    open_to_opportunities: Boolean(user.open_to_opportunities),
    created_at: user.created_at ?? "",
  };
}

export function postDto(post: PostRow & { users?: UserRow | null }) {
  return {
    id: post.id,
    user_id: post.user_id ?? "",
    content: post.content,
    community_id: post.community_id,
    likes_count: post.likes_count ?? 0,
    comments_count: post.comments_count ?? 0,
    created_at: post.created_at ?? "",
    user: post.users ? userDto(post.users) : null,
  };
}

export function communityDto(community: CommunityRow) {
  return {
    id: community.id,
    name: community.name,
    icon: community.icon ?? "",
    description: community.description ?? "",
    is_private: Boolean(community.is_private),
    member_count: community.member_count ?? 0,
  };
}

export function jobDto(job: JobRow) {
  return {
    id: job.id,
    posted_by: job.posted_by ?? "",
    title: job.title,
    company: job.company,
    location: job.location ?? "",
    is_remote: Boolean(job.is_remote),
    job_type: job.job_type ?? "",
    industry: job.industry ?? "",
    is_halal_verified: Boolean(job.is_halal_verified),
    career_stage: job.career_stage ?? "",
    salary_range: job.salary_range ?? "",
    created_at: job.created_at ?? "",
  };
}

export function eventDto(event: EventListingRow) {
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

export function messageDto(message: MessageRow) {
  return {
    id: message.id,
    sender_id: message.sender_id ?? "",
    receiver_id: message.receiver_id ?? "",
    content: message.content,
    is_read: Boolean(message.is_read),
    created_at: message.created_at ?? "",
  };
}

export function notificationDto(notification: NotificationRow) {
  return {
    id: notification.id,
    user_id: notification.user_id ?? "",
    type: notification.type,
    content: notification.content,
    is_read: Boolean(notification.is_read),
    created_at: notification.created_at ?? "",
    reference_id: notification.reference_id ?? undefined,
  };
}
