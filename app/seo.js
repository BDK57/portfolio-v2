import { site, skills } from './content';

// The live address used for canonical URLs, social previews (og:image must be absolute) and the sitemap.
// Order: NEXT_PUBLIC_SITE_URL (set this for a custom domain) → Netlify's own build-time URL → fallback.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || 'https://bdk-dev-portfolio.netlify.app').replace(/\/$/, '');

export const SITE_TITLE = 'Hassan Khan — Frontend & Creative Developer in Karachi';
export const SITE_DESCRIPTION =
  'Muhammad Hassan Khan is a Karachi-based frontend & creative developer building fast, animated, responsive web apps with React, Next.js and GSAP. Available for freelance worldwide.';

export const OG_IMAGE = { url: '/og-image.jpg', width: 1200, height: 630, alt: 'Hassan Khan — Frontend & Creative Developer portfolio' };

// Shared Open Graph fields: a page's `openGraph` replaces its parent's, so each page spreads these in.
export const ogBase = { siteName: 'Hassan Khan', locale: 'en_US', type: 'website' };

// schema.org Person, so search engines can connect the site to Hassan's profiles.
export const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.fullName,
  alternateName: 'Hassan Khan',
  url: SITE_URL,
  image: `${SITE_URL}/hero.webp`,
  email: `mailto:${site.email}`,
  jobTitle: site.role,
  worksFor: { '@type': 'Organization', name: site.currently.company },
  address: { '@type': 'PostalAddress', addressLocality: 'Karachi', addressCountry: 'PK' },
  sameAs: [site.github, site.linkedin],
  knowsAbout: skills.map((s) => s.name),
};
