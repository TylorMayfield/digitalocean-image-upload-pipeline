import assert from "node:assert/strict";
import test from "node:test";
import { MAX_UPLOAD_BYTES, createVariantManifest, originalKey, validateUpload, variantKey } from "../lib/image-pipeline.mjs";

test("accepts supported images within the upload limit", () => {
  assert.equal(validateUpload({ filename: "portrait.png", contentType: "image/png", bytes: MAX_UPLOAD_BYTES }), null);
});

test("rejects unsupported types and invalid sizes", () => {
  assert.match(validateUpload({ filename: "video.mp4", contentType: "video/mp4", bytes: 10 }), /Only JPEG/);
  assert.match(validateUpload({ filename: "large.jpg", contentType: "image/jpeg", bytes: MAX_UPLOAD_BYTES + 1 }), /10 MB/);
});

test("builds deterministic private and public object keys", () => {
  const id = "e8a0f0fa-0bc0-4671-8d22-87a5bf36e701";
  assert.equal(originalKey(id), `uploads/${id}/original`);
  assert.equal(variantKey(id, 800), `images/${id}/800.webp`);
});

test("creates a CDN manifest for every processed variant", () => {
  const variants = createVariantManifest("https://assets.nyc3.cdn.digitaloceanspaces.com/", "e8a0f0fa-0bc0-4671-8d22-87a5bf36e701", [{ width: 400, actualWidth: 400 }, { width: 800, actualWidth: 800 }, { width: 1600, actualWidth: 1200 }]);
  assert.deepEqual(variants.map((variant) => variant.width), [400, 800, 1600]);
  assert.equal(variants[2].actualWidth, 1200);
  assert.match(variants[0].url, /images\/e8a0f0fa-0bc0-4671-8d22-87a5bf36e701\/400\.webp$/);
});
