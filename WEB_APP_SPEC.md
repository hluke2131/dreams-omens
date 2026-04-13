# What's It Mean? — Web App Rebuild Spec

> Generated from full audit of the iOS/React Native codebase (build 75/77).
> This is the authoritative blueprint for the web rebuild.

---

## Table of Contents

1. [Features by Tier](#1-features-by-tier)
2. [AI Prompts — Verbatim](#2-ai-prompts--verbatim)
3. [Reflect+ Logic & Symbol Tracking](#3-reflect-logic--symbol-tracking)
4. [UI Flow — Screen by Screen](#4-ui-flow--screen-by-screen)
5. [Data Models](#5-data-models)
6. [Design System](#6-design-system)
7. [Business Logic & Edge Cases](#7-business-logic--edge-cases)
8. [Infrastructure & Services](#8-infrastructure--services)
9. [Planned / Coming-Soon Features](#9-planned--coming-soon-features)

---

## 1. Features by Tier

### Free (No Account Required)

| Feature | Detail |
|---|---|
| Interpret Dream | Text input up to 1,200 chars, optional tags |
| Interpret Omen | Text input up to 1,200 chars, optional tags |
| Dream tags | Nightmare, Lucid, Recurring, Vivid, Symbolic |
| Omen tags | Animals, Numbers, Nature, Patterns, Synchronicity |
| Perspective lenses | Re-interpret via Archetypal, Cognitive, or Cultural lens (triggers a new AI call) |
| Share result | Share text + app URL to social/messages |
| Local history | All interpretations saved to device-local storage automatically |
| Monthly limit | **3 interpretations per month** — limit tracked by calendar month key in localStorage |

### Basic (Paid Subscriber — $2.99/month)

| Feature | Detail |
|---|---|
| No ads | Ad slots suppressed entirely |
| Unlimited interpretations | Monthly limit removed |

### Reflect+ (Paid Subscriber — $4.99/month)

| Feature | Detail |
|---|---|
| Everything in Basic | All Basic features included |
| Save & revisit interpretations | Cloud save to Supabase (history with symbol extraction) |
| Track recurring symbols | Top symbols surfaced on history screen from Supabase data |
| Concise answers toggle | Appends `\nStyle: concise` to the AI prompt for shorter responses |
| Reflect+ Guides | 2 subscriber-only PDFs (see below) |
| Early access (Labs) | Access to labs screen with experimental feature toggles/teasers |

**Guides included with Reflect+:**
- `Dream Symbols 101` — PDF at `https://whatsitmeanapp.com/guides/Dream_Symbols_101_v1.pdf`
- `Signs and Symbols Field Guide` — PDF at `https://whatsitmeanapp.com/guides/Signs_and_Symbols_Field_Guide_v1.pdf`

### Pricing

| Plan | Price | Stripe Price ID |
|---|---|---|
| Basic Monthly | $2.99/month | `STRIPE_PRICE_BASIC_MONTHLY` |
| Reflect+ Monthly | $4.99/month | `STRIPE_PRICE_REFLECT_PLUS_MONTHLY` |

---

## 2. AI Prompts — Verbatim

### Model & Parameters

```
Model:       gpt-4o-mini
Temperature: 0.6
Max tokens:  400
Timeout:     15 seconds (9s UI fallback shown to user)
```

### System Prompt (verbatim)

```
You write warm, grounded, practical interpretations (120–200 words). Avoid medical/legal/financial advice.
```

### User Prompt Construction

The user message is assembled from parts, joined with no separator:

```
{TYPE}: {text}
[optional] \nTags: {tag1}, {tag2}, ...
[optional] \nLens: {lens}
[optional] \nStyle: concise
```

**Where:**
- `{TYPE}` is either `DREAM` or `OMEN` (uppercase)
- `{lens}` is one of: `archetypal`, `cognitive`, `cultural` (omitted entirely if `none`)
- `\nStyle: concise` is appended only when the user has the concise setting ON (Reflect+ only)

### Example Prompts

**Basic dream, no tags, no lens:**
```
DREAM: I was flying over a dark ocean and then fell into the water but could breathe
```

**Dream with tags and lens:**
```
DREAM: I was flying over a dark ocean and then fell into the water but could breathe
Tags: Vivid, Symbolic
Lens: archetypal
```

**Omen, concise mode ON:**
```
OMEN: A black crow landed on my windowsill and stared at me for several minutes just before I got a strange phone call
Tags: Animals
Style: concise
```

### Perspective / Lens Re-interpretation

When the user taps a perspective button on the result screen, an entirely **new AI call** is made using the original input text + the new lens. The result is saved as a new `Interpretation` object with a distinct ID (`{timestamp}_{lens}`).

**Lens values sent to API:**
| Button label | `lens` value sent |
|---|---|
| Archetypal | `archetypal` |
| Cognitive | `cognitive` |
| Cultural | `cultural` |

---

## 3. Reflect+ Logic & Symbol Tracking

### How Interpretations Are Saved

All interpretations are saved **locally** (browser localStorage) immediately after a successful AI response — regardless of subscription tier.

Additionally, Reflect+ subscribers get **cloud save** via Supabase, which also triggers symbol extraction.

### What Data Is Stored Per Entry

```ts
{
  id:     string,   // Date.now().toString() — e.g. "1713456789012"
                    // For lens re-interpretations: "{timestamp}_{lens}"
  date:   Date,     // JavaScript Date object (serialized as ISO string)
  type:   'dream' | 'omen',
  input:  string,   // The original user-typed text
  tags:   string[], // Selected tag chips, e.g. ["Vivid", "Symbolic"]
  lens:   'none' | 'archetypal' | 'cognitive' | 'cultural',
  result: string,   // The raw AI response text
}
```

### Symbol Tracking (Reflect+)

- When saving to Supabase, a symbol extraction step runs against the AI result text.
- Symbols are stored in the `symbols` table with a **count** (incremented each time a symbol recurs).
- The **history screen** surfaces **top symbols** at the top — a ranked list by frequency.

### Usage Gating (Free Tier — Monthly Limit)

- Key format: `interpret_count_month_YYYY-MM` (stored in localStorage)
- Limit: **3 per calendar month** (web; iOS was 3/day)
- `incrementMonthlyUsage()` is called **after** a successful interpretation
- Gate is checked **before** submitting to the API — show upsell modal if `monthlyUsage >= 3`
- For authenticated users, the server also enforces this via `profiles.monthly_interpretation_count`

---

## 4. UI Flow — Screen by Screen

### Launch / Onboarding

```
App open
  └─ Check localStorage for 'hasOnboarded'
       ├─ Not set → redirect to /onboarding
       └─ Set     → continue to Home
```

### Screen 1: Home

**Route:** `/`

**Header:**
- Left: Hamburger/menu icon → navigates to History
- Right: Settings gear icon → navigates to Settings

**Body:**
- Brand lockup (owl icon + wordmark, centered, large padding)
- Subtitle: *"Anonymous and self-guided. Explore the symbols in your dreams and everyday life."*
- Two large tap-cards:
  - **Interpret Dream** (Moon icon) — *"Explore the symbols and meanings in your dreams"*
  - **Interpret Omen** (Eye icon) — *"Understand the signs and synchronicities around you"*
- Footer: *"There's meaning in the magic. We blend psychology, pattern-spotting, and timeless symbolism—no fortune-telling."* + copyright

### Screen 2a: Compose Dream

**Route:** `/compose/dream`

**Header:** Back arrow + "Dream Interpretation" title

**Body:**
- Instructional prompt: *"Describe who, where, feelings, and standout symbols."*
- Multiline text input
  - Placeholder (italic): *"I dreamed I was..."*
  - Max 1,200 characters
  - Character counter: `{n}/1200` (right-aligned, below input)
- Tag chips: `Nightmare` `Lucid` `Recurring` `Vivid` `Symbolic`
  - Toggle on/off; selected = filled Cedar color
- Loading state card (spinner + "Working…" + "This usually takes a few seconds.")
- Error state card ("We couldn't get an interpretation." + error message + "Try Again" button)
- CTA button: **"Interpret Dream"** — disabled when input empty or loading

**On Submit:**
1. Check monthly usage gate — show upsell if `>= 3` (free tier)
2. Read `conciseAnswers` setting
3. Call `POST /api/interpret` with `type: 'dream'`
4. Save to local history
5. Increment monthly usage counter
6. Navigate to Result screen

### Screen 2b: Compose Omen

**Route:** `/compose/omen`

Identical to Dream Compose except:
- Title: "Omen Interpretation"
- Placeholder: *"Example: I saw a black cat crossing my path just as I was thinking about..."*
- Instructional prompt: *"Tell us what you saw and the moment around it."*
- Tags: `Animals` `Numbers` `Nature` `Patterns` `Synchronicity`
- CTA button: **"Interpret Omen"**
- API call with `type: 'omen'`

### Screen 3: Result

**Route:** `/result?interpretation={id}`

**Header:** Back arrow + title + icon row
- **Bookmark icon** (save): for non-Reflect+ users, shows upsell; for Reflect+ subscribers, saves to Supabase
- **Share icon**: opens share sheet with pre-composed text

**Body:**
- **Your input card** — shows the original text entered
- **Result card** — shows AI response + character count (top-right muted)
- **Save button** — Reflect+ subscribers only; shows paywall for free/Basic users
- **Perspective section** — "Try another perspective:"
  - Three buttons: `Archetypal` `Cognitive` `Cultural`
  - Tapping any button makes a new API call with that lens and navigates to a new result screen
  - All buttons disabled while loading

**Share text format:**
```
🔮 Just got an amazing {dream|omen} interpretation from Dreams & Omens! Check it out: {first 100 chars of result}...

Try it at: https://dreamsandomens.com
```

### Screen 4: History

**Route:** `/history`

- Top symbols section (Reflect+ Supabase data — most frequent symbols)
- Paginated list of saved interpretations (localStorage for free/Basic; Supabase for Reflect+)
- Each entry: date, type badge, input preview, result preview
- Copy-to-clipboard button per entry

### Screen 5: Settings

**Route:** `/settings`

Sections:

**Subscription**
- Badge "Reflect+ Active" (if subscribed, Sage background)
- Row: "Manage Subscription" (if subscribed → Stripe portal) or "Upgrade to Reflect+" (→ paywall)

**Early Access**
- Row: "Labs (Early Access)" → `/labs`

**Reflect+ (subscribers only)**
- Row: "Reflect+ Guides" → `/reflect-plus`

**Preferences**
- "Concise answers" toggle
  - Subtext: *"Get shorter, more focused interpretations"*
  - Lock icon shown for non-Reflect+ users; tapping toggle → paywall
  - Only functional for Reflect+ subscribers

**Information**
- "Privacy & Disclaimers" — expands inline text block
- "Contact Support" — opens `mailto:hello@dreamsandomens.com?subject=app%20support%20request`

**Footer:** Version + copyright

### Screen 6: Paywall

**Route:** `/paywall`

**Header:** X (close) button

**Body:**
- Title: "Reflect+ unlocks it all"
- Subtitle: "Get the full experience without limits"
- Feature checklist (green checkmarks):
  - No ads—ever
  - Save & revisit interpretations
  - Track recurring symbols & themes
  - Bonus dream & archetype guides
  - Early access to new features
- Two pricing cards:
  - Basic: $2.99/month — unlimited interpretations, no ads
  - Reflect+: $4.99/month — **"Best Value" badge**, Sage border highlight, full feature set
- Each card has a "Subscribe" button → calls `POST /api/stripe/create-checkout`
- Footer links: "Maybe Later" (dismiss) | disclaimer text

### Screen 7: Reflect+ Guides

**Route:** `/reflect-plus`

- Reflect+ subscribers only (redirect to paywall if not subscribed)
- Two buttons opening PDFs:
  - "Dream Symbols 101 (PDF)"
  - "Signs and Symbols Field Guide (PDF)"

### Screen 8: Labs / Early Access

**Route:** `/labs`

Four experimental features with toggle/teaser states:

| Key | Name | Status |
|---|---|---|
| `dream-journal` | Dream Journal | Teaser only ("Coming Soon") |
| `symbol-timeline` | Symbol Timeline | No teaser |
| `bulk-export` | Bulk Export | No teaser |
| `beta-archetype-map` | Archetype Map (Beta) | Teaser ("Early Preview") |

All features currently locked/teaser.

---

## 5. Data Models

### `Interpretation` (local + cloud)

```ts
{
  id:     string       // Date.now().toString(); lens variants: "{ts}_{lens}"
  date:   Date         // ISO string on disk, parsed to Date on read
  type:   'dream' | 'omen'
  input:  string       // Raw user text (max 1200 chars)
  tags:   string[]     // e.g. ["Vivid", "Recurring"]
  lens:   'none' | 'archetypal' | 'cognitive' | 'cultural'
  result: string       // Raw AI response text
}
```

### Settings (localStorage)

```ts
{
  conciseAnswers: boolean   // default: false — Reflect+ only
}
```

### Monthly Usage Counter (localStorage)

```ts
// Key: `interpret_count_month_YYYY-MM`
// Value: number (stored as string)
// Resets automatically by month (old keys are never cleaned up, just ignored)
```

### Subscription State

```ts
{
  isSubscribed:      boolean          // true for Basic or Reflect+
  subscriptionTier:  'free' | 'basic' | 'reflect_plus'
  // Resolved from: Supabase profiles.subscription_tier
}
```

---

## 6. Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `OwlBrown` | `#5D4631` | Muted text, placeholder, helper text |
| `Cedar` | `#7C5F44` | Interactive elements, icons, borders, secondary CTA |
| `Sage` | `#8FA382` | Primary CTA buttons, success states, "Best Value" badge |
| `Moss` | `#5B6E4D` | Accent (main CTA alias) |
| `Sand` | `#E7D9C9` | Secondary card bg, header bg, tag chip bg |
| `Bone` | `#F5F1EC` | Primary card bg, primary bg |
| `Cream` | `#F9F6F2` | Lightest bg |
| `Ink` | `#1D1B16` | Primary text |

**Derived tokens:**
- `BgPrimary` = Bone
- `BgSecondary` = Sand
- `TextPrimary` = Ink
- `TextSecondary` = Ink at 75% opacity (`#1D1B16BF`)
- `Divider` = Ink at 8% (`#1D1B1614`)
- Background gradient: Bone → Sand (linear, top to bottom)

### Typography

| Scale | Size | Weight | Line Height |
|---|---|---|---|
| `titleXL` | 28px | 600 | 34 |
| `titleL` | 22px | 600 | 28 |
| `titleM` | 18px | 600 | 24 |
| `body` | 16px | 400 | 22 |
| `helper` | 13px | 400 | 18 |
| `caption` | 11px | 400 | 16 |

### Border Radii

| Token | Value |
|---|---|
| `s` | 12px |
| `m` | 18px |
| `l` | 24px |

### Spacing

| Token | Value |
|---|---|
| `xs` | 6px |
| `s` | 10px |
| `m` | 16px |
| `l` | 20px |
| `xl` | 28px |

### Cards

- **Primary card:** Bone bg, `l` radius, 1px StrokeSoft border, shadow (0 12 24, 10% opacity)
- **Secondary card:** Sand bg, same radius/border/shadow
- Standard padding: `l` (20px)

### Buttons

- **Primary:** Sage/Moss bg, `m` radius (18px), 16px vertical padding
- **Secondary:** Cedar bg, same dimensions
- Both have a small shadow (0 6 12, 8% opacity)

---

## 7. Business Logic & Edge Cases

### Interpretation Flow State Machine

```
Idle
  → [submit tap] → validate (non-empty text)
  → [free tier] → check monthly usage gate (>= 3 → show upsell, stop)
  → start 9s UI timeout timer
  → call POST /api/interpret (15s server timeout)
    ├─ success → clear timer → save local → increment usage → navigate to result
    └─ error   → clear timer → show error card + "Try Again" button
  → [9s timer fires before API responds] → show timeout error message
```

### Monthly Usage Gate (Free Tier)

- Tracked per calendar month (UTC via `new Date().toISOString().substring(0, 7)`)
- Incremented **after success only** (errors don't count against the limit)
- Gate check happens **before** the API call
- Web key format: `interpret_count_month_YYYY-MM`
- Limit: 3 per month

### Subscription Check

1. `Supabase profiles.subscription_tier` — source of truth
2. `profiles.subscription_status` must be `'active'` for features to unlock

### Concise Answers

- Setting stored in localStorage `user_settings` key
- Locked behind Reflect+ — lock icon shown, tapping → paywall for non-subscribers
- When enabled, appends `\nStyle: concise` to the AI prompt

### Perspective Lenses

- Available to all users (no subscription gate)
- Each tap creates a **new interpretation object** saved locally
- The new result navigates to a fresh result screen (`router.push`, not `replace`)
- Original result is preserved; perspective results are siblings in history

### Save to Cloud (Reflect+ only)

- Bookmark icon / Save button: non-Reflect+ users see upsell and redirect to paywall
- On save: symbol extraction runs and updates `symbols` table

---

## 8. Infrastructure & Services

### Web Stack

| Service | Purpose |
|---|---|
| Next.js 16 (App Router) | Frontend + API routes |
| Supabase | Auth (email/magic link) + Postgres DB + RLS |
| Stripe | Subscription billing (Basic + Reflect+) |
| OpenAI API | AI interpretations via server-side proxy |
| Vercel | Hosting + deployment |

### API Routes

| Route | Purpose |
|---|---|
| `POST /api/interpret` | OpenAI proxy — never exposes key to client |
| `POST /api/stripe/create-checkout` | Creates Stripe Checkout session |
| `POST /api/stripe/portal` | Creates Stripe Customer Portal session |
| `POST /api/stripe/webhook` | Handles Stripe subscription lifecycle events |
| `GET /api/auth/callback` | Supabase magic-link / OAuth callback |

### Storage Mapping

| iOS | Web |
|---|---|
| AsyncStorage | `localStorage` |
| Supabase | Supabase (same) |
| RevenueCat | Stripe |

### Environment Variables

See `.env.local.example` for the full list. Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_BASIC_MONTHLY`
- `STRIPE_PRICE_REFLECT_PLUS_MONTHLY`

---

## 9. Planned / Coming-Soon Features

### Dream Journal
> *"Capture dreams in seconds, tag recurring symbols, and link entries to interpretations. Export or filter by mood, archetype, or lunar phase."*

### Symbol Timeline
> *"Visualize how a symbol appears over time."*

### Bulk Export
Export all saved interpretations as JSON or CSV.

### Archetype Map (Beta)
> *"Explore a living map of archetypes (Shadow, Anima/Animus, Self, Hero, etc.). Track which themes your symbols cluster around and how they shift over time."*

---

## Appendix: Copy Reference

**Home screen subtitle:**
> *"Anonymous and self-guided. Explore the symbols in your dreams and everyday life."*

**Home footer:**
> *"There's meaning in the magic. We blend psychology, pattern-spotting, and timeless symbolism—no fortune-telling."*

**Dream input hint:**
> *"Describe who, where, feelings, and standout symbols."*

**Dream placeholder:**
> *"I dreamed I was..."*

**Omen input hint:**
> *"Tell us what you saw and the moment around it."*

**Omen placeholder:**
> *"Example: I saw a black cat crossing my path just as I was thinking about..."*

**Paywall headline:**
> *"Reflect+ unlocks it all"*

**Paywall subtitle:**
> *"Get the full experience without limits"*

**Loading state:**
> *"Working…"* / *"This usually takes a few seconds."*

**Error state title:**
> *"We couldn't get an interpretation."*

**Timeout error:**
> *"The interpretation is taking longer than expected. Please check your internet connection and try again."*

**Subscription disclaimer:**
> *"Subscriptions auto-renew. Cancel anytime in Settings."*

**Contact email:** `hello@dreamsandomens.com`
