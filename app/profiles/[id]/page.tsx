import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { ProfileActions } from '@/components/public/ProfileActions';
import { publicProfileDto } from '@/lib/api/mappers';
import { getSessionUser } from '@/lib/auth/session';
import { getDemoProfile, isDemoMode } from '@/lib/demo/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

type PageProps = { params: { id: string } };

async function fetchProfile(id: string) {
  if (isDemoMode()) {
    return getDemoProfile(id);
  }
  const [data] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  if (!data || data.isBanned) return null;
  return publicProfileDto({
    id: data.id,
    full_name: data.fullName,
    email: data.email,
    industry: data.industry,
    career_stage: data.careerStage,
    city: data.city,
    country: data.country,
    bio: data.bio,
    skills: data.skills ?? [],
    plan: data.plan,
    show_photo: data.showPhoto,
    open_to_opportunities: data.openToOpportunities,
    avatar_url: data.avatarUrl,
    created_at: data.createdAt?.toISOString() ?? null,
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const profile = await fetchProfile(params.id);
  if (!profile) return { title: 'Profile not found' };
  const title = `${profile.full_name} — ${profile.industry} on Ummah Connect`;
  const description = profile.bio || `${profile.full_name} on Ummah Connect`;
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
                {profile.skills.map((skill: string) => (
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
