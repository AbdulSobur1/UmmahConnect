import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { ProfileActions } from "@/components/public/ProfileActions";
import { publicProfileDto } from "@/lib/api/mappers";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: { id: string } };

async function fetchProfile(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("users").select("*").eq("id", id).single();
  if (!data || data.is_banned) return null;
  return publicProfileDto({
    id: data.id,
    full_name: data.full_name,
    email: data.email,
    industry: data.industry,
    career_stage: data.career_stage,
    city: data.city,
    country: data.country,
    bio: data.bio,
    skills: data.skills ?? [],
    plan: data.plan,
    show_photo: data.show_photo,
    open_to_opportunities: data.open_to_opportunities,
    avatar_url: data.avatar_url,
    created_at: data.created_at ?? null,
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const profile = await fetchProfile(params.id);
  if (!profile) return { title: "Profile not found" };
  const title = `${profile.full_name} — ${profile.industry} on Ummah Connect`;
  const description = profile.bio || `${profile.full_name} on Ummah Connect`;
  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const [profile, user] = await Promise.all([
    fetchProfile(params.id),
    getSessionUser(),
  ]);
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
              {profile.career_stage} · {profile.industry} · {profile.city},{" "}
              {profile.country}
            </p>
            {profile.open_to_opportunities ? (
              <span className="pill pill--active">Open to opportunities</span>
            ) : null}
            {profile.bio ? <p className="public-text">{profile.bio}</p> : null}
            {profile.skills.length > 0 ? (
              <div className="row row--wrap public-skill-row">
                {profile.skills.map((skill: string) => (
                  <span className="pill" key={skill}>
                    {skill}
                  </span>
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
