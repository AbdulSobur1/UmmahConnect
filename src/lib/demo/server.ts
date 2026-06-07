import {
  communities as mockCommunities,
  feedPosts as mockPosts,
  jobs as mockJobs,
  users as mockUsers,
} from '@/lib/mock';
import { publicProfileDto } from '@/lib/api/mappers';
import { communityDto, jobDto, postDto } from '@/lib/api/mappers';
import type { UserRow } from '@/lib/supabase/types';

export function isDemoMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getDemoProfile(id: string) {
  const user = mockUsers.find((u) => u.id === id);
  if (!user) return null;
  const row: UserRow = {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    industry: user.industry,
    career_stage: user.career_stage,
    city: user.city,
    country: user.country,
    bio: user.bio,
    skills: user.skills,
    plan: user.plan,
    show_photo: user.show_photo,
    open_to_opportunities: user.open_to_opportunities,
    avatar_url: null,
    created_at: user.created_at,
  };
  return publicProfileDto(row);
}

export function getDemoJobs() {
  return mockJobs.map((job) =>
    jobDto({
      id: job.id,
      posted_by: job.posted_by,
      title: job.title,
      company: job.company,
      description: null,
      industry: job.industry,
      location: job.location,
      is_remote: job.is_remote,
      job_type: job.job_type,
      career_stage: job.career_stage,
      salary_range: job.salary_range,
      is_halal_verified: job.is_halal_verified,
      is_active: true,
      created_at: job.created_at,
    }),
  );
}

export function getDemoCommunity(id: string) {
  const community = mockCommunities.find((c) => c.id === id);
  if (!community) return null;
  const communityRow = {
    id: community.id,
    name: community.name,
    icon: community.icon,
    description: community.description,
    is_private: community.is_private,
    member_count: community.member_count,
    created_at: community.created_at ?? null,
  };
  if (community.is_private) {
    return { ...communityDto(communityRow), is_private: true as const };
  }
  const posts = mockPosts
    .filter((p) => p.community_id === id)
    .map((p) =>
      postDto({
        id: p.id,
        user_id: p.user_id,
        content: p.content,
        community_id: p.community_id,
        likes_count: p.likes_count,
        comments_count: p.comments_count,
        created_at: p.created_at,
        users: {
          id: p.user.id,
          full_name: p.user.full_name,
          email: p.user.email,
          industry: p.user.industry,
          career_stage: p.user.career_stage,
          city: p.user.city,
          country: p.user.country,
          bio: p.user.bio,
          skills: p.user.skills,
          plan: p.user.plan,
          show_photo: p.user.show_photo,
          open_to_opportunities: p.user.open_to_opportunities,
          avatar_url: null,
          created_at: p.user.created_at,
        },
      }),
    );
  return { ...communityDto(communityRow), posts };
}

export function getDemoPost(id: string) {
  const post = mockPosts.find((p) => p.id === id);
  if (!post) return null;
  return {
    ...postDto({
      id: post.id,
      user_id: post.user_id,
      content: post.content,
      community_id: post.community_id,
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      created_at: post.created_at,
      users: {
        id: post.user.id,
        full_name: post.user.full_name,
        email: post.user.email,
        industry: post.user.industry,
        career_stage: post.user.career_stage,
        city: post.user.city,
        country: post.user.country,
        bio: post.user.bio,
        skills: post.user.skills,
        plan: post.user.plan,
        show_photo: post.user.show_photo,
        open_to_opportunities: post.user.open_to_opportunities,
        avatar_url: null,
        created_at: post.user.created_at,
      },
    }),
    comments: [],
  };
}
