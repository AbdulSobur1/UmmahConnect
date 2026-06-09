import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Briefcase,
  CalendarDays,
  Globe2,
  HeartHandshake,
  LockKeyhole,
  Moon,
  Network,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { HalalBadge } from "@/components/HalalBadge";

const stats = [
  ["1.8B", "Muslims worldwide"],
  ["100M+", "Nigeria Phase 1 market"],
  ["100M+", "Muslims in Nigeria"],
  ["Phase 1", "Nigeria launch"],
];

const problemCards = [
  {
    icon: Network,
    title: "No way to find Muslims in your niche",
    text: "The community exists, but Muslim professionals in tech, finance, healthcare, education, business, and creative work are scattered across generic platforms.",
    featured: true,
  },
  {
    icon: ShieldCheck,
    title: "No halal job filter",
    text: "Every role has to be manually vetted for industry ethics, prayer flexibility, employer values, and Muslim-friendly culture.",
  },
  {
    icon: HeartHandshake,
    title: "No faith-sensitive mentorship",
    text: "Mainstream mentorship rarely understands deen, family, culture, modesty, career ambition, and values in the same conversation.",
  },
  {
    icon: CalendarDays,
    title: "Islamic events lack reach",
    text: "Summits, workshops, expos, and community events need a trusted channel to reach Muslim professionals by niche.",
  },
];

const features = [
  {
    icon: UsersRound,
    title: "Niche professional communities",
    text: "Join Muslim Tech, Halal Finance, Muslimas in Business, Muslim Creatives, Healthcare, Education, Law, NGO, and more.",
    label: "Core feature",
  },
  {
    icon: BadgeCheck,
    title: "Halal opportunity filter",
    text: "Jobs can be tagged for halal compliance, industry ethics, prayer-time flexibility, remote work, and Muslim-owned businesses.",
    label: "All users",
  },
  {
    icon: Sparkles,
    title: "Values-based mentorship",
    text: "Match by industry, career stage, language, location, and Islamic values so the real conversation starts faster.",
    label: "Premium",
    gold: true,
  },
  {
    icon: Briefcase,
    title: "Hire and get hired",
    text: "Pro members can post halal-verified roles and reach Muslim talent without turning hiring into a guessing game.",
    label: "Premium",
    gold: true,
  },
  {
    icon: LockKeyhole,
    title: "Safe space by design",
    text: "Moderation, privacy controls, and photo-optional profiles make professional networking feel safer and more dignified.",
    label: "All users",
  },
  {
    icon: Moon,
    title: "Prayer-aware product",
    text: "Prayer reminders and job signals for flexible schedules help members grow without treating faith like an inconvenience.",
    label: "All users",
  },
];

const niches = [
  "Muslim Tech",
  "Halal Finance",
  "Muslim Creatives",
  "Healthcare",
  "Education",
  "Law & Policy",
  "Architecture",
  "Entrepreneurship",
  "Muslimas in Business",
  "NGO & Nonprofit",
  "Academia",
  "Islamic Finance",
];

