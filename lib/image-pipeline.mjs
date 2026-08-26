export const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const VARIANT_WIDTHS = [400, 800, 1600];

export function validateUpload({ filename, contentType, bytes }) {
  if (typeof filename !== "string" || filename.trim().length === 0) return "A filename is required.";
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) return "Only JPEG, PNG, and WebP images are allowed.";
  if (!Number.isInteger(bytes) || bytes <= 0 || bytes > MAX_UPLOAD_BYTES) return "Images must be between 1 byte and 10 MB.";
  return null;
}

export function originalKey(assetId) {
  return `uploads/${assetId}/original`;
}

export function variantKey(assetId, width) {
  return `images/${assetId}/${width}.webp`;
}

export function publicVariantUrl(cdnBaseUrl, assetId, width) {
  return `${cdnBaseUrl.replace(/\/$/, "")}/${variantKey(assetId, width)}`;
}

export function createVariantManifest(cdnBaseUrl, assetId, variants) {
  return variants.map(({ width, actualWidth }) => ({
    width,
    actualWidth,
    format: "webp",
    url: publicVariantUrl(cdnBaseUrl, assetId, width),
  }));
}
