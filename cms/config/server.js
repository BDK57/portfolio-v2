module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Public address of the admin (Render sets RENDER_EXTERNAL_URL); needed for correct links and cookies.
  url: env('PUBLIC_URL', env('RENDER_EXTERNAL_URL', '')),
  // Render terminates HTTPS in front of the app: trust its forwarded headers so admin login cookies stay secure.
  proxy: { koa: env.bool('IS_PROXIED', env.bool('RENDER', false)) },
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
