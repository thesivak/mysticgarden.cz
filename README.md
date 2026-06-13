# Mystic Garden

Static Astro rebuild of `mysticgarden.cz`, using markdown content and Cloudflare Pages Functions for the inquiry form.

## Local development

```sh
npm install
npm run dev
```

## Content editing

- Homepage copy: `src/content/pages/home.md`
- Specialty cards: `src/content/specialties/*.md`
- Process steps: `src/content/process/*.md`
- Services carousel: `src/content/services/*.md`
- Blog collection: `src/content/blog/*.md`

The homepage blog section renders only when at least one non-draft markdown post exists in `src/content/blog`. With no article files, no blog section appears on the homepage. The newsletter is intentionally removed from the first static rebuild because it was not active on the homepage.

## Build

```sh
npm run build
npm run preview
```

## Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Framework preset: Astro
- Production branch: the GitHub branch used for production

Set these Cloudflare environment variables/secrets:

- `PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
- `CONTACT_RATE_LIMIT`

The inquiry form posts to `/api/contact`, verifies Turnstile, rejects unexpected fields and honeypot submissions, validates field lengths, and sends email through Resend. Secrets must stay in Cloudflare Pages settings, not in Git.
