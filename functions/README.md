# Image processing Function

`project.yml` defines `image/process`. Its deployable directory is `packages/image/process/`, which contains the handler, package manifest, and dependency lockfile. The manifest points to `index.js` and includes Sharp. App Platform detects this manifest and installs dependencies inside the Functions runtime during its remote build.

The root package manifest supports local tests only. A single `packages/image/process.js` file would skip the dependency build and would not include Sharp. Keep runtime dependencies inside the function directory.

For local validation, run `npm ci` in this directory, then `npm ci --prefix packages/image/process` and `npm test`. These checks validate the function package and image transformation on your machine. They do not prove that the remote Functions build succeeds or that deployed authentication, Spaces access, and CDN delivery work. Follow the parent README's deployment and one-image test before using the pipeline.

DigitalOcean documents the directory build rules in its [Functions build process reference](https://docs.digitalocean.com/products/functions/reference/build-process/) and the `main` entry point in its [Node.js runtime reference](https://docs.digitalocean.com/products/functions/reference/runtimes/node-js/).
