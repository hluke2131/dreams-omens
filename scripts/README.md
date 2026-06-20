# Blog Publisher — Handoff & Reference

This document brings any future session (Claude Chat, Claude Code, or human) up to speed on the blog post publishing workflow added on 2026-06-19.

---

## TL;DR

A reusable Node script — `scripts/publish-post.mjs` — inserts a row into the Supabase `blog_posts` table from a local markdown file. Defaults to draft. Pass `--publish` to go live. Replaces the previous `/admin/blog` editor dependency for routine publishing.

```powershell
# Save as draft (default)
node --env-file=.env scripts/publish-post.mjs path/to/post.md

# Go live
node --env-file=.env scripts/publish-post.mjs path/to/post.md --publish
```

---

## Files introduced (committed `e8dbfe2`)

| Path | Purpose |
|---|---|
| `scripts/publish-post.mjs` | The reusable publisher. Reads markdown + frontmatter, validates, inserts into `blog_posts`. |
| `scripts/example-post.md` | A ready-to-duplicate template showing the required frontmatter format. |
| `.env.example` | Credential reference for the script (separate from `.env.local`, which is for the Next.js app). |
| `.gitignore` | Added `.env` to the ignore list so the service-role key cannot be committed. |

## Files NOT committed (and must never be)

| Path | Why it's local-only |
|---|---|
| `.env` | Contains the Supabase **`service_role`** key — bypasses row-level security. Already git-ignored. Lives only on the operator's machine. |

The script will refuse to run if `.env` is missing or incomplete, with a friendly error explaining what to add.

---

## Why this exists

The blog previously had two publishing paths:

1. A custom `/admin/blog` editor UI (still works, still useful for editing/preview).
2. An external agent that wrote directly to the table.

Path (2) was retired. This script replaces it: same direct-write capability, but locally controlled, simple to run, and reusable from any Claude Code session.

---

## The `blog_posts` schema (built to this precisely)

Table: `public.blog_posts`. Defined in `supabase/migrations/004_blog.sql`.

| Column | Type | Script sets it? | Notes |
|---|---|---|---|
| `id` | uuid | NEVER | auto `gen_random_uuid()` |
| `slug` | text | YES | UNIQUE. Generated from title (kebab-case). Dedupe-checked before insert. |
| `title` | text | YES | from frontmatter |
| `excerpt` | text | YES | from frontmatter |
| `body_markdown` | text | YES | the markdown below the frontmatter block |
| `featured_image_url` | text | optional | from frontmatter |
| `featured_image_alt` | text | optional | from frontmatter |
| `category` | text | YES | validated against `dream` \| `omen` \| `practice` (DB CHECK) |
| `tags` | text[] | YES (defaults `[]`) | inline-array YAML, e.g. `tags: [dreams, anxiety]` |
| `status` | text | YES | `draft` (default) or `published` based on CLI flag (DB CHECK) |
| `published_at` | timestamptz | YES on publish | `now()` when `--publish`, `null` otherwise. **Required for visibility** even with `status=published`. |
| `author_id` | uuid | YES (hardcoded) | always `d37d25ab-392b-479d-b279-8d81da8fe034` (site owner profile) |
| `created_at` | timestamptz | NEVER | auto `now()` |
| `updated_at` | timestamptz | NEVER | auto via trigger |

### RLS policies (relevant context)

- Public reads `WHERE status = 'published'`.
- Admin profiles (`is_admin = true`) have full read/write.
- The script uses the **service-role key**, which bypasses RLS — that's why it can insert without an auth session.

---

## Frontmatter format (what the script parses)

The markdown file must start with a YAML-ish frontmatter block delimited by `---` lines:

```markdown
---
title: What does it mean to dream about water?
excerpt: A short summary that appears in listings and search results.
category: dream
tags: [dreams, water, emotions]
featured_image_url: https://images.unsplash.com/photo-...
featured_image_alt: A short description for screen readers
---

The body markdown goes here. The first paragraph appears above the
category-specific CTA block on the rendered post page. The rest follows
below the CTA.

## Subheadings, **bold**, *italic*, [links](https://example.com), lists — all standard markdown works.
```

### Parser scope (deliberately small)

The script ships its own tiny YAML parser. It supports only:

- Top-level `key: value` pairs (no nesting).
- Bare strings (anything after the colon, trimmed).
- Single- or double-quoted strings.
- Inline arrays: `tags: [a, b, "c with spaces"]`.

Anything more exotic (multiline strings, YAML lists with `- ` hyphens, anchors, etc.) is intentionally out of scope. If a post needs richer metadata, edit `parseFrontmatter` in `scripts/publish-post.mjs` — but the current surface covers every existing blog post.

---

## CLI behavior

### Flags

