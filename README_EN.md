# Learn Agent · Documentation Site

<p align="center"><a href="README.md">中文</a> &middot; English</p>

This is the publishing repository for the [Learn Agent reading site](https://assassin93-z.github.io/learn-agent-docs/).
VitePress builds eleven agent architecture lessons into a static website. Chinese is the default;
English pages live under `/en/`.

## Publication Scope

Only course documentation, website configuration, and publication checks are public here.
The TypeScript runtime and Git history of `learn-agent` remain in the private source repository;
publishing documentation does not grant public access to them. Commands in course pages assume
that the reader already has source access. The website does not execute an agent, model request,
Telegram bot, or background task, and it does not store model credentials.

The course references the [public Nami Agent course](https://namiai.tech/agent/). This repository
does not redistribute its Python archive or third-party images. Referenced materials retain their
existing terms; this documentation repository does not grant a new license for private code.
Complete dependency copyrights and licenses are included in [third-party notices](docs/public/THIRD_PARTY_NOTICES.txt) and published with the website.

## Updating Content

The original project's fifteen Chinese/English Markdown pairs are the single authored course source.
A whitelist exporter synchronizes them into `docs/`. Do not manually edit generated course pages,
copy the complete private repository, or import its Git history. This repository's README and site
configuration describe publishing; they are not another copy of the course body.

Use Node.js 22 (22.16+), 24, or 26+ and pnpm 11.22.0. Install, check, and preview:

```bash
pnpm install --frozen-lockfile --registry=https://registry.npmjs.org
pnpm check
pnpm docs:preview
```

`pnpm check` runs isolated tests, publication source scanning, third-party license completeness
checks, a production build, checks links and language counterparts across all thirty pages, and
scans static artifacts including the search index. `pnpm docs:build` also performs a read-only
notices check before building; drift blocks the build. After upgrading dependencies, run
`pnpm notices:generate`, review the changes, and commit the notices with the lockfile.
Use `pnpm docs:dev` for local development.

## Deployment And Safety

GitHub Actions builds main-branch changes and publishes static output through GitHub Pages.
The project base path is `/learn-agent-docs/`. Validate assets and chapter links when changing it.

Never commit credentials, private state, machine configuration, local workflow files, or unrelated
data. Only public npm registry dependencies and reviewed documents belong in publication output;
`pnpm-lock.yaml` is the sole dependency lockfile. `pnpm-workspace.yaml` approves only the required
`esbuild` dependency build; do not allow every dependency script. It also omits exactly one optional
dependency, `@napi-rs/lzma-linux-x64-gnu`, a compression tool for Rollup's upstream cross-build
process that neither this site's build nor its pages use. Its published archive lacks a complete
copyright license file, so it is not installed or published; no replacement license is inferred.
Do not expand the optional-dependency ignore list and hide new license issues. Scanning is a
guardrail, not proof that every secret can be recognized. Review the intended diff before committing.
