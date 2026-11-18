'use strict';

// Content the portfolio reads at build time. Only published entries are ever returned.
const PUBLIC_READ = [
  'api::site.site.find',
  ...['skill', 'project', 'service', 'testimonial', 'credential'].flatMap((t) => [`api::${t}.${t}.find`, `api::${t}.${t}.findOne`]),
];

module.exports = {
  register() {},

  // Let the website read published content without an API token (it is public on the site anyway).
  async bootstrap({ strapi }) {
    const role = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
    if (!role) return;
    const perms = strapi.db.query('plugin::users-permissions.permission');
    for (const action of PUBLIC_READ) {
      if (!(await perms.findOne({ where: { action, role: role.id } }))) await perms.create({ data: { action, role: role.id } });
    }
  },
};
