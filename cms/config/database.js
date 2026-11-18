// Supabase Postgres. Use the *Session pooler* connection string from Supabase → Connect:
// it works over IPv4 (Render has no IPv6) and supports the prepared statements Strapi uses.
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      connectionString: env('DATABASE_URL'),
      ssl: env.bool('DATABASE_SSL', true) ? { rejectUnauthorized: false } : false,
      schema: env('DATABASE_SCHEMA', 'public'),
    },
    pool: { min: 0, max: env.int('DATABASE_POOL_MAX', 5) }, // the free pooler has few slots
    acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
  },
});
