"use client";

import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Choose a JPEG, PNG, or WebP under 10 MB.");
  const [variants, setVariants] = useState([]);

  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setVariants([]);
    setStatus("Requesting a private upload URL…");
    const start = await fetch("/api/uploads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: file.name, contentType: file.type, bytes: file.size }) });
    const uploadRequest = await start.json();
    if (!start.ok) return setStatus(uploadRequest.error);
    setStatus("Uploading the private original to Spaces…");
    const put = await fetch(uploadRequest.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
    if (!put.ok) return setStatus("Spaces rejected the upload. Check the bucket CORS rule and credentials.");
    setStatus("Creating responsive WebP variants…");
    const processed = await fetch(`/api/images/${uploadRequest.assetId}/process`, { method: "POST" });
    const result = await processed.json();
    if (!processed.ok) return setStatus(result.error ?? "Image processing failed.");
    setVariants(result.variants);
    setStatus("Done. The original is private; the variants below are CDN URLs.");
  }

  return <main><h1>Image upload pipeline</h1><p>{status}</p><input aria-label="Choose an image" type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} />
    {variants.length > 0 && <ul>{variants.map((variant) => <li key={variant.width}><a href={variant.url} target="_blank" rel="noreferrer">{variant.width}px WebP ({variant.actualWidth}px output)</a></li>)}</ul>}
  </main>;
}
