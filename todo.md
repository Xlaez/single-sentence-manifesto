# The Internet's Single-Sentence Manifesto — Project Roadmap & Tracker

A gamified, real-time social experiment where users pay micro-amounts ($1+) to append words, sabotage previous contributions, and cement their mark in internet history.

---

## 🏛️ Phase 1: Architecture, Core Engine & Data Model
- [x] Initialize project stack (Next.js 15, React 19, Tailwind CSS, TypeScript, fast backend / database with real-time support)
- [x] Design data schema:
  - [x] `Word`: id, chapter_id, word_text, word_index, author_handle, author_url, modifier_type (`standard` | `veto` | `scream` | `redacted` | `period`), reactions (`fire`, `skull`), created_at
  - [x] `Chapter / Volume`: id, chapter_number, title, is_closed, closed_by_handle, total_words, created_at, closed_at
  - [x] `Transaction`: id, reference, amount, currency, status, payer_email, author_handle, word_text, placed_word_id, paid_at
- [x] Real-time synchronization layer (Server-Sent Events pub/sub) for sub-second updates across all connected clients
- [x] Content moderation & sanitization (bad word / slur filter, XSS prevention, single-word character limit)

---

## ⚡ Phase 2: Game Mechanics & Power-Ups
- [x] **Standard Word ($1.00 / ₦100)**:
  - [x] Append exactly 1 word to the current active sentence
- [x] **The Strikethrough / Veto ($2.00 / ₦200)**:
  - [x] Strike through the previous word (`~word~`) and replace it with a new word
  - [x] Retain audit trail of overridden words on hover
- [x] **The ALL-CAPS SCREAM ($2.00 / ₦200)**:
  - [x] Render word in enlarged, bold, glowing styling
- [x] **The Redacted CIA Blackout ($1.00 / ₦100)**:
  - [x] Black out a target word like a declassified government doc (tap to reveal original)
- [x] **The Period / Volume Closer ($5.00 / ₦500)**:
  - [x] Place a terminal period (`.`)
  - [x] Trigger celebratory UI climax (confetti, audio fanfare)
  - [x] Lock the current Volume into the "Hall of Sacred Texts" and immediately spawn Chapter (N + 1)

---

## 🎭 Phase 3: Live "Typewriter" Theater & Interactive UI
- [x] **Hero Sentence Display**:
  - [x] Dynamic flowing typography with blinking mechanical cursor at the tip
  - [x] Smooth animated insertion when new words land
- [x] **Interactive Word Inspection**:
  - [x] Hover / tap popover showing Word #, Author (@handle + avatar), timestamp, external link
  - [x] Instant reaction buttons (`🔥` Fire / `💀` Skull) with live counter
- [x] **Mechanical Typewriter Sound**:
  - [x] Procedural mechanical keystroke sound effect (`CLACK!`) via Web Audio API
  - [x] Bell ring (`DING!`) on chapter closure
  - [x] Global mute/unmute audio toggle

---

## 💳 Phase 4: Frictionless Payments & Paystack Paywall
- [x] Dual-currency support: USD ($) and NGN (₦100 baseline)
- [x] Paystack Inline Popup integration (`@paystack/inline-js`)
- [x] Automated webhook handler with HMAC SHA512 signature verification
- [x] Fallback simulated test mode for local staging

---

## 🛡️ Phase 5: Database Architecture & Idempotency
- [x] Supabase PostgreSQL production schema with RLS & compound indexes
- [x] Dual-engine fallback (Supabase cloud + local persistent store)
- [x] End-to-end 3-layer idempotency (client debounce + Paystack key + database fulfillment locking via `placed_word_id`)

---

## 🚀 Phase 6: Viral Flywheel, Haptics & Admin Operations
- [x] **1. Dynamic OpenGraph Social Card (`app/api/og/route.tsx`)**:
  - [x] Auto-generates 1200x630 retro editorial card with live sentence for X crawlers
- [x] **2. Live Drafting Lock & FOMO Countdown**:
  - [x] Live broadcast when someone opens the typewriter (`drafting_started`)
  - [x] Top banner showing active scribe + 30s countdown to build spectator tension
- [x] **3. Emoji & Hyphenated Slang Word Support**:
  - [x] Support Unicode single emojis (`🚀`, `💀`, `🔥`) and compound slang (`super-based`)
- [x] **4. Mobile Typewriter Haptic Feedback**:
  - [x] Procedural vibration pulses (`navigator.vibrate([12])`) on mobile keystrokes
- [x] **5. Owner Admin & Revenue Dashboard (`/admin`)**:
  - [x] Metrics: Total Revenue (USD + NGN), conversion rates, recent transactions
  - [x] Real-time financial telemetry & search filters
