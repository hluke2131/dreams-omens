#!/usr/bin/env node
// Dreams & Omens — reusable blog post publisher.
//
// Reads a markdown file with YAML frontmatter and inserts a row into the
// `blog_posts` table in Supabase. Defaults to draft; pass --publish to go live.
//
// Usage:
//   node --env-file=.env scripts/publish-post.mjs path/to/post.md           # draft
//   node --env-file=.env scripts/publish-post.mjs path/to/post.md --draft   # draft (explicit)
//   node --env-file=.env scripts/publish-post.mjs path/to/post.md --publish # live
//
// The markdown file must start with YAML frontmatter:
//
//   ---
//   title: My post title
//   excerpt: One or two sentences shown in listings.
//   category: dream            # or omen, practice
//   tags: [dreams, anxiety]    # optional, defaults to []
//   featured_image_url: https://...   # optional
//   featured_image_alt: Description   # optional
//   ---
//
//   Body markdown goes here...

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ALLOWED_CATEGORIES = ['dream', 'omen', 'practice']
const ALLOWED_STATUSES   = ['draft', 'published']
const DEFAULT_AUTHOR_ID  = 'd37d25ab-392b-479d-b279-8d81da8fe034'
const SITE_URL           = 'https://www.dreamsandomens.com'

// ── tiny argv parser ────────────────────────────────────────────────
function parseArgs(argv) {
  const flags = new Set()
  const positional = []
  for (const a of argv) {
    if (a.startsWith('--')) flags.add(a.slice(2))
    else positional.push(a)
  }
  return { flags, positional }
}

// ── tiny YAML frontmatter parser ────────────────────────────────────
// Supports only the small subset we need: top-level `key: value` pairs.
// Values can be:
//   - bare strings (anything after the colon, trimmed)
//   - quoted strings ("..." or '...')
//   - inline arrays: [a, b, "c with spaces"]
// Anything more exotic is out of scope; keep your frontmatter simple.
function parseFrontmatter(src) {
  const match = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    return { frontmatter: null, body: src }
  }
  const [, raw, body] = match
  const frontmatter = {}
  const lines = raw.split(/\r?\n/)
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    let value = line.slice(colon + 1).trim()
    if (value === '') {
      frontmatter[key] = ''
      continue
    }
    // Inline array: [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim()
      if (inner === '') {
        frontmatter[key] = []
      } else {
        // split on commas not inside quotes
        const parts = []
        let buf = ''
        let quote = null
        for (const ch of inner) {
          if (quote) {
            if (ch === quote) quote = null
            else buf += ch
          } else if (ch === '"' || ch === "'") {
            quote = ch
          } else if (ch === ',') {
            parts.push(buf.trim())
            buf = ''
          } else {
            buf += ch
          }
        }
        if (buf.trim() !== '' || parts.length > 0) parts.push(buf.trim())
        frontmatter[key] = parts.filter(p => p !== '')
      }
      continue
    }
    // Quoted string
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    frontmatter[key] = value
  }
  return { frontmatter, body: body.trim() }
}

// ── slug generation ─────────────────────────────────────────────────
function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')       // strip diacritics
    .replace(/[‘’']/g, '')       // drop apostrophes (don't → dont)
    .replace(/[^a-z0-9]+/g, '-')       // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, '')           // trim leading/trailing hyphens
    .replace(/-{2,}/g, '-')            // collapse repeats
}

// ── friendly error + exit ───────────────────────────────────────────
function fail(message) {
  console.error('\n[publish-post] Error: ' + message + '\n')
  process.exit(1)
}

