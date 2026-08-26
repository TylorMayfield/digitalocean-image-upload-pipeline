import { S3Client } from "@aws-sdk/client-s3";

export function spacesClient(env = process.env) {
  return new S3Client({
    region: "us-east-1",
    endpoint: `https://${env.SPACES_REGION}.digitaloceanspaces.com`,
    credentials: { accessKeyId: env.SPACES_KEY, secretAccessKey: env.SPACES_SECRET },
  });
}

export function spacesConfig(env = process.env) {
  const required = ["SPACES_BUCKET", "SPACES_REGION", "SPACES_KEY", "SPACES_SECRET", "SPACES_CDN_BASE_URL"];
  const missing = required.filter((key) => !env[key]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  return { bucket: env.SPACES_BUCKET, cdnBaseUrl: env.SPACES_CDN_BASE_URL };
}
