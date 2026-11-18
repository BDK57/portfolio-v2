// The admin previews uploaded images from the R2 public URL, so the security policy must allow that host.
module.exports = ({ env }) => {
  const r2 = env('R2_PUBLIC_URL') ? new URL(env('R2_PUBLIC_URL')).origin : null;
  const media = ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', ...(r2 ? [r2] : [])];
  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: { 'connect-src': ["'self'", 'https:'], 'img-src': media, 'media-src': media, upgradeInsecureRequests: null },
        },
      },
    },
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};