// ── main ────────────────────────────────────────────────────────────
async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2))

  if (positional.length === 0) {
    fail(
      'No markdown file given.\n' +
      '  Usage: node --env-file=.env scripts/publish-post.mjs path/to/post.md [--draft|--publish]'
    )
  }
  if (positional.length > 1) {
    fail('Only one markdown file at a time, please. Got: ' + positional.join(', '))
  }
  if (flags.has('draft') && flags.has('publish')) {
    fail('Pick one: --draft or --publish (not both).')
  }

  const status = flags.has('publish') ? 'published' : 'draft'
  const filePath = resolve(process.cwd(), positional[0])

  // Read the file
  let src
  try {
    src = readFileSync(filePath, 'utf8')
  } catch (e) {
    fail('Could not read file "' + filePath + '". ' + (e.code === 'ENOENT' ? 'File does not exist.' : e.message))
  }

  // Parse frontmatter
  const { frontmatter, body } = parseFrontmatter(src)
  if (!frontmatter) {
    fail(
      'The file is missing YAML frontmatter. The first lines must look like:\n' +
      '    ---\n' +
      '    title: My post\n' +
      '    excerpt: A short summary.\n' +
      '    category: dream\n' +
      '    ---\n' +
      '    (body markdown below)'
    )
  }

  // Required fields
  const title    = (frontmatter.title || '').trim()
  const excerpt  = (frontmatter.excerpt || '').trim()
  const category = (frontmatter.category || '').trim()
  if (!title)    fail('Missing "title" in frontmatter.')
  if (!excerpt)  fail('Missing "excerpt" in frontmatter.')
  if (!category) fail('Missing "category" in frontmatter.')
  if (!body)     fail('The post body is empty. Add your markdown content below the frontmatter block.')

  // Validate enums
  if (!ALLOWED_CATEGORIES.includes(category)) {
    fail(
      'category "' + category + '" is not allowed.\n' +
      '  Use one of: ' + ALLOWED_CATEGORIES.join(', ')
    )
  }
  if (!ALLOWED_STATUSES.includes(status)) {
    fail('status "' + status + '" is not allowed. (This is a bug — should not happen.)')
  }

  // Optional fields
  const featured_image_url = frontmatter.featured_image_url ? String(frontmatter.featured_image_url).trim() : null
  const featured_image_alt = frontmatter.featured_image_alt ? String(frontmatter.featured_image_alt).trim() : null
  const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : []

  // Generate slug
  const slug = slugify(title)
  if (!slug) fail('Could not generate a slug from the title "' + title + '".')

  // Env / Supabase client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    fail(
      'Missing Supabase credentials.\n' +
      '  Make sure you have a .env file in the project root with:\n' +
      '    SUPABASE_URL=https://YOUR-PROJECT.supabase.co\n' +
      '    SUPABASE_SERVICE_ROLE_KEY=eyJ...\n' +
      '  And run the script with:  node --env-file=.env scripts/publish-post.mjs ...'
    )
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Slug collision check
  const { data: existing, error: lookupErr } = await supabase
    .from('blog_posts')
    .select('id, status')
    .eq('slug', slug)
    .maybeSingle()

  if (lookupErr) {
    fail('Failed to check for existing slug: ' + lookupErr.message)
  }
  if (existing) {
    fail(
      'A post with slug "' + slug + '" already exists (id: ' + existing.id + ', status: ' + existing.status + ').\n' +
      '  Choose a different title (slugs are auto-generated from the title), or delete/edit the existing post first.'
    )
  }

  // Build the row
  const row = {
    slug,
    title,
    excerpt,
    body_markdown:      body,
    featured_image_url: featured_image_url || null,
    featured_image_alt: featured_image_alt || null,
    category,
    tags,
    status,
    published_at:       status === 'published' ? new Date().toISOString() : null,
    author_id:          DEFAULT_AUTHOR_ID,
  }

  const { data: inserted, error: insertErr } = await supabase
    .from('blog_posts')
    .insert(row)
    .select('id, slug, status, published_at')
    .single()

  if (insertErr) {
    fail('Insert failed: ' + insertErr.message)
  }

  // Success output
  console.log('')
  console.log('[publish-post] Success.')
  console.log('  Title:    ' + title)
  console.log('  Slug:     ' + inserted.slug)
  console.log('  Status:   ' + inserted.status)
  console.log('  ID:       ' + inserted.id)
  if (inserted.status === 'published') {
    console.log('  Live at:  ' + SITE_URL + '/blog/' + inserted.slug)
    console.log('')
    console.log('  Vercel will revalidate the listing within ~60 seconds.')
  } else {
    console.log('')
    console.log('  Saved as a draft — not visible on the live site.')
    console.log('  To publish it later, re-run with --publish OR edit it in /admin/blog.')
  }
  console.log('')
}

main().catch(err => {
  fail('Unexpected error: ' + (err?.stack || err?.message || String(err)))
})
