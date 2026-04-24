-- ============================================================
-- Dreams & Omens — Blog Feature Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ── Add source column to email_leads ────────────────────────
ALTER TABLE public.email_leads
  ADD COLUMN IF NOT EXISTS source TEXT;

-- ── Add is_admin column to profiles ─────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- ── blog_posts ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT        UNIQUE NOT NULL,
  title              TEXT        NOT NULL,
  excerpt            TEXT        NOT NULL,
  body_markdown      TEXT        NOT NULL,
  featured_image_url TEXT,
  featured_image_alt TEXT,
  category           TEXT        NOT NULL CHECK (category IN ('dream', 'omen', 'practice')),
  tags               TEXT[]      NOT NULL DEFAULT '{}',
  status             TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at       TIMESTAMPTZ,
  author_id          UUID        REFERENCES public.profiles(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "blog_posts: public read published"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- Admins can do everything (including read drafts)
CREATE POLICY "blog_posts: admin all"
  ON public.blog_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ── Seed posts ───────────────────────────────────────────────
-- author_id is NULL — update with the real admin user UUID after account creation.
-- See delivery notes for the exact SQL to run.

INSERT INTO public.blog_posts
  (slug, title, excerpt, body_markdown, featured_image_url, featured_image_alt, category, tags, status, published_at)
VALUES (
  'what-does-it-mean-to-dream-about-teeth-falling-out',
  'What does it mean to dream about teeth falling out?',
  'Dreaming about your teeth falling out is one of the most common dreams people have — and one of the most unsettling. Here''s what it almost never means, and what''s likely really going on.',
  $body1$Dreaming about your teeth falling out is one of the most common dreams people have — and one of the most unsettling. You're not alone, and it almost certainly doesn't mean what you think it means.

The short answer: this dream rarely has anything to do with your actual teeth. It's almost always about anxiety, transition, or a sense of losing control over how you present yourself to the world.

## Why this dream is so common

Teeth occupy a strange place in our psychology. They're part of how we speak, how we smile, how we show up. They're also one of the few things about our appearance we're taught to maintain from early childhood. When they fall out in a dream, the image tends to land hard — because something that felt permanent suddenly isn't.

Dream researchers and psychologists have found this theme across cultures and centuries. Whatever it represents, it's not random noise. Something in our shared experience keeps generating it.

## Five things the teeth dream often means

### 1. Anxiety about how others see you

Teeth are how we smile, speak, and make an impression. When they crumble or fall out in a dream, it often reflects a deeper worry about appearance, judgment, or reputation. Are you about to be evaluated — a job interview, a new relationship, a social situation where you feel watched? This dream shows up reliably before those moments.

*Ask yourself: Is there somewhere in your life where you feel exposed or unsure how you're coming across?*

### 2. You're in the middle of a transition

Losing teeth is one of the few physical transitions we actually experience as children — we lose baby teeth to make room for something more permanent. This dream often arrives during real-life transitions: a new role, a move, leaving behind something you've outgrown.

The loss isn't only loss. It's making room.

### 3. You feel powerless in a situation

Teeth represent bite — the ability to take action, assert yourself, or say what you mean. When they fall out, it can signal feelings of helplessness or silence. Are you holding back something you need to say? Is there a situation where you feel like you have no real leverage?

### 4. Stress has been running high

This is the least poetic interpretation, but often the most accurate: when your nervous system is under sustained pressure, your dreams get stranger and more distressing. Teeth dreams spike during financial stress, relationship strain, or periods of professional pressure. It doesn't mean something is wrong with your psyche — it means something is loud in your life.

### 5. You're being harder on yourself than you need to be

In some traditions, teeth dreams connect to self-criticism. You've said something you regret, or you're replaying a mistake on a loop. The crumbling teeth mirror a crumbling sense of self-confidence. It's worth asking whether you're holding yourself to a standard you'd never apply to someone you care about.

## But here's what matters more

The same dream can mean very different things depending on who's having it and when.

Someone dreaming about their teeth falling out the week before a performance review is probably processing workplace anxiety. Someone having the same dream after a breakup is likely working through loss and identity. Someone having it on repeat for years might be sitting with something older — a long-running pattern of perfectionism or people-pleasing that keeps surfacing.

The symbol isn't the meaning. The *context* is the meaning.

Three questions worth sitting with:

- *What's the biggest source of pressure in your life right now?*
- *Is there something you've been afraid to say out loud?*
- *Where in your life do you feel like you might be losing your grip?*

You don't need to answer these definitively. Just notice what comes up when you ask.

## What to do with this dream

If the teeth dream is recurring, treat it as a signal rather than noise. Recurring dreams are your mind's way of flagging something unresolved — worth looking at rather than waiting for it to stop.

One of the simplest starting points is writing down the dream the moment you wake up — the feelings, the specific details, what felt different about this version. If you've never tried dream journaling, it's one of the most effective ways to start building a real relationship with your dream life. [Here's how to get started, even if you've never remembered a dream before.](/blog/how-to-remember-your-dreams)

And if you want a personalized take on what this specific dream might mean for you — your situation, your emotional context, your details — that's exactly what Dreams & Omens is built for.
$body1$,
  'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=1200&auto=format&fit=crop&q=80',
  'A soft full moon glowing through wispy clouds against a deep blue night sky',
  'dream',
  ARRAY['dreams', 'common dreams', 'anxiety dreams', 'teeth'],
  'published',
  NOW()
),
(
  'what-does-it-mean-when-you-see-a-cardinal',
  'What does it mean when you see a cardinal?',
  'Spotting a cardinal can stop you mid-step. Here''s a look at the most common interpretations — and why your personal context matters more than any of them.',
  $body2$If you've seen a cardinal at an unexpected moment — perched outside your window, appearing out of nowhere, making eye contact in a way that felt almost deliberate — you're probably wondering if it means something.

The honest answer: it might. Not because cardinals have magic, but because meaningful symbols work when we're paying attention. And a red cardinal is hard to ignore.

## Why cardinals feel significant

Cardinals are year-round birds across much of North America, which means they're visible even in the depth of winter — a flash of red against bare branches or snow that almost feels like an announcement. They don't migrate. They stay through the cold.

That persistence, combined with their color, has made them symbols of presence, vitality, and connection across many traditions for centuries. When something this vivid shows up, it tends to stop you.

## Five interpretations of seeing a cardinal

### 1. A visit from someone who has passed

This is the most widely held belief: when a cardinal appears — especially at a charged moment, or in the days after a loss — it's carrying something from a loved one who has died. "When a cardinal appears, a loved one is near" is a phrase you'll find on memorial garden stones, greeting cards, and quiet corners of the internet where people share grief.

It's rooted in Christian tradition but has spread far beyond any single faith. People who don't consider themselves spiritual at all sometimes feel this — a sudden, inexplicable sense that someone who has been gone is, in some way, present.

If this resonated when the cardinal appeared — if you thought of someone immediately — that response is worth honoring rather than explaining away.

### 2. Encouragement during a hard season

In folk traditions, a cardinal appearing when you're depleted or uncertain is read as a sign that things will shift. The red is associated with vitality, life force, and forward momentum. When you're running low on those things, something that vivid can feel like a small, deliberate reminder that color still exists in the world.

### 3. A nudge toward confidence

Cardinals don't hide. They're territorial, self-assured, and conspicuous on purpose. Some people interpret repeated cardinal sightings as a nudge toward showing up more fully — saying the thing, making the move, being seen in a situation where hiding has felt safer.

### 4. An invitation to pay attention

In many Indigenous and folk traditions, animal signs are less about specific messages and more about the practice of noticing. The bird appears. You stop. What were you thinking about in that moment? What had you been about to walk past without really seeing?

The omen isn't necessarily about the cardinal. The cardinal is what stopped you.

### 5. Resilience through difficulty

In winter especially, cardinals represent something that thrives when most things go dormant. If you're in a hard season — a loss, a transition, an extended period of uncertainty — the cardinal has long been a symbol of the thing in you that doesn't require warmth to survive.

## But here's what matters more

There is no universal answer to what your specific sighting meant. There's only what it means to you, in your situation, at this moment.

If you saw the cardinal the day after someone died, and that person loved birds, that context matters enormously. If it appeared while you were sitting with a difficult decision, that matters too. The symbol doesn't arrive with a fixed caption. You bring meaning to it based on what you're already carrying.

Three questions worth sitting with:

- *What was happening in your life — or in your thoughts — when the cardinal appeared?*
- *Who, if anyone, did you think of first when you saw it?*
- *What do you most need to believe is true right now?*

You don't have to land on a conclusion. Sometimes the question does more work than the answer.

## What to do with this sign

If the cardinal felt significant — if you're reading this because you couldn't simply move on — trust that instinct. Meaningful signs tend to stay with us precisely because they're pointing at something we already sense.

You might write down what you were thinking when it appeared. You might speak, out loud or quietly, to whoever came to mind. You might simply acknowledge it and watch what shifts.

And if you want a more personal read on what this particular omen might mean for you — your loss, your question, your relationship to signs and symbols — that's what Dreams & Omens is built for.
$body2$,
  'https://images.unsplash.com/photo-1591608006342-c7ef5e1e8c35?w=1200&auto=format&fit=crop&q=80',
  'A bright red cardinal perched on a snow-dusted branch in soft winter light',
  'omen',
  ARRAY['animal omens', 'signs', 'cardinals', 'loved ones'],
  'published',
  NOW()
),
(
  'how-to-remember-your-dreams',
  'How to remember your dreams (even if you never have before)',
  'Most people don''t have a memory problem with their dreams. They have a retrieval problem. Here are five things that actually work.',
  $body3$Most people don't have a memory problem with their dreams. They have a retrieval problem.

Dreams happen. They can be vivid, emotionally intense, sometimes strange in ways that feel significant. But by the time you've checked your phone and gotten out of bed, they're gone — not because your brain failed to store them, but because you didn't give yourself the window to bring them back.

Here's how to change that, even if you've never successfully remembered a dream before.

## Why dreams disappear so quickly

During REM sleep — the stage where most vivid dreaming happens — your brain is doing something unusual: it's constructing rich, emotionally textured experiences while also suppressing some of the neurotransmitters that help consolidate long-term memories. That's part of why dreams feel so real in the moment and so slippery afterward.

The transition out of sleep is the critical window. When you wake up abruptly — an alarm, a noise, the immediate pressure of the day — your brain snaps into forward-planning mode, and the dream memory dissolves before you can reach it.

This isn't a failure of attention. It's just how the machinery works. The fix isn't trying harder — it's adjusting the conditions.

## Five things that actually help

### 1. Keep something to write on within arm's reach

This is the single most impactful change you can make. A small notebook on your nightstand. A voice memo app already open on your phone. Anything you can reach without getting up.

Before you move, before you open your eyes fully, before you check anything — start narrating. What's the last image? What was the feeling? What were you doing? Don't worry about coherence. Just capture fragments.

You'll often find that one fragment pulls the rest of the dream back.

### 2. Wake more gently

A jarring alarm almost guarantees the dream is gone before you're fully conscious. Experiment with:

- A gentler alarm sound — something ambient or gradually rising rather than sudden
- A consistent wake time so your body begins surfacing naturally near it
- Waking 20 to 30 minutes before you need to be up, giving yourself time to retrieve before the day starts pulling you forward

Some people find that waking naturally — even once or twice a week — produces their most memorable dreams.

### 3. Lie still for a moment before moving

Movement accelerates the shift out of sleep mode. Before you sit up, roll over, or reach for anything — pause. Keep your eyes soft or closed. Let whatever images are there come forward.

This doesn't need to take long. Even thirty seconds changes what you can access.

### 4. Set an intention before you fall asleep

Just before sleep, remind yourself simply: *I want to remember my dreams tonight.* It sounds almost too easy, but it's consistently reported as effective.

Your brain continues processing pre-sleep thoughts during the night. Planting the intention creates a kind of retrieval cue that makes the dream more accessible when you surface.

### 5. Write the feeling first, not the story

Most people try to document the plot — what happened, in what order. But dream memories are more emotion-first than event-first.

If you write "I felt anxious, like I was being watched and couldn't leave" first, the visual and narrative details often follow. Start with the emotional texture of the dream, then fill in what surrounds it.

## What to do with what you capture

Even incomplete notes, gathered over time, begin to reveal something. The same locations appearing in different dreams. A recurring quality of feeling — chase, loss, being watched. Symbols that return across weeks or months.

Over time, these patterns tell you something about what your mind keeps returning to. That's where dream journaling becomes more than a memory exercise — it becomes a conversation with the parts of yourself that don't get to speak during the day.

If a specific dream has stayed with you and you want to understand it, [Dreams & Omens](/) was built exactly for that: you describe what happened, and we interpret it in relation to your actual situation — not a generic dictionary entry.

And if you've been having a recurring dream — one that shows up again and again with variations — that's especially worth paying attention to. [Dreaming about your teeth falling out](/blog/what-does-it-mean-to-dream-about-teeth-falling-out) is one of the most common recurring themes, and what it means is almost never what people expect.

## But here's what matters more

The goal of dream journaling isn't only better memory. It's a kind of attentiveness — a practice of listening to the part of your mind that doesn't operate on the day's logic.

Your dreams aren't noise. They're a different kind of signal. And you can learn to receive them.

Three questions worth sitting with:

- *Is there a dream you've been wishing you could understand?*
- *What keeps appearing in your dreams, even when you can't explain why?*
- *What might you be ready to look at, if you gave yourself the space to?*

You don't need answers tonight. Start with the notebook and a moment of stillness. The rest follows.
$body3$,
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80',
  'An open journal with a pen resting on it, sitting on a wooden desk in warm morning light',
  'practice',
  ARRAY['dream journaling', 'dream recall', 'practice', 'beginners'],
  'published',
  NOW()
);
