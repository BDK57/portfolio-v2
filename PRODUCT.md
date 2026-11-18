# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences with equal weight:

- **Freelance clients**: startups, agencies and brands, worldwide, looking for a frontend or creative developer to build a site or web app. They arrive from a shared link, LinkedIn or GitHub, scan the work, and decide whether to get in touch about a project.
- **Full-time employers**: recruiters and hiring managers filling a frontend or creative developer role. They need to judge skill, seniority and real shipped work quickly.

Secondary user: Hassan himself, maintaining the site's content through the Strapi admin (`cms/`).

## Product Purpose

The personal portfolio of Muhammad Hassan Khan ("Hassan"), a Frontend & Creative Developer based in Karachi, Pakistan, currently Associate UI/UX Developer at The Symmetry Group. It shows his shipped work and turns visitors into conversations: a freelance project or a job offer.

A visit counts as a success when the visitor does any of these:

- emails Hassan about a project or role;
- reads a case study and understands what he built;
- clicks through to a live shipped site;
- follows up through LinkedIn or GitHub.

## Positioning

What Hassan can truthfully claim that a neighbouring developer could not copy as a set:

- **Motion and interaction craft**: GSAP scroll storytelling, WebGL and micro-interactions; the portfolio itself is the demonstration.
- **Shipped brand work at scale**: production sites for real brands (Jazz's ROX, ONIC, MCB Bank, Tango Pay).
- **Design and engineering in one person**: UI/UX sense and pixel-perfect Figma-to-code, so nothing is lost in handoff.
- **Speed and reliability**: fast, responsive, SEO-tuned builds delivered on time.

## Operating Context

- Visitors land on the home page or a case study (`/work/<slug>`), often from a link preview on LinkedIn, Facebook or X, on desktop or phone.
- Contact happens by email (mailto links and a copyable address); there is no form backend.
- Hassan works from Karachi (PKT), and the footer shows his local time.
- Content is edited in the Strapi admin (Render, with Supabase Postgres and Cloudflare R2 media). Publishing triggers a Netlify rebuild. If Strapi is unreachable, the build falls back to `app/content.js`.

## Capabilities and Constraints

- Next.js App Router with static export (`output: 'export'`) on Netlify. There is no server runtime on the site, so dynamic behaviour is client-side or happens at build time.
- **Home page sections:** hero, tech-stack strip, about, skills, work grid, services, testimonials, education, contact and footer.
- **Other pages:** six case-study pages and a 404.
- **Interactive features:**
  - a typing intro gate ("i am ready") with sound, a skip button, and a mute toggle;
  - optional webcam hand-gesture control via MediaPipe, desktop only and opt-in;
  - a WebGL hero ripple and skill bubbles.
- `prefers-reduced-motion` is honoured: the intro and heavy motion are skipped.
- **Services** are listed without prices; every project is quoted to its scope.
- **Admin:** the Render free tier sleeps when idle, so the admin takes about a minute to wake.
- **Open decisions (not yet decided):**
  - a light/dark mode toggle was requested once and then rolled back;
  - a Next.js 16.4.0 security advisory is flagged at build and has not been upgraded yet.

## Brand Commitments

- Name and title: "Hassan" / Muhammad Hassan Khan, "Frontend & Creative Developer based in Karachi".
- Orange accent and the Poppins typeface stay. The owner chose to keep both when a restyle was discussed.
- The owner wants these signature pieces kept: the keyboard loading screen, the hero portrait with the large "Hassan" name effects, the scroll-tilted project grid with case studies, and the skill bubbles.
- Voice: direct and confident, first person, no hype claims beyond the evidence below.

## Evidence on Hand

- **Projects**, real and live: ROX (Jazz), ONIC, Tango Pay, MCB Bank, Cartsite Survey, Password Generator.
  - Covers: `public/work/`. Screenshots: `public/work/shots/`. Share images: `public/work/og/`.
  - Client facts come from public sources. Hassan's own role wording on each project still needs his review.
- **Testimonials:** four, from Atif, Muneeb, Bilal and Kashan Malik, with their roles, carried over from his previous portfolio.
- **Education:** BS Computer Science (PAF KIET), Web Development (MITI), App Development (National Certificate), JavaScript Developer (SMIT).
- **Portrait photography:** `public/hero.webp`, with originals in `source-images/`.
- **Absent, so never fabricate:** client logos used as endorsement, metrics or performance numbers, prices, press, awards, and additional testimonials.

## Product Principles

1. **The work is the proof.** Every claim should point to a real shipped project, case study or live link.
2. **Serve both audiences in one pass.** A client and a recruiter should each find what they need without a separate path.
3. **Show the craft, don't describe it.** Motion and interaction are evidence of skill, but never at the cost of reading speed or getting in touch.
4. **Contact is always one step away.** Email, LinkedIn and GitHub stay reachable from every page.
5. **Content lives in the admin.** New sections and fields should be editable in Strapi, with the code fallback kept in step.

## Accessibility & Inclusion

No formal standard has been set. Existing commitments to keep:

- reduced-motion support;
- keyboard-reachable controls, including the intro's skip button;
- the hand-gesture control is opt-in only and never required;
- alt text on portraits and project images.
