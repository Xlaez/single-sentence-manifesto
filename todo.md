# The Internet's Single-Sentence Manifesto — Project Roadmap & Tracker

A gamified, real-time social experiment where users pay micro-amounts ($1+) to append words, sabotage previous contributions, and cement their mark in internet history.

---

## 🏛️ Phase 1: Architecture, Core Engine & Data Model
- [ ] Initialize project stack (Next.js / Vite + React, Tailwind CSS, TypeScript, fast backend / database with real-time support)
- [ ] Design data schema:
  - [ ] `Word`: id, chapter_id, word_text, word_index, author_handle, author_url, author_avatar, modifier_type (`standard` | `strikethrough` | `all_caps` | `redacted` | `period`), reactions (`fire`, `skull`), created_at
  - [ ] `Chapter / Volume`: id, chapter_number, title, is_closed, closed_by_handle, total_words, created_at, closed_at
  - [ ] `DraftSession`: active lock / countdown reserving the next slot
- [ ] Real-time synchronization layer (WebSockets / SSE or Supabase Realtime) for sub-second updates across all connected clients
- [ ] Content moderation & sanitization (bad word / slur filter, XSS prevention, single-word character limit)

---

## ⚡ Phase 2: Game Mechanics & Power-Ups
- [ ] **Standard Word ($1.00)**:
  - [ ] Append exactly 1 word to the current active sentence
- [ ] **The Strikethrough / Veto ($2.00)**:
  - [ ] Strike through the previous word (`~word~`) and replace it with a new word
  - [ ] Retain audit trail of overridden words on hover
- [ ] **The ALL-CAPS SCREAM ($2.00)**:
  - [ ] Render word in enlarged, bold, glowing styling
- [ ] **The Redacted CIA Blackout ($1.00)**:
  - [ ] Black out a target word like a declassified government doc (tap to reveal original)
- [ ] **The Period / Volume Closer ($5.00)**:
  - [ ] Place a terminal period (`.`)
  - [ ] Trigger celebratory UI climax (confetti, screen shake, audio fanfare)
  - [ ] Lock the current Volume into the "Hall of Sacred Texts" and immediately spawn Chapter (N + 1)

---

## 🎭 Phase 3: Live "Typewriter" Theater & Interactive UI
- [ ] **Hero Sentence Display**:
  - [ ] Dynamic flowing typography with blinking mechanical cursor at the tip
  - [ ] Smooth animated insertion when new words land
- [ ] **Interactive Word Inspection**:
  - [ ] Hover / tap popover showing Word #, Author (@handle + avatar), timestamp, external link
  - [ ] Instant reaction buttons (`🔥` Fire / `💀` Skull) with live counter
- [ ] **Mechanical Typewriter Sound & Haptics**:
  - [ ] Satisfying mechanical keystroke sound effect on word placement (`CLACK!`)
  - [ ] Bell ring (`DING!`) on line wraps or volume closures
  - [ ] Global mute/unmute audio toggle
- [ ] **The Live Drafting Lock**:
  - [ ] 30-second live status banner: *"Someone is currently drafting Word #X..."*

---

## 💳 Phase 4: Frictionless 1-Tap Payments
- [ ] Payment Gateway Integration (Stripe Elements / Apple Pay / Google Pay / Cash App Pay)
- [ ] Guest checkout flow: zero registration, enter @handle + 1 word + 1 tap to pay
- [ ] Webhook handler for instant payment confirmation & real-time dispatch

---

## 🚀 Phase 5: The Viral Screenshot & Social Sharing Flywheel
- [ ] **Dynamic OpenGraph / Canvas Receipt Generator**:
  - [ ] Renders an eye-catching 16:9 social share card showing the sentence snippet, the highlighted word, author badge, and word number
- [ ] **One-Click Share to X (Twitter)**:
  - [ ] Pre-populated tweet: *"I just added my word to the Internet's Manifesto at #WordX. Try to ruin it: [URL]"*
  - [ ] Share receipt modal immediately post-payment

---

## 🏆 Phase 6: Hall of Sacred Texts & Leaderboards
- [ ] **Archive of Past Volumes**:
  - [ ] Read-through viewer for completed chapters with credits to the *Closer*
- [ ] **Hall of Clout (Leaderboards)**:
  - [ ] Most Vetoed Words (Battlegrounds)
  - [ ] Top Wordsmiths (most words contributed)
  - [ ] Most Reacted Words (`🔥` / `💀`)

---

## 🧪 Phase 7: Polish, Testing & Deployment
- [ ] Stress test WebSocket concurrency under simulated traffic
- [ ] Mobile responsive layout & touch gestures optimization
- [ ] SEO & Social metadata tuning
- [ ] Production deployment & custom domain setup
