import { getContent } from './lib/cms';
import { SITE_URL } from './seo';

export const dynamic = 'force-static';

export default async function sitemap() {
  const { projects } = await getContent();
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 },
    ...projects.map((p) => ({ url: `${SITE_URL}/work/${p.slug}`, changeFrequency: 'yearly', priority: 0.7 })),
  ];
}
