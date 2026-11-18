import * as si from 'simple-icons';
import * as local from '../content';
import { SITE_TITLE, SITE_DESCRIPTION, OG_IMAGE } from '../seo';

/*
 * Site content, read once per build. With STRAPI_URL set, everything comes from the Strapi admin
 * (published entries only); without it, or if Strapi can't be reached, the build falls back to
 * app/content.js so a deploy never breaks. Either way pages get the same shape.
 */
const STRAPI_URL = process.env.STRAPI_URL?.replace(/\/$/, '');

const fallback = {
  ...local,
  site: { ...local.site, portrait: '/hero.webp' },
  seo: { title: SITE_TITLE, description: SITE_DESCRIPTION, ogImage: OG_IMAGE },
};

let content;
export function getContent() {
  return (content ??= load());
}

async function load() {
  if (!STRAPI_URL) return fallback;
  try {
    const [site, skills, projects, services, testimonials, credentials] = await Promise.all([
      get('site?populate=*'),
      get('skills?sort=order&pagination[pageSize]=100'),
      get('projects?sort=order&populate=*&pagination[pageSize]=100'),
      get('services?sort=order&pagination[pageSize]=100'),
      get('testimonials?sort=order&pagination[pageSize]=100'),
      get('credentials?sort=order&pagination[pageSize]=100'),
    ]);
    if (!site || !projects.length) throw new Error('site settings or projects are empty');
    return {
      site: {
        name: site.name, fullName: site.fullName, role: site.role, location: site.location,
        email: site.email, github: site.github, linkedin: site.linkedin, intro: site.intro,
        currently: { title: site.currentlyTitle, company: site.currentlyCompany },
        about: { heading: site.aboutHeading, body: site.aboutBody },
        portrait: media(site.portrait) || fallback.site.portrait,
      },
      seo: {
        title: site.seoTitle || fallback.seo.title,
        description: site.seoDescription || fallback.seo.description,
        ogImage: site.ogImage
          ? { url: media(site.ogImage), width: site.ogImage.width, height: site.ogImage.height, alt: site.ogImage.alternativeText || fallback.seo.ogImage.alt }
          : fallback.seo.ogImage,
      },
      stack: texts(site.stack),
      skills: skills.map((s) => ({ name: s.name, icon: icon(s.iconSlug), core: !!s.core })).filter((s) => s.icon),
      projects: projects.map((p) => ({
        slug: p.slug, title: p.title, kind: p.kind, tags: texts(p.tags), url: p.url,
        img: media(p.cover), client: p.client, industry: p.industry, role: p.role, summary: p.summary,
        overview: (p.overview || '').split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean),
        highlights: (p.highlights || []).map(({ title, text }) => ({ title, text })),
        shots: { desktop: media(p.shotDesktop), mobile: media(p.shotMobile) },
        og: p.ogImage ? { url: media(p.ogImage), width: p.ogImage.width, height: p.ogImage.height, alt: `${p.title} website` } : null,
      })),
      services: services.map(({ label, title, blurb, points, featured }) => ({ label, title, blurb, points: texts(points), featured: !!featured })),
      testimonials: testimonials.map(({ quote, name, role }) => ({ quote, name, role })),
      credentials: credentials.map(({ title, institution }) => ({ title, where: institution })),
    };
  } catch (e) {
    console.warn(`[cms] Strapi unavailable (${e.message}); building from app/content.js`);
    return fallback;
  }
}

async function get(path) {
  const res = await fetch(`${STRAPI_URL}/api/${path}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(90_000) }); // a sleeping Render service takes ~1 min to wake
  if (!res.ok) throw new Error(`${res.status} on /api/${path.split('?')[0]}`);
  return (await res.json()).data;
}

// Lists of short lines (stack, tags, service points) are repeatable "Label" components.
const texts = (items) => (items || []).map((i) => i.text).filter(Boolean);

// Uploaded files: R2 returns absolute URLs; the local provider returns paths on the Strapi server.
const media = (m) => (!m?.url ? undefined : m.url.startsWith('/') ? STRAPI_URL + m.url : m.url);

// Skill logos are stored as a simple-icons slug (e.g. "nextdotjs", see simpleicons.org).
const icon = (slug = '') => si[`si${slug.charAt(0).toUpperCase()}${slug.slice(1)}`]?.path;
