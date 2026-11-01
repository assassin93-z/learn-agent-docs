# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary users are Chinese- and English-reading learners who have access to
the private TypeScript source repository and want to understand agent
architecture through eleven incremental lessons. Public visitors without source
access can still read the concepts and architecture guidance, but they cannot
run the documented examples from this site alone.

## Product Purpose

Learn Agent is a bilingual course reading site that explains how a TypeScript
agent is assembled one capability at a time. It exists to make each architectural
step understandable, comparable, and verifiable without presenting the teaching
project as a production agent or a security sandbox.

Success means readers can follow the learning path, understand how the eleven
capabilities compose, compare the TypeScript implementation with the referenced
Python course, and use the private source checkout when they need to run an
example.

## Positioning

The site teaches agent architecture through small, cumulative TypeScript
capabilities with explicit verification and security boundaries. It favors
explainable construction and documented tradeoffs over a broad feature catalog
or a production-readiness claim.

## Operating Context

- The site is a static VitePress publication deployed to GitHub Pages under
  `/learn-agent-docs/`.
- Chinese is the default language and English lives under `/en/`; the authored
  course content is maintained as fifteen Chinese/English page pairs.
- Readers navigate a learning path, architecture and course-map guides, eleven
  lessons, local search, page outlines, and previous/next lesson links.
- Commands in the lessons run against a separate private TypeScript source
  checkout. The website itself never runs agents, model calls, Telegram bots,
  tools, or background tasks.

## Capabilities and Constraints

- VitePress 1.6 and Vue 3 build the site; Node.js 22.16+, 24, or 26+ and pnpm
  11.22.0 are the supported local toolchain.
- Course pages are whitelist exports from the private source repository and must
  not be edited as an independent second source of truth.
- Chinese and English pages must remain structurally aligned, with matching code
  examples and working language counterparts.
- Only public course documents, site configuration, approved dependencies, and
  publication checks belong in this repository. Private source, Git history,
  credentials, machine state, and unrelated data must not be published.
- GitHub Pages uses the fixed `/learn-agent-docs/` base path, so asset, route, and
  language-switch links must be verified against that path.
- Publication checks cover tests, privacy scanning, dependency notices,
  production build output, links, language counterparts, and static artifacts.
  Automated scanning is a guardrail, not proof that content is safe to publish.

## Brand Commitments

- The product name is `Learn Agent`; the site title treatment is `LEARN / AGENT`.
- The voice is instructional, precise, incremental, and candid about limitations.
- The durable promise is expressed by the existing line: "One capability. One
  verified step." / "一项能力，一次验证。"
- References to the Nami Agent course must remain attributed, and the site must
  not imply ownership of its downloadable Python materials or third-party assets.

## Evidence on Hand

- The repository contains the bilingual course overview, three guide pairs,
  eleven lesson pairs, VitePress navigation metadata, and local-search content.
- `README.md` and `README_EN.md` define the publication boundary, supported
  toolchain, deployment path, and security expectations.
- Automated tests and build scripts verify the publishable file set, notices,
  routes, language switching, and generated site artifacts.
- There are no testimonials, customer claims, usage benchmarks, production-agent
  claims, or public access to the private TypeScript source. Future UI work must
  not fabricate them.

## Product Principles

1. Teach one explainable capability at a time, then show how it composes.
2. Keep Chinese and English readers on equivalent learning paths.
3. Make verification steps and security limitations visible rather than implied.
4. Preserve the boundary between public documentation and private runtime code.
5. Prefer truthful course evidence over promotional claims.

## Accessibility & Inclusion

Chinese and English access are both required, including accurate language
metadata and working page-level language switching. No formal accessibility
conformance target has been established yet.
