# Cacher Frontend React

Frontend for [TJournal and DTF cacher platform](https://cacher.serguun42.ru) built with React 18.

## Configuration, building and launching

All configuration and build or launch scripts ejected with `react-scripts eject` and modified for specific purposes of this project.

### Commands

- `npm i --production` – Install only necessary npm dependencies. Or install everything with `npm i` for development.
- `npm run start` – Start dev server. Files `.env.dtf` and `.env.tj` will not be used so consider creating [local environment file](#local-environment)
- `npm run build:dtf` – Build frontend with [`.env.dtf`](#sites-build-environment)
- `npm run build:tj` – Build frontend with [`.env.tj`](#sites-build-environment)
- `npm run lint` – Check project with `eslint`

### Sites build environment

Files [`.env.dtf`](./.env.dtf) and [`.env.tj`](./.env.tj) contain environment variables for both building scripts and client usage. Some of them:

| variable                  | description                                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `REACT_APP_VERSION`       | Same as in [`package.json`](./package.json). Used for client cache control                                              |
| `BUILD_PATH`              | Build directory for webpack output                                                                                      |
| `GENERATE_SOURCEMAP`      | Explicitly set to `false` (but modification in [`webpack.config.js`](./config/webpack.config.js#L32) allows to skip it) |
| `PUBLIC_URL`              | Root of project                                                                                                         |
| `REACT_APP_SITE_CODE`     | `dtf` or `tj`                                                                                                           |
| `REACT_APP_SITE_SHORT`    | `DTF` or `TJ`                                                                                                           |
| `REACT_APP_SITE_LONG`     | `DTF` or `TJournal`                                                                                                     |
| `REACT_APP_SITE_LINK`     | `dtf.ru` or `tjournal.ru`                                                                                               |
| `REACT_APP_PRIMARY_COLOR` | Hex color, used in [manifest](./config/manifest.template.json) and [`index.html`](./public/index.html) templates        |

You may pass more variables, see standard `react-scripts` and `webpack` docs.

### Local environment

You may create own local env (e.g. [.env.development.local](./.env.development.local)). It needs everything from [build env](#sites-build-environment) and contains optional values:

- set `HTTPS=true` to use https on local development server. If applied, set `SSL_CRT_FILE` and `SSL_KEY_FILE` as paths to certificate and key files.
- `PORT` – port of dev server.
- `API_PROXY_TARGET` and `API_PROXY_COOKIE` – if set, webpack will proxy requests to `/api` to target with stated proxy – see [webpack.createDevServerConfig.js](./config/webpack.createDevServerConfig.js#L78).
- `DISABLE_ESLINT_PLUGIN=true` – disables esling plugin for webpack (warning overlay).

### Manifest and PWA

Manifest is built with `npm run build` from [template](./config/manifest.template.json) in [`scripts/build`](./scripts/build.js#L213). PWA is yet to be done.

## API

OpenAPI docs available at [`api.yml`](./public/docs/api.yml). Project uses Swagger UI to build human-readable documentation pages. Redoc is yet to do.

- `npm exec -- ts-to-openapi -f types/*.d.ts` – Convert Typescript defenitions to YAML format.

#### [BSL-1.0 License](./LICENSE)
