# Mystic Garden Rebuild Plan

## Goal

Rebuild `mysticgarden.cz` in this repository as a static, markdown-driven website while preserving the existing landing page design from `thesivak/mysticgarden` as closely as possible.

The new site must:

- Match the current landing page visually, section by section.
- Serve editable landing-page copy, specialties, process steps, services, and optional blog content from markdown files committed to GitHub.
- Publish new blog posts by merging new markdown files into the repository if the blog is re-enabled.
- Have no admin area, no database-backed content editing, and no traditional PHP/Laravel runtime.
- Preserve or improve SEO.
- Include a secure inquiry form for customer requests.
- Decide whether the newsletter feature should be removed, kept external, or rebuilt as a serverless integration.

## Agent Execution Contract

A future implementation agent should treat this document as the execution contract for the rebuild. Do not replace the visual design with a new design system. The existing Laravel/Blade site is the design source of truth.

Before coding, the agent must:

- Clone or inspect `https://github.com/thesivak/mysticgarden`.
- Identify all Blade components used by `resources/views/home.blade.php`.
- Inspect the current assets under `public/`.
- Inspect `routes/web.php`, inquiry routes, newsletter routes, and commented blog routes.
- Inspect models and migrations for `LandingHero`, `LandingSpecialty`, `LandingAbout`, `LandingService`, `ProcessStep`, `Inquiry`, `NewsletterSubscriber`, and `BlogArticle`.
- Capture or generate screenshots of the old homepage at desktop and mobile widths if the old app can be run.

Definition of done:

- The Astro site builds from a clean checkout.
- The homepage is visually matched against the old landing page.
- Markdown/frontmatter controls all intended editable content.
- Specialties, process steps, services, and optional blog posts publish from markdown files.
- Inquiry form works through Cloudflare Pages Functions and Resend.
- Newsletter and blog behavior are explicitly decided and reflected in the final implementation.
- SEO, security headers, sitemap, robots, and structured data are implemented.
- Cloudflare Pages deployment configuration is documented and ready.

## Recommended Stack

- Framework: Astro
- Styling: Tailwind CSS
- Content: Astro Content Collections with Markdown or MDX
- Language: TypeScript
- Hosting: Cloudflare Pages
- Contact form runtime: Cloudflare Pages Functions
- Bot protection: Cloudflare Turnstile
- Email delivery: Resend
- Deployment trigger: GitHub merge to the production branch

Astro is the best fit because this is primarily a static content and SEO site. It supports markdown natively, renders static HTML, keeps client JavaScript minimal, and maps well from the current Blade component structure.

## Source Site

The existing GitHub project is a Laravel application using:

- Blade views and Blade components for the landing page.
- Vite, Tailwind CSS, Alpine.js, AOS, and Swiper for frontend behavior.
- Database-backed landing-page sections through models such as `LandingHero`, `LandingSpecialty`, `LandingAbout`, `LandingService`, and `ProcessStep`.
- Database-backed inquiries through an `Inquiry` model.
- Newsletter subscription routes through `NewsletterSubscriber`.
- Blog models and views exist, but the blog routes are currently commented out.
- A server-side inquiry form.

The rebuild should use the existing rendered design, Blade component structure, Tailwind classes, JavaScript behavior, and public assets as the migration source of truth.

Current homepage composition:

- Hero
- Specialties
- Process
- Services
- Inquiry

Currently present but not active on the homepage:

- Newsletter
- Recent blog

## Content Model

All editable website content should live in markdown files under `src/content`.

Suggested structure:

```txt
src/
  content/
    pages/
      home.md
    specialties/
      example-specialty.md
    process/
      step-01.md
    services/
      example-service.md
    blog/
      example-post.md
```

Landing-page content should use structured frontmatter instead of fully free-form markdown. This keeps the design tightly controlled while still allowing copy changes through GitHub.

Example `src/content/pages/home.md`:

```md
---
seo:
  title: "Mystic Garden"
  description: "..."
hero:
  headline: "..."
  subheadline: "..."
  primaryCta: "..."
  backgroundImage: "/images/hero.jpg"
specialties:
  heading: "..."
process:
  heading: "..."
services:
  heading: "..."
inquiry:
  heading: "..."
  description: "..."
---
```

Example specialty:

```md
---
title: "Návrhy zahrad"
description: "Krátký popis služby nebo specializace."
sortOrder: 10
image: "/images/specialties/navrhy-zahrad.jpg"
imageAlt: "Návrh zahrady"
---
```

Example process step:

```md
---
title: "Úvodní konzultace"
stepNumber: 1
sortOrder: 10
icon: "message-circle"
---

Krátký popis kroku.
```

