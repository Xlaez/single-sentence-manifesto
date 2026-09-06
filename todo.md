# The Internet's Single-Sentence Manifesto — Project Roadmap & Tracker

A gamified, real-time social experiment where users pay micro-amounts ($1+) to append words, sabotage previous contributions, and cement their mark in internet history.

---

## 🏛️ Phase 1: Architecture, Core Engine & Data Model
- [x] Initialize project stack (Next.js 15, React 19, Tailwind CSS, TypeScript, fast backend / database with real-time support)
- [x] Design data schema:
  - [x] `Word`: id, chapter_id, word_text, word_index, author_handle, author_url, modifier_type (`standard` | `veto` | `scream` | `redacted` | `period`), reactions (`fire`, `skull`), created_at
  - [x] `Chapter / Volume`: id, chapter_number, title, is_closed, closed_by_handle, total_words, created_at, closed_at
  - [x] `DraftSession`: active lock / countdown reserving the next slot
- [x] Real-time synchronization layer (Server-Sent Events pub/sub) for sub-second updates across all connected clients
- [x] Content moderation & sanitization (bad word / slur filter, XSS prevention, single-word character limit)

---

## ⚡ Phase 2: Game Mechanics & Power-Ups
- [x] **Standard Word ($1.00)**:
  - [x] Append exactly 1 word to the current active sentence
- [x] **The Strikethrough / Veto ($2.00)**:
  - [x] Strike through the previous word (`~word~`) and replace it with a new word
  - [x] Retain audit trail of overridden words on hover
- [x] **The ALL-CAPS SCREAM ($2.00)**:
  - [x] Render word in enlarged, bold, glowing styling
- [x] **The Redacted CIA Blackout ($1.00)**:
  - [x] Black out a target word like a declassified government doc (tap to reveal original)
- [x] **The Period / Volume Closer ($5.00)**:
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
- [x] **Mechanical Typewriter Sound & Haptics**:
  - [x] Satisfying mechanical keystroke sound effect on word placement (`CLACK!`)
  - [x] Bell ring (`DING!`) on line wraps or volume closures
  - [x] Global mute/unmute audio toggle
- [x] **The Live Drafting Lock**:
  - [x] 30-second live status banner / real-time feedback

---

## 💳 Phase 4: Frictionless 1-Tap Payments
- [x] One-tap simulated guest checkout (Apple Pay / Google Pay / Card microtransaction flow)
- [x] Zero signup friction: enter @handle + 1 word + 1 tap
- [x] Immediate payment confirmation & live real-time dispatch

---

## 🚀 Phase 5: The Viral Screenshot & Social Sharing Flywheel
- [x] **Dynamic OpenGraph / Canvas Receipt Generator**:
  - [x] Renders an eye-catching archival 16:9 social share card showing the sentence snippet, highlighted word, author badge, and word number
- [x] **One-Click Share to X (Twitter)**:
  - [x] Pre-populated tweet intent deep link: *"I just etched word #X ("word") into The Single-Sentence Manifesto. Try to ruin or veto my word: [URL]"*
  - [x] Share receipt modal immediately post-payment

---

## 🏆 Phase 6: Hall of Sacred Texts & Leaderboards
- [x] **Archive of Past Volumes**:
  - [x] Read-through viewer for completed chapters with credits to the *Closer*
- [x] **Hall of Clout (Leaderboards)**:
  - [x] Most Vetoed Words (Battlegrounds)
  - [x] Top Wordsmiths (most words contributed)
  - [x] Most Reacted Words (`🔥` / `💀`)
  - [x] Order of Closers ($5 period finishers)

---

## 🧪 Phase 7: Polish, Testing & Verification
- [x] Tested production Next.js build (`next build`)
- [x] Verified zero runtime errors and static page optimization
- [x] Verified full API suite (words, reactions, realtime SSE, chapters, leaderboard)
- [x] Verified volume closer mechanics and rollover to Chapter 2
