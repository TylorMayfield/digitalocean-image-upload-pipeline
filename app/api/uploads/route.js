import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { originalKey, validateUpload } from "../../../lib/image-pipeline.mjs";
import { spacesClient, spacesConfig } from "../../../lib/spaces.mjs";

export async function POST(request) {
  try {
    const input = await request.json();
    const error = validateUpload(input);
    if (error) return Response.json({ error }, { status: 400 });
    const assetId = crypto.randomUUID();
    const { bucket } = spacesConfig();
    const uploadUrl = await getSignedUrl(spacesClient(), new PutObjectCommand({ Bucket: bucket, Key: originalKey(assetId), ContentType: input.contentType, ACL: "private" }), { expiresIn: 300 });
    return Response.json({ assetId, uploadUrl });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not create an upload URL." }, { status: 500 });
  }
}
