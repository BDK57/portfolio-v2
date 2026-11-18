'use strict';

/*
 * One-time import of the portfolio's current content (app/content.js + images in /public) into Strapi.
 *   npm run seed            imports everything and publishes it
 *   npm run seed -- --force imports even if projects already exist (creates duplicates; use on an empty DB)
 *   npm run seed -- --reset deletes all site content and the images stored on this computer, then imports again
 *                           (use after a seed that ran before R2 was configured, so the images land in R2)
 * Run it locally with cms/.env pointing at Supabase and R2, so the uploads land in the bucket.
 */
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const SITE_ROOT = path.resolve(__dirname, '../..');
const PUBLIC = path.join(SITE_ROOT, 'public');
const MIME = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.avif': 'image/avif' };

async function main() {
  const content = await import(pathToFileURL(path.join(SITE_ROOT, 'app/content.js')).href);
  const seo = await import(pathToFileURL(path.join(SITE_ROOT, 'app/seo.js')).href);
  const si = await import('simple-icons');

  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = 'error';
  try {
    const docs = (uid) => app.documents(uid);
    if (process.argv.includes('--reset')) await reset(app);
    if ((await docs('api::project.project').count()) && !process.argv.includes('--force')) {
      console.log('Projects already exist: nothing imported. Use --force on an empty database to import anyway.');
      return;
    }

    // Uploads a file from /public once (matched by file name), returning its id.
    const uploaded = new Map();
    async function upload(publicPath, alt = '') {
      if (!publicPath) return null;
      const file = path.join(PUBLIC, publicPath);
      if (!fs.existsSync(file)) return console.warn(`  missing ${publicPath}, skipped`), null;
      if (uploaded.has(file)) return uploaded.get(file);
      const name = path.basename(file);
      const existing = await app.db.query('plugin::upload.file').findOne({ where: { name } });
      const id = existing?.id ?? (await app.plugin('upload').service('upload').upload({
        data: { fileInfo: { name, alternativeText: alt, caption: '' } },
        files: { filepath: file, originalFilename: name, originalFileName: name, mimetype: MIME[path.extname(name)] || 'application/octet-stream', size: fs.statSync(file).size },
      }))[0].id;
      uploaded.set(file, id);
      console.log(`  uploaded ${publicPath}`);
      return id;
    }
    const create = (uid, data) => docs(uid).create({ data, status: 'published' });
    const labels = (list = []) => list.map((text) => ({ text }));
    const slugOf = (iconPath) => Object.values(si).find((i) => i?.path === iconPath)?.slug;

    const { site } = content;
    console.log('Site settings');
    await create('api::site.site', {
      name: site.name, fullName: site.fullName, role: site.role, location: site.location, intro: site.intro,
      email: site.email, github: site.github, linkedin: site.linkedin,
      currentlyTitle: site.currently.title, currentlyCompany: site.currently.company,
      aboutHeading: site.about.heading, aboutBody: site.about.body,
      stack: labels(content.stack),
      seoTitle: seo.SITE_TITLE, seoDescription: seo.SITE_DESCRIPTION,
      portrait: await upload('/hero.webp', `Portrait of ${site.fullName}`),
      ogImage: await upload(seo.OG_IMAGE.url, seo.OG_IMAGE.alt),
    });

    console.log('Skills');
    for (const [order, s] of content.skills.entries()) {
      await create('api::skill.skill', { name: s.name, iconSlug: slugOf(s.icon) || '', core: !!s.core, order });
    }

    console.log('Projects');
    for (const [order, p] of content.projects.entries()) {
      const og = p.shots.desktop && p.shots.desktop.replace('/shots/', '/og/').replace('-desktop.webp', '.jpg');
      await create('api::project.project', {
        title: p.title, slug: p.slug, order, kind: p.kind, url: p.url, client: p.client, industry: p.industry,
        role: p.role, summary: p.summary, overview: (p.overview || []).join('\n\n'),
        tags: labels(p.tags), highlights: (p.highlights || []).map(({ title, text }) => ({ title, text })),
        cover: await upload(p.img, `${p.title} website preview`),
        shotDesktop: await upload(p.shots.desktop, `${p.title} homepage`),
        shotMobile: await upload(p.shots.mobile, `${p.title} on mobile`),
        ogImage: await upload(og, `${p.title} website`),
      });
      console.log(`  ${p.title}`);
    }

    console.log('Services, testimonials, education');
    for (const [order, s] of content.services.entries()) {
      await create('api::service.service', { label: s.label, title: s.title, blurb: s.blurb, points: labels(s.points), featured: !!s.featured, order });
    }
    for (const [order, t] of content.testimonials.entries()) {
      await create('api::testimonial.testimonial', { quote: t.quote, name: t.name, role: t.role, order });
    }
    for (const [order, c] of content.credentials.entries()) {
      await create('api::credential.credential', { title: c.title, institution: c.where, order });
    }
    console.log('Done. Everything is published.');
  } finally {
    await app.destroy();
  }
}

// Removes every entry of the site's content types, plus media still stored on the local disk
// (files already in R2 are kept). Admin users and settings are untouched.
async function reset(app) {
  const types = ['site', 'skill', 'project', 'service', 'testimonial', 'credential'];
  console.log('Reset');
  for (const t of types) {
    const uid = `api::${t}.${t}`;
    let removed = 0;
    for (let batch; (batch = await app.documents(uid).findMany({ fields: ['documentId'], limit: 100 })).length; ) {
      for (const { documentId } of batch) await app.documents(uid).delete({ documentId });
      removed += batch.length;
    }
    console.log(`  removed ${removed} ${t} entr${removed === 1 ? 'y' : 'ies'}`);
  }
  const local = await app.db.query('plugin::upload.file').findMany({ where: { provider: 'local' } });
  for (const file of local) await app.plugin('upload').service('upload').remove(file);
  console.log(`  removed ${local.length} locally stored media records`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
