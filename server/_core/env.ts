export const ENV = {
  // Core settings
  appId: process.env.APP_ID || "zopu-market",
  jwtSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // S3 Storage (for file uploads - works with AWS S3 or Cloudflare R2)
  s3Bucket: process.env.S3_BUCKET ?? "",
  s3Region: process.env.S3_REGION ?? "auto",
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  s3Endpoint: process.env.S3_ENDPOINT ?? "", // Required for R2: https://ACCOUNT_ID.r2.cloudflarestorage.com
  s3PublicUrl: process.env.S3_PUBLIC_URL ?? "", // Public URL for serving files: https://pub-xxx.r2.dev

  // AI/LLM API (optional - for AI features)
  forgeApiUrl: process.env.FORGE_API_URL ?? "",
  forgeApiKey: process.env.FORGE_API_KEY ?? "",

  // Email (optional - for transactional emails)
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: process.env.SMTP_PORT ?? "587",
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  smtpFrom: process.env.SMTP_FROM ?? "noreply@zopumarket.com",
};
