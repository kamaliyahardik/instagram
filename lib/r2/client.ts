import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export function r2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME,
  );
}

export async function r2PutTemp(key: string, body: Uint8Array | Buffer, contentType: string) {
  const c = client();
  await c.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: `${process.env.R2_TEMP_PREFIX ?? "downloads/"}${key}`,
      Body: body as Uint8Array,
      ContentType: contentType,
    }),
  );
  return key;
}

export async function r2SignedDownloadUrl(key: string): Promise<string> {
  const c = client();
  const ttl = Number(process.env.R2_SIGNED_URL_TTL_SECONDS ?? 3600);
  return getSignedUrl(
    c,
    new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: `${process.env.R2_TEMP_PREFIX ?? "downloads/"}${key}`,
    }),
    { expiresIn: ttl },
  );
}
