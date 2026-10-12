import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projects, site } from '../../content';
import Backdrop from '../../components/Backdrop';
import CaseEffects from '../../components/CaseEffects';
import FlipText from '../../components/FlipText';
import { OG_IMAGE, ogBase } from '../../seo';

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

const find = async (params) => {
  const { slug } = await params;
  return projects.findIndex((p) => p.slug === slug);
};

export async function generateMetadata({ params }) {
  const p = projects[await find(params)];
  if (!p) return {};
  const title = `${p.title} — Case study`;
  const description = `${p.summary} ${p.kind} for ${p.client}, built with ${p.tags.join(', ')}.`;
  // Landscape live screenshot when we have one; otherwise the site-wide preview image.
  // JPEG (widest support across LinkedIn, WhatsApp, X…), cropped from the live desktop screenshot.
  const image = p.shots.desktop
    ? { url: p.shots.desktop.replace('/shots/', '/og/').replace('-desktop.webp', '.jpg'), width: 1200, height: 630, alt: `${p.title} website` }
    : OG_IMAGE;
  return {
    title,
    description,
    keywords: [p.title, p.client, ...p.industry.split(' · '), ...p.tags, 'case study', 'Hassan Khan'],
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { ...ogBase, type: 'article', url: `/work/${p.slug}`, title, description, images: [image] },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
  };
}

const Arrow = ({ deg = 0 }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style={deg ? { transform: `rotate(${deg}deg)` } : undefined}>
    <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const pad = (n) => String(n).padStart(2, '0');

export default async function CaseStudy({ params }) {
  const i = await find(params);
  if (i < 0) notFound();
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];
  const host = new URL(p.url).host.replace(/^www\./, '');

  return (
    <>
      <Backdrop />
      <CaseEffects />

      <header className="nav">
        <Link href="/#work" className="nav__cta case-back"><Arrow deg={180} /> <FlipText text="All projects" /></Link>
        <a className="nav__cta" href={`mailto:${site.email}`}><FlipText text="Let’s talk" /></a>
      </header>

      <main className="case">
        {/* ── Hero ── */}
        <section className="case-hero container">
          <p className="eyebrow" data-reveal><span>({pad(i + 1)})</span> Case study</p>
          <h1 className="case-hero__title" data-split>{p.title}</h1>
          <p className="case-hero__summary" data-reveal>{p.summary}</p>
          <dl className="case-meta" data-reveal>
            <div><dt>Client</dt><dd>{p.client}</dd></div>
            <div><dt>Industry</dt><dd>{p.industry}</dd></div>
            <div><dt>Role</dt><dd>{p.role}</dd></div>
            <div><dt>Stack</dt><dd><ul className="tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul></dd></div>
          </dl>
          <div className="case-hero__cta" data-reveal>
            <a className="btn" href={p.url} target="_blank" rel="noopener noreferrer">
              <span className="btn__icon"><Arrow deg={-45} /></span>
              <FlipText text="Visit live site" />
            </a>
            <span className="muted case-host">{host}</span>
          </div>
        </section>

        {/* ── Key visual: live desktop shot in a browser frame, else the cover art ── */}
        <section className="case-visual container" data-reveal>
          <div className="browser">
            <div className="browser__bar" aria-hidden="true"><i /><i /><i /><span>{host}</span></div>
            <div className="browser__view">
              <img data-parallax src={p.shots.desktop || p.img} alt={`${p.title} homepage`} loading="eager" decoding="async" />
            </div>
          </div>
        </section>

        {/* ── Overview ── */}
        <section className="case-overview container case-section">
          <p className="eyebrow" data-reveal><span>(01)</span> Overview</p>
          <div className="case-overview__body">
            {p.overview.map((para, k) => <p key={k} className={k === 0 ? 'case-lede' : 'lead'} data-reveal>{para}</p>)}
          </div>
        </section>

        {/* ── Highlights ── */}
        <section className="container case-section">
          <header className="section-head">
            <p className="eyebrow" data-reveal><span>(02)</span> Highlights</p>
            <h2 className="h2" data-split>What makes it work</h2>
          </header>
          <ol className="case-highlights">
            {p.highlights.map((h, k) => (
              <li key={h.title} className="card" data-reveal>
                <span className="case-highlights__num">{pad(k + 1)}</span>
                <h3>{h.title}</h3>
                <p className="muted">{h.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Gallery ── */}
        <section className="container case-section">
          <header className="section-head">
            <p className="eyebrow" data-reveal><span>(03)</span> Gallery</p>
            <h2 className="h2" data-split>Across every screen</h2>
          </header>
          <div className={`case-gallery ${p.shots.mobile ? '' : 'is-single'}`}>
            <figure className="case-gallery__poster" data-reveal>
              <img src={p.img} alt={`${p.title} design overview`} width="900" height="1273" loading="lazy" decoding="async" />
            </figure>
            {p.shots.mobile && (
              <figure className="phone" data-reveal>
                <div className="phone__screen">
                  <img src={p.shots.mobile} alt={`${p.title} on mobile`} width="390" height="844" loading="lazy" decoding="async" />
                </div>
              </figure>
            )}
          </div>
        </section>

        {/* ── Next project ── */}
        <section className="container case-section">
          <Link href={`/work/${next.slug}`} className="case-next" data-reveal>
            <span className="eyebrow"><span>({pad(((i + 1) % projects.length) + 1)})</span> Next project</span>
            <span className="case-next__title"><FlipText text={next.title} stagger={0.03} /> <Arrow /></span>
            <span className="muted">{next.kind}</span>
            <img src={next.img} alt="" width="900" height="1273" loading="lazy" decoding="async" />
          </Link>
        </section>
      </main>

      <footer className="case-foot container">
        <a className="case-foot__mail" href={`mailto:${site.email}`}><FlipText text={site.email} stagger={0.012} /></a>
        <p className="muted">© {new Date().getFullYear()} {site.fullName}</p>
      </footer>
    </>
  );
}
