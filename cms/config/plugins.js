const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedTypes = [
  'image/svg+xml',
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        httpOnly: true,
      },
    },
  },
  upload: {
    config: {
      // Cloudflare R2 (S3-compatible). Without R2 settings, uploads fall back to cms/public/uploads (local dev only:
      // Render's disk is wiped on every deploy).
      ...(env('R2_BUCKET') && {
        provider: 'aws-s3',
        providerOptions: {
          baseUrl: env('R2_PUBLIC_URL'), // the bucket's public r2.dev URL or custom domain
          s3Options: {
            endpoint: `https://${env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
            region: 'auto',
            forcePathStyle: true,
            credentials: { accessKeyId: env('R2_ACCESS_KEY_ID'), secretAccessKey: env('R2_SECRET_ACCESS_KEY') },
            // Only send checksums R2 asks for (newer AWS SDKs add extra ones by default).
            requestChecksumCalculation: 'WHEN_REQUIRED',
            responseChecksumValidation: 'WHEN_REQUIRED',
            params: { Bucket: env('R2_BUCKET'), ACL: undefined }, // R2 has no ACLs; the key must exist to stop the default public-read header
          },
        },
      }),
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes,
      },
    },
  },
});
