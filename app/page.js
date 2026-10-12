import { site, stack, skills, projects, services, testimonials, credentials } from './content';
import Effects from './components/Effects';
import Nav from './components/Nav';
import Intro from './components/Intro';
import FlipText from './components/FlipText';
import TiltedGrid from './components/TiltedGrid';
import Backdrop from './components/Backdrop';
import { personJsonLd } from './seo';
import CopyEmail from './components/CopyEmail';
import Clock from './components/Clock';
import { HeroRipple, SkillBubbles } from './components/Lazy';

const Arrow = ({ up }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style={up ? { transform: 'rotate(-45deg)' } : undefined}>
    <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Check = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="check">
    <circle cx="12" cy="12" r="11" fill="currentColor" />
    <path d="M7 12.5l3.2 3L17 9" fill="none" stroke="var(--bg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Button({ href, children, variant = '', ...rest }) {
  return (
    <a href={href} className={`btn ${variant}`} {...rest}>
      <span className="btn__icon"><Arrow /></span>
      <FlipText text={children} />
    </a>
  );
}

const mail = (subject) => `mailto:${site.email}?subject=${encodeURIComponent(subject)}`;

function SectionHead({ index, label, title, children }) {
  return (
    <header className="section-head">
      <p className="eyebrow" data-reveal><span>({index})</span> {label}</p>
      <h2 className="h2" data-split>{title}</h2>
      {children && <p className="lead" data-reveal>{children}</p>}
    </header>
  );
}

