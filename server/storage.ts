// S3-compatible storage helpers for file uploads
// Works with AWS S3 or Cloudflare R2

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from './_core/env';

// Initialize S3 client lazily
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (s3Client) return s3Client;

  if (!ENV.s3Bucket || !ENV.s3AccessKeyId || !ENV.s3SecretAccessKey) {
    throw new Error(
      "S3 credentials missing: set S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY"
    );
  }

  const config: ConstructorParameters<typeof S3Client>[0] = {
    region: ENV.s3Region || "auto",
    credentials: {
      accessKeyId: ENV.s3AccessKeyId,
      secretAccessKey: ENV.s3SecretAccessKey,
    },
  };

  // Add custom endpoint for Cloudflare R2 or other S3-compatible services
  if (ENV.s3Endpoint) {
    config.endpoint = ENV.s3Endpoint;
  }

  s3Client = new S3Client(config);

  return s3Client;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * Upload a file to S3/R2
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const client = getS3Client();
  const key = normalizeKey(relKey);

  const command = new PutObjectCommand({
    Bucket: ENV.s3Bucket,
    Key: key,
    Body: typeof data === "string" ? Buffer.from(data) : data,
    ContentType: contentType,
  });

  await client.send(command);

  // Build public URL
  let url: string;
  if (ENV.s3PublicUrl) {
    // Use configured public URL (Cloudflare R2 public bucket)
    url = `${ENV.s3PublicUrl.replace(/\/+$/, "")}/${key}`;
  } else if (ENV.s3Endpoint) {
    // Fallback for custom endpoints
    url = `${ENV.s3Endpoint}/${ENV.s3Bucket}/${key}`;
  } else {
    // Default AWS S3 URL
    url = `https://${ENV.s3Bucket}.s3.${ENV.s3Region}.amazonaws.com/${key}`;
  }

  return { key, url };
}

/**
 * Get a presigned URL for downloading a file from S3/R2
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const client = getS3Client();
  const key = normalizeKey(relKey);

  const command = new GetObjectCommand({
    Bucket: ENV.s3Bucket,
    Key: key,
  });

  // Generate presigned URL valid for 1 hour
  const url = await getSignedUrl(client, command, { expiresIn: 3600 });

  return { key, url };
}
