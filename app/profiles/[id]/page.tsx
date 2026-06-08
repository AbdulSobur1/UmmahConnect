import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { ProfileActions } from '@/components/public/ProfileActions';
import { publicProfileDto } from '@/lib/api/mappers';
import { getSessionUser } from '@/lib/auth/session';
import { getDemoProfile, isDemoMode } from '@/lib/demo/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { UserRow } from '@/lib/supabase/types';

type PageProps = { params: { id: string } };

type UserWithBan = UserRow & { is_banned?: boolean | null };

async function fetchProfile(id: string) {
  if (isDemoMode()) {
    return getDemoProfile(id);
  }
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('users')
    .select('id, full_name, industry, career_stage, city, country, bio, skills, open_to_opportunities, created_at')
    .eq('id', id)
    .single();
  if (!data) return null;
  const profile = data as UserWithBan;
  if (profile.is_banned) return null;
  return publicProfileDto(profile);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const profile = await fetchProfile(params.id);
  if (!profile) return { title: 'Profile not found' };
  const title = `${profile.full_name} — ${profile.industry} on UmmahConnect`;
  const description = profile.bio || `${profile.full_name} on UmmahConnect`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const [profile, user] = await Promise.all([fetchProfile(params.id), getSessionUser()]);
  if (!profile) notFound();

  return (
    <PublicLayout user={user}>
      <main className="page">
        <div className="container">
          <Link href="/" className="brand public-brand">
            Ummah <span>Connect</span>
          </Link>
          <article className="card public-card">
            <h1 className="font-display">{profile.full_name}</h1>
            <p className="muted public-copy">
              {profile.career_stage} · {profile.industry} · {profile.city}, {profile.country}
            </p>
            {profile.open_to_opportunities ? (
              <span className="pill pill--active">
                Open to opportunities
              </span>
            ) : null}
            {profile.bio ? <p className="public-text">{profile.bio}</p> : null}
            {profile.skills.length > 0 ? (
              <div className="row row--wrap public-skill-row">
                {profile.skills.map((skill) => (
                  <span className="pill" key={skill}>{skill}</span>
                ))}
              </div>
            ) : null}
            {user?.id !== profile.id ? (
              <ProfileActions user={user} profileId={profile.id} />
            ) : null}
          </article>
        </div>
      </main>
    </PublicLayout>
  );
}