Example blog post, if the blog is re-enabled:

```md
---
title: "Jak připravit zahradu na novou sezónu"
slug: "jak-pripravit-zahradu-na-novou-sezonu"
excerpt: "Praktické tipy pro sezónní péči o zahradu."
publishedAt: 2026-06-13
updatedAt: 2026-06-13
featuredImage: "/images/blog/priprava-zahrady.jpg"
featuredImageAlt: "Příprava zahrady na sezónu"
category: "Péče o zahradu"
tags:
  - zahrada
  - sezóna
  - péče
seo:
  title: "Jak připravit zahradu na novou sezónu | Mystic Garden"
  description: "..."
---

Obsah článku...
```

## Proposed Project Structure

```txt
src/
  components/
    Navbar.astro
    Hero.astro
    Specialties.astro
    Process.astro
    Services.astro
    ServiceCard.astro
    Inquiry.astro
    InquiryForm.astro
    Newsletter.astro
    RecentBlog.astro
    Footer.astro
    Seo.astro
    JsonLd.astro

  content/
    config.ts
    pages/
      home.md
    specialties/
    process/
    services/
    blog/

  layouts/
    BaseLayout.astro
    BlogLayout.astro

  pages/
    index.astro
    blog/
      index.astro
      [slug].astro
    api/
      contact.ts
      newsletter.ts

public/
  images/
  favicon.ico
  robots.txt
```

If the newsletter is removed, omit `Newsletter.astro` and `api/newsletter.ts`. If the blog remains disabled, omit public blog routes but keep the content model available for a later phase only if useful.

## SEO Requirements

The rebuilt site must be statically rendered and crawlable without JavaScript.

Required SEO features:

- Static HTML for homepage and any service/blog pages.
- Unique title and meta description per page.
- Canonical URL per page.
- Open Graph metadata.
- Twitter/X card metadata.
- Generated `sitemap.xml`.
- `robots.txt`.
- `<html lang="cs">`.
- Proper heading hierarchy with one logical `h1` per page.
- Blog publish and modified dates from markdown frontmatter if blog is enabled.
- JSON-LD structured data:
  - `Organization`
  - `LocalBusiness`
  - `WebSite`
  - `Service`
  - `BlogPosting` if blog is enabled
  - `FAQPage` where useful
- Optimized images with explicit dimensions.
- Descriptive image alt text.
- Clean URLs with trailing slashes.
- Internal links from homepage sections to relevant service or article pages.
- No client-side-only rendering for important content.

## Hosting Plan

Host the site on Cloudflare Pages.

Reasons:

- Very low cost for a static business website.
- Global CDN included.
- GitHub-based deployments.
- Static asset hosting without a traditional server.
- Cloudflare DNS, WAF, and rate limiting can protect the site.
- Pages Functions can handle the inquiry form without introducing a full backend.

Expected initial monthly hosting cost: `0 USD`, excluding the domain name.

## Inquiry Form Plan

The inquiry form should be implemented as a Cloudflare Pages Function, not as a PHP endpoint or exposed client-side email call.

Flow:

1. Visitor submits the inquiry form.
2. Browser sends `POST /api/contact`.
3. Cloudflare Pages Function validates the request.
4. Function verifies the Cloudflare Turnstile token.
5. Function rate-limits or rejects suspicious submissions.
6. Function sends a notification email through Resend.
7. Function returns a generic success or failure response.

The Resend API key must only exist as a Cloudflare environment secret. It must never be exposed in browser JavaScript or committed to Git.

Form validation requirements:

- Required fields: name, email or phone, message.
- Optional fields: service type, location, preferred contact method.
- Reject unexpected fields.
- Enforce maximum lengths on every field.
- Validate email format when email is provided.
- Strip control characters.
- Escape all user-provided values in email templates.
- Do not accept file uploads.
- Include a hidden honeypot field.
- Require Cloudflare Turnstile.
- Return generic errors to users.
- Log minimal operational metadata only.

## Newsletter Decision

The current Laravel app includes newsletter subscription and unsubscribe routes. This should not be carried over automatically unless it is still needed.

Recommended options:

- Preferred: remove newsletter from the first static rebuild if it is not active in the current homepage.
- Alternative: use an external email-marketing provider and embed only its safe subscription form.
- Advanced: rebuild newsletter subscribe/unsubscribe as Cloudflare Pages Functions plus an external storage/provider integration.

Avoid storing newsletter subscribers in a self-managed database for this static rebuild unless there is a strong product reason.

## Security Requirements

The static rebuild should remove the main risks of the old server model.

Security principles:

