# Aster — Personalised A Level Learning

Aster is an adaptive A Level learning coach. The current release focuses on
Biology 9477 and combines syllabus-aligned question packs, structured marking,
reliable mastery decisions, source images, and an owner-only student activity
dashboard.

Live site: <https://aster-a-level-coach.ezbzz.chatgpt.site/>

## What is included

- 13 mature Biology packs with 390 questions
- six question formats across mature packs
- rubric-based marking for structured and practical questions
- adaptive practice that skips reliably mastered content
- first-time student registration and teacher activity reporting
- Cloudflare D1 and R2 bindings managed by OpenAI Sites

Production student records and uploaded source documents are stored by the
hosted site. They are not committed to this repository.

## Run locally

Requirements: Node.js `>=22.13.0`.

```bash
npm ci
npm test
npm run dev
```

The development server prints the local URL. Local data is separate from the
production site.

## Maintain from another Mac

1. Sign in to GitHub and clone this private repository.
2. Install Node.js 22, then run `npm ci` and `npm test`.
3. Open the cloned folder in Codex while signed in to the same ChatGPT account.
4. Keep `.openai/hosting.json` unchanged so deployments continue to use the
   existing Aster site and its hosted data.
5. Before editing, pull the newest `main`; after a verified release, commit and
   push the change so both Macs stay in sync.

Do not commit `.env` files, local databases, build folders, credentials, or raw
student exports. These are excluded by `.gitignore`.

## Useful commands

- `npm run dev` — start local development
- `npm test` — build and run the automated checks
- `npm run lint` — run code-quality checks
- `npm run db:generate` — generate a migration after a database schema change

## Project map

- `app/` — interface and server endpoints
- `lib/` — Biology content, adaptive logic, and marking
- `db/` — schema and question-pack persistence
- `drizzle/` — database migrations
- `public/materials/` — selected source images used by questions
- `tests/` — automated checks