export function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="container landing-nav-inner">
          <Link href="/" className="brand landing-brand">
            Ummah <span>Connect</span>
          </Link>
          <div className="landing-nav-links" aria-label="Landing navigation">
            <Link href="#problem">Problem</Link>
            <Link href="#features">Features</Link>
            <Link href="#mentorship">Mentorship</Link>
            <Link className="btn btn-accent" href="/signup">Join Ummah Connect</Link>
          </div>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="container landing-hero-grid">
          <div className="landing-hero-copy">
            <span className="landing-badge"><Moon size={16} /> For Muslim professionals and creatives</span>
            <h1>
              Find your people. Grow your <span>career.</span> Keep your <span>faith.</span>
            </h1>
            <p>
              The professional network built for Muslims. Connect with people in your exact niche, find halal opportunities,
              and get mentored by professionals who understand your values.
            </p>
            <div className="row row--wrap">
              <Link className="btn btn-accent" href="/signup">
                Get Started <ArrowRight size={18} />
              </Link>
              <Link className="btn btn-ghost" href="/login">
                Log In
              </Link>
            </div>
          </div>

          <div className="hero-product" aria-label="Ummah Connect product preview">
            <article className="hero-profile-card">
              <div className="row">
                <div className="hero-avatar">A</div>
                <div>
                  <strong>Aisha Bello</strong>
                  <p>Lagos - Software Engineer</p>
                </div>
              </div>
              <div className="row row--wrap">
                <HalalBadge />
                <span className="mini-tag">Seeking mentor</span>
              </div>
            </article>
            <article className="hero-event-card">
              <div className="row space-between">
                <span className="mini-label">Sponsored event</span>
                <BarChart3 size={16} />
              </div>
              <h3>Halal Finance & Investment Summit</h3>
              <p>Abuja - 2 August 2026 - Hybrid</p>
              <small>Reaching 2,800 Halal Finance members</small>
            </article>
            <article className="hero-profile-card hero-profile-card--offset">
              <div className="row">
                <div className="hero-avatar hero-avatar--gold">Y</div>
                <div>
                  <strong>Yusuf Adamu</strong>
                  <p>Abuja - Product Manager</p>
                </div>
              </div>
              <div className="row row--wrap">
                <span className="mini-tag">Halal Finance</span>
                <span className="mini-tag mini-tag--gold">Mentor</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-stats" aria-label="Market stats">
        {stats.map(([value, label]) => (
          <div className="landing-stat" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className="landing-section" id="problem">
        <div className="container">
          <div className="section-heading">
            <span>The problem</span>
            <h2>Muslim professionals are disconnected from each other.</h2>
            <p>Mainstream platforms were never designed around Muslim professional realities.</p>
          </div>
          <div className="problem-grid">
            {problemCards.map((card) => {
              const Icon = card.icon;
              return (
                <article className={`problem-card ${card.featured ? "problem-card--featured" : ""}`} key={card.title}>
                  <Icon />
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--muted" id="features">
        <div className="container">
          <div className="section-heading">
            <span>The solution</span>
            <h2>Everything built for your deen and your career.</h2>
            <p>Niche communities are the heart of the product. Jobs, mentorship, messaging, and events orbit around that trust.</p>
          </div>
          <div className="feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article className={`feature-card ${feature.gold ? "feature-card--gold" : ""}`} key={feature.title}>
                  <div className="feature-icon"><Icon size={24} /></div>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                  <span>{feature.label}</span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mentor-band" id="mentorship">
        <div className="container mentor-band-inner">
          <div>
            <span className="section-kicker">Premium feature</span>
            <h2>Mentorship that actually gets you.</h2>
            <p>
              Match with mentors who understand your industry, career stage, language, location, and Islamic values.
              No more explaining your worldview before the real conversation begins.
            </p>
            <Link className="btn btn-accent" href="/mentorship">Explore Mentorship</Link>
          </div>
          <div className="mentor-preview">
            {[
              ["97%", "Dr. Khadijah Usman", "Healthcare Director - Abuja", "Healthcare - Leadership - Ethics"],
              ["93%", "Ibrahim Al-Amin", "Tech Lead - Lagos", "Engineering - Fintech - Mentorship"],
              ["88%", "Nadia Kamara", "Creative Director - Lagos", "Branding - Design - Faith-led work"],
            ].map(([score, name, role, tags]) => (
              <article key={name}>
                <strong>{score}</strong>
                <div>
                  <h3>{name}</h3>
                  <p>{role}</p>
                  <small>{tags}</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="event-band">
        <div className="container event-band-inner">
          <div>
            <span className="section-kicker">Event sponsor plan</span>
            <h2>Get Islamic events in front of the right people.</h2>
            <p>
              A dedicated sponsorship plan, separate from Pro, for Islamic organisations, businesses, universities,
              and community groups promoting summits, expos, workshops, iftars, competitions, and conferences.
            </p>
            <div className="row row--wrap event-tags">
              <span>Real-time analytics</span>
              <span>Targeted by niche</span>
              <span>Verified organiser badge</span>
            </div>
          </div>
          <div className="event-preview">
            {[
              ["1.2k views", "Lagos Muslim Professionals Meetup", "Lagos - 15 July 2026"],
              ["2.1k views", "Halal Finance & Investment Summit", "Abuja - 2 August 2026"],
              ["890 views", "Muslimas in Leadership Conference", "Hybrid - September 2026"],
            ].map(([views, title, detail]) => (
              <article key={title}>
                <div className="row space-between">
                  <span className="mini-label">Sponsored</span>
                  <small>{views}</small>
                </div>
                <h3>{title}</h3>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="container">
          <div className="section-heading">
            <span>40+ niches</span>
            <h2>Your industry has a home here.</h2>
          </div>
          <div className="niche-grid">
            {niches.map((niche) => (
              <div className="niche-tile" key={niche}>{niche}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div className="container">
          <Globe2 size={30} />
          <h2>Your career. Your faith. One home.</h2>
          <p>Where your deen and your career are never in conflict.</p>
          <Link className="btn btn-accent" href="/signup">Join Ummah Connect</Link>
        </div>
      </section>
    </div>
  );
}
