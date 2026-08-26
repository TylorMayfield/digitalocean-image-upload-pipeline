import assert from "node:assert/strict";
import test from "node:test";
import { Readable } from "node:stream";
import sharp from "sharp";
import { processAsset } from "../packages/image/process.js";

test("writes three immutable public WebP variants without enlarging the source", async () => {
  // Generate the smallest valid fixture with the same runtime that processes it.
  const pixel = await sharp({ create: { width: 1, height: 1, channels: 4, background: "#ffffff" } }).png().toBuffer();
  const calls = [];
  const client = {
    async send(command) {
      calls.push(command.input);
      if (calls.length === 1) return { ContentType: "image/png", ContentLength: pixel.length };
      if (calls.length === 2) return { Body: Readable.from(pixel) };
      return {};
    },
  };
  const assetId = "e8a0f0fa-0bc0-4671-8d22-87a5bf36e701";
  const result = await processAsset({ assetId, client, bucket: "images", cdnBaseUrl: "https://images.nyc3.cdn.digitaloceanspaces.com" });
  assert.deepEqual(result.variants.map((variant) => variant.width), [400, 800, 1600]);
  assert.deepEqual(result.variants.map((variant) => variant.actualWidth), [1, 1, 1]);
  const writes = calls.slice(2);
  assert.equal(writes.length, 3);
  assert.ok(writes.every((write) => write.ACL === "public-read" && write.CacheControl === "public, max-age=31536000, immutable"));
  assert.deepEqual(writes.map((write) => write.Key), [`images/${assetId}/400.webp`, `images/${assetId}/800.webp`, `images/${assetId}/1600.webp`]);
});