export default function Home() {

  return (
    <>
      <Backdrop />
      <Intro />
      <Effects />
      <Nav email={site.email} />

      {/* Structured data: who this site is about (helps search results and knowledge panels). */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <main id="top">
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="hero" aria-label="Intro">
          <div className="hero__glow" aria-hidden="true" />
          <div className="hero__portrait" data-hero-portrait>
            <img src="/hero.webp" alt={`Portrait of ${site.fullName}`} width="1000" height="1000" fetchPriority="high" />
            <HeroRipple src="/hero.webp" />
          </div>

          <div className="hero__title">
            <p className="badge" data-hero-pop><span className="dot" /> Available for work</p>
            <h1><span className="sr-only">{site.fullName}, </span><span className="hero__lines" data-hero-lines>{site.role} based in {site.location}</span></h1>
          </div>
          <div className="hero__aside">
            <p data-hero-lines>{site.intro}</p>
            <Button href="#work" data-hero-pop>See my work</Button>
          </div>

          <p className="hero__name" data-hero-name aria-hidden="true">{site.name}</p>
        </section>

        {/* ── Stack marquee ────────────────────────────────── */}
        <div className="marquee" aria-label="Tech stack">
          {[0, 1].map((n) => (
            <ul key={n} className="marquee__track" aria-hidden={n === 1 || undefined}>
              {stack.map((s) => <li key={s}><span className="marquee__mark" />{s}</li>)}
            </ul>
          ))}
        </div>

        {/* ── About ────────────────────────────────────────── */}
        <section id="about" className="about container section">
          <aside className="about__side">
            <p className="eyebrow" data-reveal><span>(01)</span> About</p>
            <div className="card now" data-reveal>
              <p className="now__label"><span className="dot" /> Currently</p>
              <p className="now__title">{site.currently.title}</p>
              <p className="muted">@ {site.currently.company}</p>
            </div>
          </aside>
          <div className="about__main">
            <h2 className="h2 about__heading" data-words>{site.about.heading}</h2>
            <p className="lead" data-reveal>{site.about.body}</p>
            <ul className="facts" data-reveal>
              <li><span className="muted">Based in</span>Karachi, Pakistan</li>
              <li><span className="muted">Focus</span>React · Next.js · GSAP</li>
              <li><span className="muted">Open to</span>Freelance & full-time</li>
            </ul>
            <div data-reveal><Button href="#work">See my work</Button></div>
          </div>
        </section>

        {/* ── Skills ───────────────────────────────────────── */}
        <section id="skills" className="skills section" aria-label="Skills">
          <div className="container">
            <SectionHead index="02" label="Skills" title="My toolkit, in orbit">
              Every bubble is a tool I ship with. Move through them and watch them scatter.
            </SectionHead>
          </div>
          <div className="skills__stage">
            <SkillBubbles skills={skills} />
          </div>
          <ul className="sr-only">{skills.map((s) => <li key={s.name}>{s.name}</li>)}</ul>
        </section>

        {/* ── Work ─────────────────────────────────────────── */}
        <section id="work" className="work section">
          <div className="container work__head">
            <SectionHead index="03" label="Selected work" title="Projects that shipped" />
            <p className="work__count" data-reveal>{String(projects.length).padStart(2, '0')}</p>
          </div>
          <TiltedGrid projects={projects} />
        </section>

        {/* ── Services ─────────────────────────────────────── */}
        <section id="services" className="container section">
          <SectionHead index="04" label="Services" title="What I can build for you">
            Every project is quoted to its scope. Pick a starting point and let&apos;s talk.
          </SectionHead>
          <div className="services">
            {services.map((s) => (
              <article key={s.label} className={`service card ${s.featured ? 'service--featured' : ''}`} data-reveal>
                <div className="service__top">
                  <p className="service__label">{s.label}</p>
                  <h3 className="service__title">{s.title}</h3>
                  <p className="service__blurb">{s.blurb}</p>
                </div>
                <ul className="service__points">
                  {s.points.map((pt) => <li key={pt}><Check />{pt}</li>)}
                </ul>
                <Button href={mail(`Project enquiry: ${s.label}`)} variant={s.featured ? 'btn--dark' : ''}>Let&apos;s talk</Button>
              </article>
            ))}
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────── */}
        <section id="testimonials" className="container section">
          <SectionHead index="05" label="Testimonials" title="Trusted by teams, loved by clients">
            Good engineering goes beyond code. It shows in how people feel working with you.
          </SectionHead>
          <div className="quotes">
            {testimonials.map((t) => (
              <figure key={t.name} className="quote card" data-reveal>
                <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" className="quote__mark"><path fill="currentColor" d="M13 8H7a3 3 0 00-3 3v6a3 3 0 003 3h3v1a3 3 0 01-3 3H6v3h1a6 6 0 006-6V8zm15 0h-6a3 3 0 00-3 3v6a3 3 0 003 3h3v1a3 3 0 01-3 3h-1v3h1a6 6 0 006-6V8z" /></svg>
                <blockquote>{t.quote}</blockquote>
                <figcaption>
                  <span className="avatar" aria-hidden="true">{t.name[0]}</span>
                  <span><strong>{t.name}</strong><span className="muted">{t.role}</span></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ── Credentials ──────────────────────────────────── */}
        <section className="container section">
          <SectionHead index="06" label="Education" title="Learning never ships last" />
          <ul className="creds">
            {credentials.map((c, i) => (
              <li key={c.title} data-reveal data-flip-host>
                <span className="muted">{String(i + 1).padStart(2, '0')}</span>
                <strong><FlipText text={c.title} stagger={0.025} /></strong>
                <span className="muted">{c.where}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Contact: zoom-through ───────────────────────── */}
        <section id="contact" className="zoom" aria-labelledby="contact-title">
          <div className="zoom__stage">
            <p className="eyebrow zoom__eyebrow"><span>(07)</span> Contact</p>
            <h2 id="contact-title" className="zoom__title" data-zoom-title>
              Let&apos;s create something <em>except<span data-zoom-i>i</span>onal.</em>
            </h2>
            <p className="zoom__hint muted">Keep scrolling ↓</p>
            <div className="zoom__cta" data-zoom-cta>
              <div className="container zoom__cta-inner">
                <p className="eyebrow zoom__in"><span>(07)</span> Contact</p>
                <h3 className="zoom__cta-title zoom__in">Got an idea?<br />Let&apos;s build it.</h3>
                <div className="zoom__cta-row zoom__in">
                  <a className="orb orb--dark" href={mail('Hello Hassan, let’s start a project')} data-magnetic aria-label="Start a project — email Hassan">
                    <svg className="orb__ring" viewBox="0 0 200 200" aria-hidden="true">
                      <defs><path id="orb-path" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" /></defs>
                      <text><textPath href="#orb-path" textLength="474" lengthAdjust="spacing">START A PROJECT · START A PROJECT · </textPath></text>
                    </svg>
                    <span className="orb__core"><Arrow up /></span>
                  </a>
                  <p className="zoom__cta-copy">Have a product, a launch or a wild idea? Let&apos;s build a fast, animated web experience your users won&apos;t forget.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Finale: the orange CTA screen continues into the footer ── */}
      <footer className="finale">
        <div className="container">
          <p className="finale__label">Or write to me directly</p>
          <div className="finale__mailrow">
            <a className="finale__mail" href={mail('Hello Hassan')}><FlipText text={site.email} stagger={0.012} /></a>
            <CopyEmail email={site.email} />
          </div>
          <div className="finale__row">
            <p><span>Local time · Karachi</span><Clock /></p>
            <ul className="finale__links">
              <li><a href={site.github} target="_blank" rel="noopener noreferrer"><FlipText text="GitHub" /> <Arrow up /></a></li>
              <li><a href={site.linkedin} target="_blank" rel="noopener noreferrer"><FlipText text="LinkedIn" /> <Arrow up /></a></li>
              <li><a href="#top"><FlipText text="Back to top" /> <Arrow up /></a></li>
            </ul>
            <p>© {new Date().getFullYear()} {site.fullName}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
