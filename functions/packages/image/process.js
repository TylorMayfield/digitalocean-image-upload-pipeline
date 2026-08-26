import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const widths = [400, 800, 1600];
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 10 * 1024 * 1024;

function config(env = process.env) {
  const required = ["SPACES_BUCKET", "SPACES_REGION", "SPACES_KEY", "SPACES_SECRET", "SPACES_CDN_BASE_URL"];
  const missing = required.filter((key) => !env[key]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  return { bucket: env.SPACES_BUCKET, cdnBaseUrl: env.SPACES_CDN_BASE_URL.replace(/\/$/, ""), client: new S3Client({ region: "us-east-1", endpoint: `https://${env.SPACES_REGION}.digitaloceanspaces.com`, credentials: { accessKeyId: env.SPACES_KEY, secretAccessKey: env.SPACES_SECRET } }) };
}

async function asBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export async function processAsset({ assetId, client, bucket, cdnBaseUrl }) {
  if (!UUID.test(assetId)) throw new Error("Invalid asset ID.");
  const sourceKey = `uploads/${assetId}/original`;
  const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: sourceKey }));
  if (!allowedTypes.has(head.ContentType) || !head.ContentLength || head.ContentLength > maxBytes) throw new Error("The stored object is not an allowed image within the 10 MB limit.");
  const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: sourceKey }));
  const original = await asBuffer(object.Body);
  const variants = [];
  for (const width of widths) {
    const output = await sharp(original).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
    const key = `images/${assetId}/${width}.webp`;
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: output.data, ContentType: "image/webp", ACL: "public-read", CacheControl: "public, max-age=31536000, immutable" }));
    variants.push({ width, actualWidth: output.info.width, format: "webp", url: `${cdnBaseUrl}/${key}` });
  }
  return { assetId, variants };
}

export async function main(args) {
  try {
    return { body: await processAsset({ assetId: args.assetId, ...config() }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 400, body: { error: error instanceof Error ? error.message : "Image processing failed." } };
  }
}