- No Laravel/PHP runtime in production.
- No database.
- No admin area.
- No server-side file uploads.
- No writable webroot.
- No SSH-exposed shared hosting surface for the application.
- No secrets in GitHub or client-side bundles.
- Cloudflare Pages environment variables for secrets.
- Cloudflare Turnstile on inquiry form.
- Rate limiting on `POST /api/contact`.
- Strict Content Security Policy where practical.
- Security headers:
  - `Content-Security-Policy`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Strict-Transport-Security`
- Dependency updates through normal GitHub PR flow.

## Migration Phases

### Phase 1: Baseline Project

- Initialize Astro with TypeScript.
- Add Tailwind CSS.
- Configure formatting and linting.
- Add content collections.
- Add base layout and SEO component.
- Configure static output.
- Add README instructions for local development, content editing, build, and deployment.

### Phase 2: Asset and Design Port

- Copy current public images and favicon assets.
- Port Blade components into Astro components:
  - navbar
  - hero
  - specialties
  - process
  - services
  - inquiry
  - footer
- Preserve Tailwind classes and section ordering.
- Recreate AOS/Swiper behavior only where it contributes to the visible design.
- Verify desktop and mobile screenshots against the old site.

### Phase 3: Markdown Content

- Create `home.md` for editable landing-page copy.
- Create schemas for specialties, process steps, services, and optional blog posts.
- Convert existing database/seed content into markdown files where source content is available.
- Build blog index and detail pages only if blog is re-enabled.
- Decide whether service pages are needed for SEO.

### Phase 4: SEO

- Add per-page metadata.
- Generate sitemap.
- Add robots file.
- Add JSON-LD structured data.
- Add canonical URLs.
- Verify heading structure.
- Verify image alt text.
- Run Lighthouse checks.

### Phase 5: Inquiry Form

- Add inquiry form UI matching the old design.
- Add Cloudflare Pages Function at `/api/contact`.
- Add Resend integration.
- Add Turnstile verification.
- Add validation, honeypot, and rate limiting.
- Test spam rejection and successful email delivery.

### Phase 6: Deployment

- Connect GitHub repository to Cloudflare Pages.
- Configure build command and output directory.
- Add environment secrets:
  - `RESEND_API_KEY`
  - `CONTACT_TO_EMAIL`
  - `CONTACT_FROM_EMAIL`
  - `TURNSTILE_SECRET_KEY`
- Configure production domain.
- Enable HTTPS.
- Add security headers.
- Run final production smoke test.

## Verification Checklist

Run these checks before marking the project complete:

- `npm install`
- `npm run build`
- Local preview of the built site.
- Homepage desktop visual check.
- Homepage mobile visual check.
- Specialties render in the intended order.
- Process steps render in the intended order.
- Services render in the intended order.
- Blog routes are either intentionally absent or fully working.
- Newsletter routes are either intentionally absent or fully working through the chosen external/serverless integration.
- Sitemap includes homepage and all enabled public pages.
- `robots.txt` is present.
- Page source contains rendered content without requiring JavaScript.
- Page source contains canonical, Open Graph, and JSON-LD metadata.
- Inquiry form rejects missing required fields.
- Inquiry form rejects invalid email when email is provided.
- Inquiry form rejects failed Turnstile verification.
- Inquiry form sends a test email through Resend in a non-production environment.
- No API keys or secrets appear in the built client bundle.
- No admin area or database-backed content editing exists in the final production app.
- Cloudflare environment variables are documented.
- Security headers are configured.

## Acceptance Criteria

The rebuild is complete when:

- Homepage visually matches the old landing page on desktop and mobile.
- All editable homepage copy, specialties, process steps, services, and optional blog content are controlled by markdown/frontmatter.
- New blog posts can be published by adding a markdown file and merging to GitHub if the blog is enabled.
- Sitemap includes homepage and all enabled public pages.
- Inquiry form sends emails through Resend.
- Inquiry form rejects invalid, automated, or Turnstile-failing submissions.
- No Resend or Turnstile secret is visible in client-side code.
- No production database or admin area exists.
- Newsletter behavior is either intentionally removed or safely rebuilt through an external/serverless integration.
- Lighthouse SEO score is high, with any remaining issues documented.
- Cloudflare Pages production deployment works from a clean GitHub merge.

## Open Decisions

- Confirm the final production domain and canonical host.
- Confirm recipient email address for inquiries.
- Confirm sender domain to verify in Resend.
- Decide whether the newsletter feature should be removed or rebuilt.
- Decide whether the blog should remain disabled or be re-enabled as markdown content.
- Decide whether dedicated service pages are required.
- Decide whether inquiry submissions should only be emailed or also stored somewhere external.
