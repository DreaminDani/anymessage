### About this documentation

These docs are built with Jekyll and deployed to netlify automatically. A GitHub action uses the /docs Dockerfile to build the API documentation from swagger and typedoc. All other docs are generated via Jekyll.

#### Contributing

To contribute to the docs, simply add a post to /docs/_posts. The following categories are supported:
- help
- deployment

If you are only changing markdown files or site pages, you can make a PR directly to the `docs` branch for review. If you are changing documentation within the code (using swagger or typescript), please make a PR into `master` so the code can be reviewed alongside the documentation updates.

#### Running locally

To see your changes to docs locally, simply run `docker-compose up` from the `/docs` directory. This will startup a jekyll server on `localhost:7000` to work with.

To generate the `swagger` and `typedoc` documentation, run `npm run build` from the `/docs/_build` directory. The running jekyll container should detect this change and rebuild accordingly.