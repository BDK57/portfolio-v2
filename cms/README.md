# Portfolio admin (Strapi)

The admin panel for the portfolio. Strapi 5, with the database on **Supabase** (Postgres) and uploads on
**Cloudflare R2**, hosted on **Render**. The website (Netlify) reads published content when it builds, and
publishing in the admin triggers a rebuild, so changes go live in about two minutes.

```
You edit in Strapi (Render) ──publish──▶ Netlify build hook ──▶ site rebuilds, reads Strapi ──▶ live
          │                                        │
     Supabase Postgres                    if Strapi is unreachable, the build
     Cloudflare R2 (images)               uses app/content.js instead
```

## What you can edit

| In the admin | On the site |
| --- | --- |
| **Site settings** | Hero name, role, intro and portrait; about heading and text; current job; email and social links; the tech-stack strip; SEO title, description and link-preview image |
| **Project** | Cards in the work grid and their case-study pages (cover, screenshots, highlights, overview, share image). `order` sets the position |
| **Skill** | Bubbles in the skills section. The logo is a slug from [simpleicons.org](https://simpleicons.org) (e.g. `react`, `nextdotjs`) |
| **Service / Testimonial / Education** | The matching sections |

Only **published** entries appear on the site. Saving a draft changes nothing until you press Publish.

## One-time setup

### 1. Supabase (database)

1. Create a project at [supabase.com](https://supabase.com/dashboard). Save the database password.
2. Open **Connect** (top bar) and copy the **Session pooler** connection string (port `5432`).
   Use the session pooler, not the direct connection: Render has no IPv6.
3. Replace `[YOUR-PASSWORD]` in it with your password. That is `DATABASE_URL`.

Strapi creates its own tables on first start.

### 2. Cloudflare R2 (images)

1. Cloudflare dashboard → **R2** → **Create bucket**, e.g. `portfolio-media`.
2. Bucket → **Settings → Public access** → enable the **r2.dev subdomain** (or connect a custom domain).
   That URL is `R2_PUBLIC_URL`.
3. Bucket → **Settings → CORS policy** → add this, so the hero ripple (WebGL) can load the portrait:
   ```json
   [{ "AllowedOrigins": ["https://bdk-dev-portfolio.netlify.app", "http://localhost:3000"], "AllowedMethods": ["GET", "HEAD"], "AllowedHeaders": ["*"] }]
   ```
   Add your custom domain to `AllowedOrigins` if you move the site.
4. R2 overview → **Manage API tokens** → **Create API token** with **Object Read & Write**, limited to that
   bucket. Copy the **Access Key ID** and **Secret Access Key**. Your **Account ID** is on the R2 overview page.

### 3. Try it locally (optional, recommended before Render)

```bash
cd cms
npm install
# fill DATABASE_URL and the R2_* values in cms/.env
npm run develop
```

Open http://localhost:1337/admin and create your admin account. Then import the current site content:

```bash
npm run seed
```

This copies everything from `app/content.js` and uploads the images from `/public` to R2, all published.

### 4. Render (hosting the admin)

1. Push the repo to GitHub.
2. [Render](https://dashboard.render.com) → **New → Blueprint** → choose the repo. It reads `render.yaml`.
3. Fill in the secrets it asks for: `DATABASE_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
   `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`. The Strapi keys are generated for you.
4. When it is live, open `https://<your-service>.onrender.com/admin`. If you ran the seed locally against
   the same Supabase project, sign in with the account you created; otherwise create one now.

The free plan sleeps after 15 minutes idle; the admin takes about a minute to wake. Builds of the site
wait for it. If the admin build runs out of memory on the free plan, switch the service to **Starter**.

### 5. Connect the website (Netlify)

1. Netlify → site → **Site configuration → Environment variables** → add
   `STRAPI_URL` = `https://<your-service>.onrender.com` (no trailing slash).
2. Netlify → **Site configuration → Build & deploy → Build hooks** → **Add build hook** (name it
   "Strapi publish", branch `main`). Copy the URL.
3. Strapi admin → **Settings → Webhooks → Create new webhook**: name "Netlify", paste the URL, tick
   **Entry: Publish, Unpublish, Delete** and **Media: Update, Delete**, then Save.
4. Trigger one deploy in Netlify. The build log shows `[cms] …` only if it fell back to `app/content.js`.

## Notes

- Never commit `cms/.env`; it is git-ignored. On Render the secrets live in the service settings.
- `app/content.js` stays as the fallback copy. If you want it to match the admin again, update it by hand.
- Upgrading Strapi: `npm run upgrade` in this folder.
