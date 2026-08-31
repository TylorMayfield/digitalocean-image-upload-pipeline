# DigitalOcean image upload pipeline

This is the companion to the tutorial. It stores originals at `uploads/<uuid>/original` with a private ACL and creates public `images/<uuid>/{400,800,1600}.webp` variants that the Spaces CDN can cache.

## Read the guide

[Build an Image Upload and Optimization Pipeline with DigitalOcean](https://www.tylor.nz/content/build-image-upload-optimization-pipeline)

## Disclosure

This README includes a DigitalOcean affiliate link. If you use it, I may earn a commission at no additional cost to you.

[Deploy the starter on DigitalOcean App Platform](https://www.awin1.com/cread.php?s=4757508&v=123996&q=601070&r=3054551)

## Run locally

1. Create a standard Spaces bucket, enable its CDN, disable file listing, and configure CORS to allow `PUT` plus the `Content-Type` header only from `http://localhost:3000` and your deployed App Platform URL.
2. Copy `.env.example` to `.env.local`, set all values, then run `npm ci`, `npm test`, and `npm run dev`.
3. For the Function, run `cd functions && npm ci && doctl serverless deploy . --remote-build`. Remote build is required because Sharp has native dependencies.
4. Set the deployed Function URL as `FUNCTION_URL` in the app and use the same long random `FUNCTION_AUTH_TOKEN` in App Platform and the Function environment. Redeploy the app.

## Deploy on App Platform

Push this directory as a repository, replace the GitHub repository placeholder in `.do/app.yaml`, and create an App Platform app from it. Add every `.env.example` value as an encrypted runtime variable to the appropriate component. Add the Spaces values to both the web service and Function component; add `FUNCTION_URL` and `FUNCTION_AUTH_TOKEN` to the web service; add `FUNCTION_AUTH_TOKEN` to the Function component.

The Function action is web-secured. Only the server-side `/api/images/:assetId/process` route supplies `X-Require-Whisk-Auth`; do not call it from the browser.

## Deployment preflight

Before creating the App Platform app, confirm that `.do/app.yaml` still points to the repository you intend to deploy and that the service uses `/` while the Functions component uses `/functions`. Keep every value in `.env.example` out of Git: add it as an encrypted runtime variable in the App Platform dashboard instead.

Deploy in this order:

1. Run `npm test` from this directory to verify the uploader contract and object-key behavior locally.
2. Deploy the Function with `doctl serverless deploy . --remote-build` from `functions/`, then copy its deployed URL into `FUNCTION_URL` for the web service. The Function uses Sharp and must be verified in that remote runtime rather than a mismatched local native build.
3. Deploy the App Platform service and upload one disposable image.
4. Confirm the original is not publicly reachable, each 400/800/1600 WebP variant loads through the CDN in a private browser window, and a missing or incorrect Function token fails closed.

## Verify before expanding

Upload one image, verify that the `uploads/` object cannot be opened anonymously, then open each returned CDN variant in a private browser window. Reject unsupported files and files larger than 10 MB. Add authentication, rate limiting, malware scanning, deletion, and durable queueing before using this for public user uploads.