| Flag | Effect |
|---|---|
| (none) | `status = draft`, `published_at = null` |
| `--draft` | Same as no flag — explicit draft |
| `--publish` | `status = published`, `published_at = <now ISO>` |

Passing both flags is an error.

### Validation order (fails loud, fails early)

1. Argv: must have exactly one positional (the markdown path); no conflicting flags.
2. File exists and is readable.
3. Frontmatter block present and parseable.
4. Required fields present: `title`, `excerpt`, `category`, plus a non-empty body.
5. `category` ∈ {`dream`, `omen`, `practice`}.
6. Env vars `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` present.
7. Slug collision check via `SELECT id, status FROM blog_posts WHERE slug = ?`. Fails with the existing post's id/status if found — never overwrites.
8. Insert. Returns `id, slug, status, published_at`.

### Slug generation

`slugify(title)`:

- Lowercase
- NFKD-normalize + strip combining diacritics
- Drop apostrophes entirely (`don't` → `dont`, not `don-t`)
- Non-alphanumeric → `-`
- Collapse repeats, trim leading/trailing hyphens

### Success output

```
[publish-post] Success.
  Title:    What does it mean to dream about water?
  Slug:     what-does-it-mean-to-dream-about-water
  Status:   published
  ID:       <uuid>
  Live at:  https://www.dreamsandomens.com/blog/<slug>

  Vercel will revalidate the listing within ~60 seconds.
```

For drafts, prints "Saved as a draft" and hints at `--publish` or `/admin/blog` for next steps.

---

## Credentials

The script needs Supabase **server-level** access. It uses the `service_role` key with `@supabase/supabase-js`.

`.env` (in project root, git-ignored) must contain:

```
SUPABASE_URL=https://ubzczaykniduuivcnqxk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Both values come from **Supabase Dashboard → Project Settings → API Keys**. The `service_role` key is the SECRET one (not `anon`).

The operator's `.env` is already set up. If a fresh checkout ever needs it again, `.env.example` documents the format.

> Node 20+ is required for the `--env-file=.env` flag. The project is currently on Node 22.

---

## How to invoke from a future Claude Code session

The operator is non-technical. The expected invocation pattern is conversational, e.g.:

- "Publish the post in `my-new-post.md` as a draft" → run with `--draft`
- "Publish `posts/raven-meaning.md` live" → run with `--publish`
- "Set me up with a template for a new omen post" → duplicate `scripts/example-post.md`, swap to `category: omen`

The script lives in the repo and is reusable indefinitely. Nothing to install or configure on subsequent runs.

---

## Test / verification record (this build session)

1. **Smoke test (no args):** prints usage hint, exits 1. ✓
2. **Draft insert** (`example-post.md --draft`): row created with correct slug, category, tags, image, body, `status=draft`, `published_at=null`, `author_id` set. Verified via `SELECT` against the table. ✓
3. **Slug collision check:** second run of the same file refused to insert and reported the existing id/status. ✓
4. **Cleanup:** test draft row deleted. ✓
5. **Build:** `npm run build` passed. ✓
6. **Push:** committed to `main` (`e8dbfe2`), confirmed at `origin/main`. ✓

No post has been published live by this workflow yet — the first live publish will be the operator's own.

---

## Things to watch out for / future enhancements

- **Slug derived from title only.** If the operator wants the same title in two posts (rare for SEO reasons, but possible), they'd need to rename one. An optional `slug:` field in frontmatter would solve this — not added yet because no current need.
- **No update path.** The script only inserts. To edit a live post, use `/admin/blog`. If frequent re-publishing of existing posts becomes a workflow, consider adding an `--update` flag that does an upsert on slug.
- **No image upload.** `featured_image_url` must already be a hosted URL. Existing posts use Unsplash. If hosting our own images becomes a need, add a Supabase Storage upload step.
- **`author_id` is hardcoded.** Site is a one-author operation today. If/when there are multiple authors, surface an optional `author_id:` in frontmatter or a `--author` flag.
- **Vercel revalidate is 60s.** `app/blog/[slug]/page.tsx` and the listing both use `export const revalidate = 60`. A freshly-published post may take up to a minute to appear in the listing — this is expected, not a bug.

---

## Related files (for orientation)

- `app/blog/page.tsx` — blog index
- `app/blog/[slug]/page.tsx` — individual post page (renders the inserted markdown)
- `app/blog/layout.tsx` — shared blog chrome
- `lib/blog.ts` — read helpers: `getPostBySlug`, `getRelatedPosts`, `estimateReadTime`, etc.
- `supabase/migrations/004_blog.sql` — table definition + RLS policies
- `.env.local.example` — separate template for the **Next.js app's** runtime env (NEXT_PUBLIC_*, OpenAI, Stripe). Don't confuse with `.env.example`.
