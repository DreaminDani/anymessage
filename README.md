# AnyMessage

AnyMessage lets anybody send and receive messages across a number of providers in a single, convenient, web interface. It is open source and free to use. A hosted version is available at [AnyMessage.io](http://www.anymessage.io). Support services and custom licenses are available for both hosted and self-hosted customers.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

- [Docker](https://www.docker.com/) installed locally
- An account on [Auth0](https://auth0.com/) for user management.

### Running the app

If you're developing a local copy, it is recommend that you build the app using the included `Dockerfile`s. For convenience, a `docker-compose.yml` has been included in this repository. It is not guaranteed to work for all configurations and is not recommended for use in production.

1. Create a `.env` file in this repository's root with the following values (`[]` are placeholders only)

```
AUTH0_CLIENTID=[get this from auth0]
AUTH0_DOMAIN=[get this from auth0]
POSTGRES_USER=[user name]
POSTGRES_PASSWORD=[example password]
POSTGRES_DATABASE=[database name]
DB_HOST=db
API_PORT=1337
UI_HOSTNAME=[myapp.dev]
```

2. Set up your [local hosts file](https://duckduckgo.com/?q=editing+host+files) or DNS provider to point `www.myapp.dev` and `*.myapp.dev` to `127.0.0.1` (or whatever IP you're running the app on)
    * If your hostfile and/or dns provider does not support wildcard domains, you'll need to specify the subdomain for each team url you wish to support/test

3. If you have not already, configure your Auth0 settings to allow connections from `*.mydev`.

4. Run `docker-compose build && docker-compose up` from the repository's root.

## Running the tests

Currently, there are very few tests. You can run them via `npm run test` in the relevant subdirectories.

More info will be updated in this section as the testing strategy is built out.

### Linting

Each subdirectory has its own linting rules. They are specified via `tslint.json` (in `api`) and `.eslintrc.json` (in `ui`). It is recommended that you set up your editor to lint automatically. In the future, we'll have CI rules to prevent contributions that break these rules.

## Deployment

You can deploy using the included `docker-compose.yml` file or create a custom configuration on any hosted container service. If you're not making any changes, it is recommended that you use the pre-built docker-containers:
```
docker-compose pull
docker-compose up
```

AnyMessage.io runs on Google Kubernetes Engine but should work anywhere docker containers are supported. If you need help with deployment, feel free to reach out!

## Built With

* [Next.js](https://nextjs.org/)
* [Express](https://expressjs.com/)
* [TypeScript](https://www.typescriptlang.org/)
* [PostgreSQL](https://www.postgresql.org/)
* [Sqitch](https://sqitch.org/)

## Contributing

Anybody can [make a pull request](https://github.com/d3sandoval/anymessage/compare)! The code you contribute is yours to own, reuse and sell separately. Note that, since AnyMessage offers a hosted service, your code may be used by free ("Self-hosted") users as well as paying users on [AnyMessage.io](http://www.anymessage.io).

For more info see section "2.2 Contributor Grant" of [LICENSE.md](LICENSE.md).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Daniel Eric Sandoval** - [DESandoval.net](https://desandoval.net)

See also the list of [contributors](https://github.com/d3sandoval/anymessage/contributors) who participated in this project.

## License

AnyMessage is distributed under the Common Public Attribution License Version 1.0 (CPAL) and is also available under alternative licenses negotiated directly with AnyMessage.io. If you obtained AnyMessage under the CPAL, then the CPAL applies to all running versions of AnyMessage on your local computer or network distribution. The CPAL is included in this source tree in the file [LICENSE.md](LICENSE.md).

This software also includes various components that are not part of AnyMessage itself; these components are specified in `package.json` and `docker-compose` files and are distributed in accordance with their individual licensing terms.

Daniel Eric Sandoval holds copyright and/or sufficient licenses to all components of the AnyMessage software, and therefore can grant, at his sole discretion, the ability for companies, individuals, or organizations to create proprietary or Open Source (even if not CPAL) extensions and contributions.

If you wish to use contributions *you have made* to this code in your own Open Source or Commercial software, you are free to do so under the CPAL.

The 'AnyMessage' name and logos are owned by Daniel E. Sandoval. If you wish to use these trademarks for purposes other than for the purpose of identifying the source of this code, please contact daniel@anymessage.io directly.
