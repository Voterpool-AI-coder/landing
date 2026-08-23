# Voterpool Landing [voterpool.tech](https://voterpool.tech)

Static marketing site for [Voterpool](https://github.com/Voterpool/Voterpool) — an autonomous consensus engine for AI agents.

Single page, zero backend. Built with Next.js App Router and exported to plain HTML/CSS/JS, deployable to any static host (GitHub Pages, Nginx, S3, CDN).

## Stack

| Layer     | Choice                                                                         |
| --------- | ------------------------------------------------------------------------------ |
| Framework | Next.js 16 (App Router, Turbopack build)                                       |
| UI        | React 19                                                                       |
| Language  | TypeScript 5                                                                   |
| Styling   | Tailwind CSS 4 (CSS-first config, no tailwind.config)                          |
| Animation | framer-motion 12                                                               |
| Fonts     | Geist / Geist Mono via `next/font` (self-hosted, `latin` + `cyrillic` subsets) |

## Requirements

- Node.js ≥ 20.9
- yarn 1.x or npm (repo ships a `yarn.lock`; CI uses yarn)

## Quick start

```bash
yarn install          # or: npm install
yarn dev              # dev server with HMR on http://localhost:3000
```

## Scripts

| Command      | What it does                                                        |
| ------------ | ------------------------------------------------------------------- |
| `yarn dev`   | Dev server (Turbopack), hot reload                                  |
| `yarn build` | Production build → **static export into `out/`**                    |
| `yarn start` | Serve the production build (requires a non-export setup; see below) |
| `yarn lint`  | ESLint 9 (flat config, `eslint-config-next` + core-web-vitals + TS) |

Type checking is not part of `yarn build` — run it explicitly:

```bash
npx tsc --noEmit
```

Build result:

```
out/
├── index.html          # the whole site
├── 404.html            # fallback page for static hosts
├── logo-svg.svg        # transparent brand logo
└── _next/…             # hashed JS/CSS chunks
```

Preview the production output locally:

```bash
npx serve out           # any static file server works
```

## Deployment

CI (`.github/workflows/nextjs.yml`) builds on push to `main` with yarn and deploys `out/` to GitHub Pages via `actions/deploy-pages`. Enable **Settings → Pages → Source: GitHub Actions** once.

Hosting under a subpath (e.g. `user.github.io/voterpool-landing`)? Set it before building:

```ts
// next.config.ts
basePath: '/voterpool-landing',
```

Any other static host works the same way: upload the contents of `out/`, point 404s at `404.html`.

## License

Apache-2.0 — see the upstream [Voterpool repository](https://github.com/Voterpool/Voterpool).
