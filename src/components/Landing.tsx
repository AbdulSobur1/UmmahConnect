import Link from "next/link";
import { ArrowRight, Briefcase, CheckCircle2, Globe2, MessageCircle, ShieldCheck, UsersRound } from "lucide-react";
import { HalalBadge } from "@/components/HalalBadge";

const landingCommunities = [
  { id: "c1", name: "Muslim Tech", icon: "MT", member_count: 4200, description: "Engineers, founders, builders" },
  { id: "c2", name: "Halal Finance", icon: "HF", member_count: 2800, description: "Ethical money, halal investing" },
  { id: "c3", name: "Muslim Creatives", icon: "MC", member_count: 3100, description: "Designers, writers, artists" },
  { id: "c4", name: "Muslim Healthcare", icon: "MH", member_count: 1900, description: "Doctors, nurses, researchers" },
  { id: "c5", name: "Muslimas in Business", icon: "MB", member_count: 2400, description: "Women leading enterprises" },
  { id: "c6", name: "Muslim Entrepreneurs", icon: "ME", member_count: 3600, description: "Founders and makers" },
];

const landingJobs = [
  { id: "j1", title: "Frontend Engineer", company: "Cowrywise", location: "Lagos" },
  { id: "j2", title: "Brand Designer", company: "Sabi", location: "Abuja" },
];

const landingEvents = [
  { id: "e1", title: "Lagos Muslim Professionals Meetup", event_date: "15 July 2026", location_detail: "Lagos" },
  { id: "e2", title: "Halal Finance & Investment Summit", event_date: "2 August 2026", location_detail: "Abuja" },
];

const features = [
  { icon: UsersRound, title: "Niche communities", text: "Find Muslim peers in tech, finance, healthcare, media, education, business, and creative work." },
  { icon: Briefcase, title: "Halal jobs", text: "Discover opportunities with values-aware filters and halal verification built into the workflow." },
  { icon: MessageCircle, title: "Mentorship and messaging", text: "Build relationships with weekly limits for free users and deeper access for Pro members." },
  { icon: ShieldCheck, title: "Safe professional space", text: "A moderated environment where deen and ambition are allowed to sit together." },
];

export function Landing() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container">
          <span className="pill">Phase 1 Nigeria · Phase 2 global</span>
          <h1>Ummah Connect</h1>
          <p>
            Professional networking for Nigerian Muslim professionals and creatives. Build your career, find your people,
            discover halal opportunities, and stay grounded in the values that shape your work.
          </p>
          <div className="row row--wrap hero-actions">
            <Link className="btn btn-accent" href="/feed">
              Enter App <ArrowRight size={18} />
            </Link>
            <Link className="btn btn-ghost" href="#plans">
              View plans
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid three-col">
          <div>
            <h2 className="font-display">Built for the full person.</h2>
            <p className="muted">Not a generic network with a Muslim label pasted on. The product starts from how people actually grow, collaborate, and protect their values.</p>
          </div>
          {features.slice(0, 2).map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="card" key={feature.title}>
                <Icon color="#1A6B5C" />
                <h3>{feature.title}</h3>
                <p className="muted">{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section card--strong">
        <div className="container grid three-col">
          {features.slice(2).map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title}>
                <Icon color="#5ECDB5" />
                <h3>{feature.title}</h3>
                <p className="muted">{feature.text}</p>
              </article>
            );
          })}
          <article>
            <Globe2 color="#5ECDB5" />
            <h3>Nigeria first</h3>
            <p className="muted">Launch with local cities, industries, events, and Muslim professional realities before global expansion.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="screen-title">
            <div>
              <h2 className="font-display">Communities already waiting</h2>
            </div>
            <span className="pill">12 communities</span>
          </div>
          <div className="grid three-col">
            {landingCommunities.map((community) => (
              <article className="card" key={community.id}>
                <div className="row space-between">
                  <strong>{community.name}</strong>
                  <span className="pill">{community.icon}</span>
                </div>
                <p className="muted">{community.description}</p>
                <small>{community.member_count.toLocaleString()} members</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="plans">
        <div className="container grid three-col">
          {["Free", "Pro", "Event Sponsor"].map((plan, index) => (
            <article className="card" key={plan}>
              <h3 className="font-display">{plan}</h3>
              <p className="plan-price">{index === 0 ? '₦0' : index === 1 ? '₦9,000/month' : 'from ₦49,000/event'}</p>
              <p className="muted">{index === 0 ? 'Browse, connect, and message with weekly limits.' : index === 1 ? 'Full professional access and job posting.' : 'Promote verified events to the right audience.'}</p>
              <CheckCircle2 color="#1A6B5C" />
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container grid two-col">
          <article className="card">
            <HalalBadge />
            <h2 className="font-display">Featured jobs</h2>
            {landingJobs.map((job) => (
              <p key={job.id}><strong>{job.title}</strong> at {job.company} · {job.location}</p>
            ))}
          </article>
          <article className="card">
            <h2 className="font-display">Sponsored events</h2>
            {landingEvents.map((event) => (
              <p key={event.id}><strong>{event.title}</strong> · {event.event_date} · {event.location_detail}</p>
            ))}
          </article>
        </div>
      </section>
    </div>
  );
}
