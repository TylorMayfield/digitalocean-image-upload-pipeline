# Image upload pipeline

A Next.js API signs uploads into private Spaces objects. A secured Function reads each original and writes public 400, 800, and 1600 pixel WebP variants. The browser receives upload and image URLs. Storage credentials and the Function token stay on the server.

## Read the guide

Follow the [image upload guide](https://www.tylor.nz/content/build-image-upload-optimization-pipeline) for the storage permissions, deployment steps, and one-image acceptance test.

## Disclosure

I am a DigitalOcean affiliate. If you use the affiliate link below, I may earn a commission at no additional cost to you.

[Visit DigitalOcean](https://www.tylor.nz/go/digitalocean?utm_source=github&utm_medium=affiliate&utm_campaign=digitalocean-guides&utm_content=build-image-upload-optimization-pipeline&product=app-platform&placement=companion-readme). Sign in or create an account, then open App Platform to deploy your copy of this repository.

## Prepare storage

Create a standard Spaces bucket and enable its CDN. Disable file listing and keep originals private. Configure CORS to allow `PUT` and `Content-Type` from your deployed web origin. Add `http://localhost:3000` only if you use the optional local web app.

Choose one non-sensitive JPEG, PNG, or WebP below 10 MB for the first test. This starter needs authentication, quotas, and abuse controls before you accept public uploads.

## Deploy both components on App Platform

This is the primary deployment path. It uses GitHub and the App Platform dashboard, without doctl or a separate Functions namespace.

1. Copy this starter to your own GitHub repository. Replace both `REPLACE_WITH_YOUR_GITHUB_REPOSITORY` entries in `.do/app.yaml` with your `owner/repository`, then commit the file.
2. Create an App Platform app from the repository. Review the spec before deployment. It must include `web` with source `/` and `image-functions` with source `/functions`. Add the Functions component from the same repository if it was not detected.
3. Add the variables below as encrypted variables on the specified components. Never commit their values. Leave `FUNCTION_URL` unset for the first deployment. The web page can start, but processing is unavailable until you set it.
4. Deploy both components. App Platform builds the Function remotely, including Sharp's native dependencies. Check the Function build logs before continuing.
5. Copy the web URL for `image/process` from the Functions component. Set it as `FUNCTION_URL` on `web`, then redeploy the web service.
6. Add the deployed web origin to the bucket's CORS rule and perform the acceptance test below.

| Variable | Web service | Functions component |
| --- | --- | --- |
| `SPACES_BUCKET`, `SPACES_REGION` | Set | Set |
| `SPACES_KEY`, `SPACES_SECRET` | Set as secrets | Set as secrets |
| `SPACES_CDN_BASE_URL` | Set | Set |
| `FUNCTION_AUTH_TOKEN` | Same long random secret | Same long random secret |
| `FUNCTION_URL` | Set after Function deployment | Not needed |

The action requires `X-Require-Whisk-Auth`. Only the server-side processing route supplies this header. Do not expose the token or call the Function from the browser.

See [DigitalOcean's App Platform Functions deployment instructions](https://docs.digitalocean.com/products/functions/how-to/deploy-to-app-platform/). `doctl serverless deploy` deploys into a connected standalone namespace and is a different workflow.

## Optional local web app

First deploy the Functions component using the steps above. Copy `.env.example` to `.env.local` and set its variables, including that deployed Function URL and token. From the repository root, run `npm ci`, `npm test`, then `npm run dev`. Local web requests use the deployed Function and can incur charges. This does not emulate Functions locally.

## Verify before expanding

Upload one image. Confirm that the original under `uploads/` cannot be opened anonymously, while each generated WebP URL under `images/` loads through the CDN in a private browser window. Confirm a missing or incorrect Function token fails closed. Check unsupported-file and 10 MB limits. Delete the disposable objects after testing.

These checks cover this starter's upload path. Add account authorization, rate limits, content scanning, deletion, and a durable queue where required before using it for public uploads.
