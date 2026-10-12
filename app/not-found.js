import Link from 'next/link';
import { projects, site } from './content';
import Backdrop from './components/Backdrop';
import FlipText from './components/FlipText';

export const metadata = {
  title: 'Page not found',
  description: 'This page doesn’t exist. Head back to Hassan Khan’s portfolio.',
  robots: { index: false, follow: true },
};

const Arrow = ({ deg = 0 }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style={deg ? { transform: `rotate(${deg}deg)` } : undefined}>
    <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function NotFound() {
  return (
    <>
      <Backdrop />
      <header className="nav">
        <Link href="/" className="nav__cta case-back"><Arrow deg={180} /> <FlipText text="Home" /></Link>
        <a className="nav__cta" href={`mailto:${site.email}`}><FlipText text="Let’s talk" /></a>
      </header>

      <main className="nf container">
        <p className="eyebrow nf__in" style={{ '--i': 0 }}><span>(404)</span> Page not found</p>

        <h1 className="nf__code nf__in" style={{ '--i': 1 }} aria-label="404">
          <span aria-hidden="true">4</span>
          <span className="nf__orb" aria-hidden="true"><i /></span>
          <span aria-hidden="true">4</span>
        </h1>

        <h2 className="nf__title nf__in" style={{ '--i': 2 }}>This page drifted off into the embers.</h2>
        <p className="lead nf__in" style={{ '--i': 3 }}>
          The link may be broken, or the page has moved. Here are a few ways back.
        </p>

        <div className="nf__actions nf__in" style={{ '--i': 4 }}>
          <Link href="/" className="btn">
            <span className="btn__icon"><Arrow /></span>
            <FlipText text="Back to home" />
          </Link>
          <Link href="/#work" className="nf__secondary"><FlipText text="See my work" /> <Arrow deg={-45} /></Link>
        </div>

        <nav className="nf__links nf__in" style={{ '--i': 5 }} aria-label="Case studies">
          <p className="nf__label">Or jump into a case study</p>
          <ul>
            {projects.map((p) => (
              <li key={p.slug}><Link href={`/work/${p.slug}`}>{p.title}</Link></li>
            ))}
          </ul>
        </nav>
      </main>
    </>
  );
}
