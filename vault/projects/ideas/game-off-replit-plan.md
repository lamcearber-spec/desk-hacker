# Game Off — Replit Agent Master Plan (v2)

> Drop this entire file as your first prompt to Replit Agent. It contains everything needed to build the MVP.
> 
> **Version 2** — Incorporates deep research on retention psychology, monetization mechanics, and a comprehensive 50-game catalog with tiered rollout.

---

## What You're Building

**Game Off** — A fully offline, ad-free collection of classic games with a hybrid unlock system. Think "NYT Games meets the App Store's best offline collection." A generous free core library for immediate play + daily unlocks for long-term retention + premium subscription for instant access to everything.

### The Target User

People who are offline and want to kill time. Period.
- ✈️ Airplane passengers (2-3 hour sessions)
- 🚂 Train/subway commuters (30-60 min sessions)
- 🏔️ Remote areas with no signal
- 📵 Anyone who wants distraction-free gaming

### Why This Will Win

We analyzed the #1 competitor ("Offline Games - No Wifi Games" by JindoBlu — 100M+ downloads, $130K+/mo) and thousands of real user reviews. Their fatal flaws:

1. **Aggressive ads** — Forced 30-second ads between every level. Even the $5.99 "remove ads" purchase still shows ads.
2. **Rigged AI** — Bots cheat, collude, "magically roll whatever number they need."
3. **Deceptive volume** — Claims "10,000 games" but has ~32 minigames × difficulty variants.
4. **No retention hook** — All games dumped at once. No reason to come back.
5. **No tutorials** — New players dropped cold.
6. **No meta-progression** — No stats, no streaks, no sense of accomplishment.

**Game Off's positioning:**
- ✅ ZERO ads, ZERO tracking — "Gaming the way it used to be"
- ✅ 50 curated games with infinite procedural replayability
- ✅ "Payload + Drip-Feed" — 15 games free instantly, 1 new game unlocked daily
- ✅ Stats engine with win streaks, fastest times, completion rates
- ✅ 30-second interactive tutorials for every game
- ✅ Offline-first, privacy-first
- ✅ Boutique curation > shovelware volume

---

## Tech Stack

- **Framework:** React Native with Expo (latest SDK)
- **Navigation:** React Navigation (bottom tabs + stack navigator)
- **Storage:** AsyncStorage for all local state
- **Language:** TypeScript
- **Notifications:** Expo Notifications (daily at 9:00 AM local)
- **No backend needed for MVP** — everything runs locally
- **Dictionary:** Embedded SQLite with SOWPODS word list for word games
- **Trivia:** Embedded SQLite from Open Trivia Database (50,000+ questions, CC licensed)

---

## The Hybrid Unlock Architecture (CRITICAL)

### The Problem We're Solving

Research shows 70% of users churn on Day 1. If someone downloads a game collection on a plane and gets ONE puzzle with "come back tomorrow" — instant uninstall. But if you dump everything at once, there's no reason to return.

### The Solution: Payload + Drip-Feed

**Layer 1 — The Payload (Day 1, Free):**
15 infinitely replayable games unlocked instantly. This guarantees 3+ hours of content from the moment of install. These are the "Core 15" — all procedurally generated, all infinite.

**Layer 2 — The Drip-Feed (Day 2+, Free):**
1 new game unlocked every day from the remaining catalog. Each day the app is opened, a new game appears. This is perceived as a GIFT, not a GATE — because the user already has 15 great games.

**Layer 3 — Premium ($2.99/mo):**
Instantly unlock the entire archive. Framed as an "Instant Access Pass" — not "pay to remove limits" but "skip the wait." Premium users also get unlimited hints and all difficulty levels.

### Why This Works Psychologically

1. **Zero-Price Effect:** Free core library collapses rational evaluation — users get hooked before considering payment.
2. **Endowed Progress:** Users feel they already OWN 15 games. Premium is an upgrade, not a purchase.
3. **Variable Reward:** Daily unlock triggers dopamine — "What game do I get today?"
4. **Loss Aversion:** Long streaks make users convert to premium to avoid losing progress.
5. **Paradox of Choice:** 15 curated games > 10,000 overwhelming options.

---

## App Structure

### Bottom Tab Navigation (3 tabs)

**Tab 1: "Today"**
- Hero card showing today's newly unlocked game (if any) — category icon, title, difficulty badge
- Big "PLAY" button
- If no new unlock today (Day 1 user or already opened): Show "Featured Game" from unlocked collection
- Below: countdown timer → "Next game unlocks in: 14h 23m 11s"
- Below: streak display → "🔥 Day 47 — 47 games in your collection"
- Quick-play grid: 4 recently played games with "Continue" buttons

**Tab 2: "Collection"**
- Category filter (horizontal scroll): All | Cards | Numbers | Logic | Words | Board | Match | Arcade | Jigsaw | Trivia
- Grid of game cards (2 columns)
- Each card shows: game icon, category badge, difficulty indicator, lock icon (if locked) OR stats (if played)
- Locked games show a frosted overlay with "Day X" or "🔒 Premium"
- Tapping locked game → bottom sheet: "Unlock with Premium" or "Arriving on Day X"
- Sort options: Category, Recently Played, Most Played, Alphabetical

**Tab 3: "Profile"**
- **Stats Dashboard:**
  - Total games unlocked / total available
  - Total games played (sessions)
  - Total time played
  - Overall win rate
  - Current streak (consecutive days)
  - Longest streak
- **Per-Category Stats:** Best time, win rate, games completed per category
- **Achievements:** Milestone badges (first win, 10 wins, 100 wins, 7-day streak, 30-day streak, etc.)
- **"Share Stats"** button → generates shareable image card
- Premium upgrade section (if not subscribed)
- Settings: notifications on/off, haptic feedback on/off, dark/light theme, sound on/off

### Onboarding (first launch only)
3 screens, swipeable:
1. "50 classic games. Zero ads. Works offline." + game grid animation
2. "15 games free today. A new one every day." + unlock animation
3. "No Wi-Fi needed. No tracking. Just play." → "Let's Go" button

---

## Unlock System Logic

### Rules
1. **Install day (Day 1):** Core 15 unlocked instantly
2. **Each subsequent day the app is opened:** 1 new game unlocked from the drip-feed queue
3. **Drip-feed order:** Follows Tier 2 → Tier 3 → Tier 4 priority from the game catalog (see Section below)
4. **Missed days:** Streak tracks consecutive days opened. Missing a day does NOT unlock bonus games retroactively — but the collection keeps growing from where it left off
5. **Premium users:** Everything unlocked instantly, all difficulties, unlimited hints

### Unlock Logic (runs on app open)
```
1. Get today's date (device local time, midnight-based)
2. Load lastOpenedDate from AsyncStorage
3. If today > lastOpenedDate:
   a. Increment totalDaysActive
   b. If totalDaysActive > 1: unlock next game from drip-feed queue
   c. Update streak counter (consecutive = lastOpenedDate was yesterday)
   d. Save lastOpenedDate = today
4. If today == lastOpenedDate:
   a. Do nothing (already unlocked today)
5. Edge case: if device date goes backward, ignore (no exploits)
6. If user is premium: all games always unlocked regardless
```

### AsyncStorage Schema
```json
{
  "firstInstallDate": "2026-03-13",
  "lastOpenedDate": "2026-03-13",
  "streakCount": 1,
  "longestStreak": 1,
  "totalDaysActive": 1,
  "isPremium": false,
  "unlockedGameIds": ["sudoku", "klondike", "freecell", "minesweeper", "word-search", "nonograms", "wordle", "spider", "match3", "reversi", "anagrams", "tents-trees", "bridges", "checkers", "snake"],
  "dripFeedIndex": 0,
  "gameStats": {
    "sudoku": {
      "totalPlayed": 12,
      "totalWon": 10,
      "bestTime": 245,
      "currentStreak": 5,
      "longestStreak": 8,
      "totalTimePlayed": 3600
    }
  },
  "achievements": ["first-win", "streak-7"],
  "settings": {
    "notifications": true,
    "hapticFeedback": true,
    "sound": true,
    "theme": "dark"
  }
}
```

---

## The Complete Game Catalog (50 Games)

### Tier 1: Core 15 (Free, Unlocked Day 1)

All procedurally generated. All infinitely replayable. This is the "flight test" payload.

| # | Game | Category | Session | Dev Difficulty | Notes |
|---|------|----------|---------|---------------|-------|
| 1 | **Sudoku** | Numbers | 5-30 min | Medium | 9×9 grid, backtracking generation, Easy/Medium/Hard via clue count |
| 2 | **Klondike Solitaire** | Cards | 3-10 min | Easy | The classic. Drag-and-drop, auto-complete, Turn 1 / Turn 3 variants |
| 3 | **FreeCell** | Cards | 5-15 min | Easy | 99.999% winnable seeds. Pure strategy, no luck. |
| 4 | **Minesweeper** | Logic | 2-15 min | Easy | Scalable grid + mine density. First tap never hits mine. |
| 5 | **Word Search** | Words | 3-10 min | Easy | Generated from SQLite dictionary. Themed word lists. |
| 6 | **Nonograms (Picross)** | Logic | 5-30 min | Medium | Reveals pixel art on completion. 5×5 / 10×10 / 15×15 |
| 7 | **Wordle-style (Lingo)** | Words | 2-5 min | Easy | 5-letter word deduction with color feedback. Infinite words. |
| 8 | **Spider Solitaire** | Cards | 10-30 min | Medium | 1/2/4 suit variants. Long-session champion. |
| 9 | **Match-3 (SameGame)** | Match | 3-10 min | Easy | Tap adjoining colored blocks. Gravity physics. Zero learning curve. |
| 10 | **Reversi** | Board | 5-15 min | Medium | Minimax AI with difficulty slider. Public domain name (not "Othello"). |
| 11 | **Anagrams (Jumble)** | Words | 3-10 min | Medium | Unscramble 6-8 letter words, find all sub-words. Dictionary validated. |
| 12 | **Tents and Trees** | Logic | 3-10 min | Easy | Tap-based. Place tents adjacent to trees using row/column counts. |
| 13 | **Hashiwokakero (Bridges)** | Logic | 5-20 min | Medium | Connect numbered islands with bridges. Scales beautifully to mobile. |
| 14 | **Checkers (Draughts)** | Board | 5-15 min | Medium | Minimax AI. Foundation testbed for board game AI engine. |
| 15 | **Snake** | Arcade | 2-10 min | Easy | Swipe-to-turn, one-finger. The ultimate mobile arcade classic. |

### Tier 2: Drip-Feed Days 2-16 (unlocked 1/day)

| # | Game | Category | Session | Dev Difficulty | Notes |
|---|------|----------|---------|---------------|-------|
| 16 | **KenKen (Mathdoku)** | Numbers | 5-20 min | Medium | Latin square + arithmetic groups. Sudoku's smarter cousin. |
| 17 | **Golf Solitaire** | Cards | 2-5 min | Easy | Ultra-fast card clearing. High win rate. Palate cleanser. |
| 18 | **Tri Peaks Solitaire** | Cards | 2-5 min | Easy | Momentum-based sequencing. Dopamine-heavy. |
| 19 | **Pyramid Solitaire** | Cards | 3-8 min | Easy | Pair cards summing to 13. Quick math-based card game. |
| 20 | **Slitherlink (Loopy)** | Logic | 5-20 min | Medium | Form a loop using numbered cell clues. Topological challenge. |
| 21 | **Light Up (Akari)** | Logic | 5-15 min | Medium | Place lightbulbs to illuminate grid. Visual, satisfying. |
| 22 | **Shikaku** | Logic | 5-15 min | Medium | Divide grid into rectangles. Drag-to-highlight = perfect for mobile. |
| 23 | **Mancala (Kalah)** | Board | 5-15 min | Easy | Ancient counting game. Tactile seed-sowing animation. Simple AI. |
| 24 | **Concentration (Pairs)** | Match | 2-5 min | Easy | Flip cards, find matching pairs. Classic memory game. |
| 25 | **Falling Blocks** | Arcade | 5-20 min | Medium | Tetris-style (generic). Tap-to-place shadow mechanic. NOT "Tetris." |
| 26 | **Futoshiki (Unequal)** | Numbers | 5-15 min | Medium | Latin square with inequality signs. Clean, minimalist. |
| 27 | **Untangle (Planarity)** | Logic | 3-15 min | Medium | Drag nodes until no lines cross. Deeply satisfying on touch. |
| 28 | **Net (Pipes)** | Logic | 5-15 min | Easy | Rotate pipe tiles to form connected network. Tap-to-rotate. |
| 29 | **Hangman** | Words | 2-5 min | Easy | Guess the word letter by letter. Classic, zero learning curve. |
| 30 | **Breakout / Arkanoid** | Arcade | 5-15 min | Medium | Swipe paddle to bounce ball. 1:1 touch-to-position controls. |

### Tier 3: Drip-Feed Days 17-35 (unlocked 1/day)

| # | Game | Category | Session | Dev Difficulty | Notes |
|---|------|----------|---------|---------------|-------|
| 31 | **Chess** | Board | 10-45 min | Hard | Embed Stockfish (or lightweight engine). Difficulty slider. Prestige title. |
| 32 | **Classic Jigsaw** | Jigsaw | 10-45 min | Hard | Bezier-curve piece generation. Pinch-to-zoom. 30 bundled images. |
| 33 | **Kakuro (Cross Sums)** | Numbers | 10-40 min | Hard | Number crossword. High ceiling. Sophisticated generation algorithm. |
| 34 | **Forty Thieves** | Cards | 15-25 min | Medium | 2-deck long-session card challenge. Perfect for flights. |
| 35 | **Mahjong Solitaire** | Match | 5-15 min | Medium | 3D layered tile matching. Must generate solvable layouts backward. |
| 36 | **Backgammon** | Board | 10-20 min | Medium | Dice-based probability. Different AI approach for RNG branching. |
| 37 | **Nurikabe** | Logic | 10-30 min | Medium | Island/wall mapping. Different topological logic skill. |
| 38 | **Yukon Solitaire** | Cards | 10-20 min | Medium | Advanced: move unsequenced stacks. For Klondike veterans. |
| 39 | **Auto-Fire Shooter** | Arcade | 5-15 min | Medium | Swipe to dodge, auto-fire. One-finger space shooter. |
| 40 | **Solo Trivia** | Trivia | 5-15 min | Easy | 50,000 questions from Open Trivia DB. Categories, no timer. |
| 41 | **Word Ladder** | Words | 2-5 min | Medium | Change one letter at a time to reach target word. |
| 42 | **Baker's Game** | Cards | 10-20 min | Easy | FreeCell predecessor. Build by suit = much harder. Low win rate. |
| 43 | **Hitori** | Numbers | 5-15 min | Medium | Eliminate duplicate numbers. No shaded cells touch adjacently. |
| 44 | **Hnefatafl (Viking Chess)** | Board | 10-30 min | Medium | Asymmetric: king escapes vs. attackers surround. Unique USP. |
| 45 | **Dominosa** | Logic | 10-20 min | Medium | Reconstruct grid using full domino set from number clues. |

### Tier 4: Drip-Feed Days 36-50 (unlocked 1/day)

| # | Game | Category | Session | Dev Difficulty | Notes |
|---|------|----------|---------|---------------|-------|
| 46 | **Hex Jigsaw** | Jigsaw | 5-20 min | Medium | Hexagonal jigsaw pieces. Simpler than classic jigsaw. |
| 47 | **Nine Men's Morris** | Board | 10-20 min | Medium | Ancient alignment game. Placement → movement phase. |
| 48 | **Scorpion Solitaire** | Cards | 10-20 min | Medium | Spider/Yukon hybrid for card veterans. |
| 49 | **Canfield Solitaire** | Cards | 5-10 min | Easy | Fast, brutal, low win rate. High-stakes challenge. |
| 50 | **Skyscrapers (Towers)** | Numbers | 5-20 min | Medium | 3D visualization on a 2D grid. Spatial reasoning challenge. |

---

## Game Engine Specifications

### CARD GAMES ENGINE (shared)

All card games share a base engine:
- Standard 52-card deck rendering (+ second deck for Forty Thieves)
- Drag-and-drop with magnetic snap to valid positions
- Tap-to-auto-move (tap a card and it moves to the best valid position)
- Undo button (unlimited)
- Auto-complete detection (when all remaining moves are forced)
- Card design: clean, large, high-contrast. Dark felt-green table background.
- Z-index layering for overlapping cards
- Running timer + move counter
- Win/loss detection per variant's rules
- Shuffle algorithm: Fisher-Yates. FreeCell seeds guaranteed solvable.

**Variant-specific rules are configuration, not separate engines.** Build one robust card engine, then configure:
- Tableau layout (columns, rows, cascade style)
- Foundation rules (suit-only, alternating color, etc.)
- Stock/waste behavior (turn 1, turn 3, no stock)
- Move rules (sequenced only, any face-up group, etc.)
- Win condition

### NUMBER PUZZLES ENGINE

**Sudoku:**
- Generate solved grid via backtracking
- Remove cells symmetrically based on difficulty: Easy (35+ given), Medium (28-34), Hard (22-27)
- Solver verifies unique solution
- Controls: tap cell → tap number (1-9) from bottom pad
- Highlight row/column/box of selected cell
- Errors shown in red (optional: toggle error checking)
- "Notes" toggle (pencil marks)
- Number pad shows remaining count per digit
- "Hint" button (reveals one correct cell, max 3/game free, unlimited premium)

**KenKen:** Latin square + arithmetic cages. Generate grid, partition into random groups, calculate target number with operator (+, −, ×, ÷). Solver verifies unique solution.

**Kakuro:** Number crossword. Generate valid sum intersections. Hard to procedurally generate well — use library of 500+ hand-verified seed patterns with randomized number assignments.

**Futoshiki:** Latin square with inequality constraints. Generate solved grid, add < > between cells, remove numbers.

**Skyscrapers:** Latin square with perimeter visibility clues. Generate solved grid, calculate how many "buildings" are visible from each edge.

**Hitori:** Fill grid with numbers, solver identifies which to shade. Rules: no duplicates in rows/columns after shading, shaded cells don't touch, unshaded cells form connected group.

### LOGIC PUZZLES ENGINE

All logic puzzles share:
- Grid-based rendering
- Tap to cycle cell states (empty → filled → marked-X → empty)
- Row/column clue display
- Pencil mark / note mode
- Timer
- Hint system (reveals one cell, limited for free)

**Minesweeper:** Grid dimensions scale difficulty. First tap safe. Flag/reveal toggle. Chord (auto-reveal when satisfied).

**Nonograms:** Generate random binary image, derive row/column clue numbers. Solver verifies no guessing required. Completion reveals the pixel art image with celebration.

**Slitherlink:** Generate random non-intersecting loop on dot grid. Calculate adjacent line counts per cell. Remove lines, show only numbers.

**Tents and Trees:** Place random trees, assign tents orthogonally, calculate row/column tent counts. Tap: tent / grass / empty cycle.

**Bridges (Hashiwokakero):** Generate spanning tree of nodes, sum orthogonal connections. Draw lines by dragging between islands.

**Light Up (Akari):** Place black walls on grid, calculate lightbulb placement that illuminates all cells. Tap to place/remove bulbs.

**Shikaku:** Generate non-overlapping rectangle partition. Place one number (= area) per rectangle. Drag to highlight rectangle areas.

**Nurikabe:** Divide grid into rooms/islands, shade walls. One number per island = island size.

**Net (Pipes):** Generate connected network, scramble tile rotations. Tap to rotate tiles until network connects.

**Untangle:** Generate planar graph, scramble node positions. Drag nodes until no edges cross.

**Dominosa:** Full domino set placed on grid. Show only numbers, user draws domino boundaries.

### WORD GAMES ENGINE

Requires embedded SQLite dictionary (SOWPODS — 267,000+ words).

**Word Search:** Select 8-12 themed words from dictionary. Place in grid (horizontal, vertical, diagonal, reverse). Fill remaining with frequency-weighted random letters. Swipe to select found words.

**Wordle-style (Lingo):** Random 5-letter word from dictionary. 6 guesses. Green = correct position, Yellow = wrong position, Gray = not in word. Keyboard tracks used letters.

**Anagrams:** Select 7-letter word. Scramble letters. Player finds all valid sub-words (3+ letters). Dictionary validation. Show "X of Y found" progress.

**Hangman:** Random word from themed category. Letter-by-letter guessing. 6 wrong guesses = game over. Category hint shown.

**Word Ladder:** Select start and end words (same length, path exists). Player changes one letter per step. Each step must be a valid word. Validate against dictionary.

### BOARD GAMES ENGINE

All board games require AI opponents. Shared AI framework:
- Minimax algorithm with alpha-beta pruning
- Difficulty slider: Novice (random moves mixed in), Intermediate (shallow search), Expert (deep search), Master (full depth)
- Move animation + thinking indicator
- Undo button
- Move history log

**Reversi:** 8×8 grid. Flanking capture. Minimax with positional evaluation (corners = high value).

**Checkers:** 8×8 diagonal movement. Jumping captures. King promotion. Forced capture rule.

**Mancala:** 2×6 board + stores. Seed-sowing mechanic with capture. Minimax is straightforward.

**Chess:** Embed lightweight engine (or build simplified minimax for MVP). Full rules: castling, en passant, promotion, check/checkmate/stalemate detection. Difficulty via search depth limit.

**Backgammon:** Dice rolls + pip movement. Bearing off. Doubling cube optional. AI handles probability branching.

**Hnefatafl:** Asymmetric — king + defenders vs. attackers. King must reach corner. Attackers must surround king.

**Nine Men's Morris:** Placement phase → movement phase. Mill formation = remove opponent piece.

### MATCH & MEMORY ENGINE

**Match-3 (SameGame):** Grid of colored blocks. Tap group of 2+ same-color adjacent blocks to clear. Gravity fills gaps. Score based on group size (bigger = exponentially more points). Game over when no groups remain.

**Concentration (Pairs):** Grid of face-down cards. Flip two per turn. Match = removed. Miss = flip back. Timer + move counter.

**Mahjong Solitaire:** 3D tile layout. Match exposed, unblocked identical tile pairs. Layout generated backward from solved state to ensure solvability. Shuffle button if stuck.

**15 Puzzle (Tile Swap):** 4×4 grid, tiles 1-15, one empty space. Slide tiles to restore numerical order. Swipe controls. Move counter.

### ARCADE ENGINE

All arcade games: ONE-FINGER control only. No virtual D-pads, no multi-button.

**Snake:** Swipe direction to turn. Growing snake, food collection, wall/self collision = game over. Speed increases with length. High score tracking.

**Falling Blocks:** Tetromino-style shapes fall. Tap left/right side to move, tap center to rotate, swipe down to drop. Shadow shows landing position. Complete rows to clear. NOT called "Tetris." Generic shapes only.

**Breakout:** Finger position = paddle position (1:1 mapping, not swipe-relative). Ball physics with angle reflection. Brick layouts procedurally generated. Power-ups optional.

**Auto-Fire Shooter:** Ship at bottom fires automatically. Swipe left/right to dodge. Enemy waves descend. Increasing difficulty. Score-based, no lives (one hit = game over).

### JIGSAW ENGINE

**Classic Jigsaw:**
- Bundle 30 royalty-free images (landscapes, animals, gradients — use colored gradient rectangles as placeholder)
- Procedural Bezier-curve cuts to generate interlocking pieces
- Piece counts: Easy (9/3×3), Medium (16/4×4), Hard (25/5×5), Expert (36/6×6)
- Pieces shuffled in scrollable tray at bottom
- Drag to board, magnetic snap when close to correct position
- Pinch-to-zoom on board area
- Reference image thumbnail (toggleable)
- Timer, celebration on completion with full image reveal

**Hex Jigsaw:** Same as above but hexagonal grid pieces. Simpler spatial processing.

### TRIVIA ENGINE

- Embedded SQLite database from Open Trivia Database (50,000+ questions, Creative Commons)
- Categories: General Knowledge, Science, History, Geography, Entertainment, Sports, Art, Nature
- Multiple choice (4 options) OR True/False
- No timer (user thinks at own pace — "slow trivia" differentiator)
- Streak mode: how many correct in a row before first wrong answer
- Campaign mode: 10 questions per round, score tracking
- Difficulty filter: Easy / Medium / Hard

---

## Stats Engine (META-PROGRESSION)

This is what competitors completely miss. No cloud needed — all local.

### Global Stats
- Total games played (all-time sessions)
- Total time played
- Overall win rate
- Current daily streak
- Longest daily streak
- Games unlocked (X / 50)
- Achievements earned (X / Y)

### Per-Game Stats
- Times played
- Win rate
- Best time (for timed games)
- Best score (for scored games)
- Current win streak
- Longest win streak
- Average session length

### Achievements System
Achievements are badges displayed on Profile tab. Examples:

**Universal:**
- 🎮 First Game — Complete any game
- 🔥 Week Warrior — 7-day daily streak
- 🔥 Monthly Master — 30-day daily streak
- 🔥 Yearly Legend — 365-day daily streak
- 📚 Collector — Unlock 25 games
- 📚 Completionist — Unlock all 50 games
- ⏱️ Speed Demon — Complete any game in under 60 seconds
- 🏆 Century — Win 100 games total
- 🏆 Thousand Club — Win 1,000 games total

**Category-specific:**
- ♠️ Card Shark — Win 50 card games
- 🧠 Logic Lord — Win 50 logic puzzles
- 📖 Wordsmith — Win 50 word games
- ♟️ Strategist — Win 50 board games

**Game-specific:**
- 🔢 Sudoku Sprint — Complete Hard Sudoku in under 5 minutes
- 💣 Mine Sweeper — Clear Expert Minesweeper with no flags
- 🃏 Perfect FreeCell — Win 10 FreeCell games in a row

### Share Card
"Share Stats" generates an image:
```
┌──────────────────────────┐
│  🔥 47-Day Streak!       │
│                          │
│  234 games won           │
│  38/50 games unlocked    │
│  72% win rate            │
│                          │
│  Game Off                │
│  [App Store badge]       │
└──────────────────────────┘
```
- Dark background, accent colors
- Shareable to Instagram Stories, TikTok, iMessage
- Use `expo-sharing` + `react-native-view-shot`

---

## Pricing & Paywall

### Premium = "Instant Access Pass"

Frame it as a luxury shortcut, NOT a penalty for free users.

**Pricing tiers:**
1. **Monthly:** $2.99/mo
2. **Annual:** $19.99/yr (Save 44%) — **recommended, highlighted**
3. **Lifetime:** $39.99 one-time (price anchor — makes annual look cheap)

**First 24 hours after install:** 50% off annual ($9.99/yr first year). Urgency trigger.

### Premium Screen (Profile tab + locked game taps)
- Hero: "Unlock Everything. Instantly."
- Benefits:
  - ✅ All 50 games unlocked now
  - ✅ All difficulty levels
  - ✅ Unlimited hints
  - ✅ Play any game, any time
  - ✅ Support indie development ❤️
- Show lifetime price FIRST (anchor), then annual (highlighted "Best Value"), then monthly
- "Start 7-Day Free Trial" button on annual plan
- Social proof: "Join X,000 players" (update dynamically once we have numbers)

### Free vs Premium Behavior
| Feature | Free | Premium |
|---------|------|---------|
| Core 15 games | ✅ All | ✅ All |
| Daily unlocks | ✅ 1/day | N/A (all unlocked) |
| Remaining games | 🔒 Locked until drip-feed | ✅ All unlocked |
| Hints per game | 3 | Unlimited |
| Difficulty levels | Easy + Medium | All (including Expert) |
| Stats & streaks | ✅ Full | ✅ Full |
| Achievements | ✅ Full | ✅ Full |

---

## Tutorial System

Every game gets a 30-second interactive tutorial on FIRST play:

1. Overlay dims the game board
2. Spotlight highlights relevant area
3. Short text explains the core rule (1-2 sentences max)
4. User performs one guided action (e.g., "Tap this cell, then tap 5")
5. "Got it!" button dismisses
6. Tutorial flag saved per game — never shown again
7. "How to Play" accessible from pause menu (re-watch tutorial)

---

## Design System

### Colors
- Background: #0F0F1A (very dark navy)
- Card/Surface: #1A1A2E
- Accent Primary: #6C63FF (purple)
- Accent Secondary: #FF6B6B (coral — streaks, fire)
- Success: #4CAF50
- Error: #FF5252
- Text Primary: #FFFFFF
- Text Secondary: #8888AA
- Card Games Table: #1B5E20 (dark felt green)

### Typography
- Headers: Bold, large, clean sans-serif (System font or Inter)
- Body: Regular, 16px minimum
- Puzzle numbers/letters: Monospace, large, high contrast
- Stats numbers: Tabular numerals

### Components
- Game cards: rounded (16px), subtle shadow, 2-column grid
- Buttons: pill-shaped, 48px minimum touch target, haptic on tap
- Bottom sheets: for premium prompts, locked game info, game-over screens
- Category badges: small colored pills
- Animations: spring transitions, confetti on achievements, smooth card/piece movement

### Haptic Feedback
- Light tap: cell selection, button press, card pick up
- Medium: game completion, card snap to position
- Heavy: streak milestone (7, 30, 100, 365 days), achievement unlock

### Sound (optional, toggle in settings)
- Subtle tap sounds for interactions
- Satisfying "snap" for card placement
- Celebration sound on game completion
- Muted by default — respect the offline/transit context

---

## Push Notifications

Daily at 9:00 AM local time:
- New unlock: "🎮 New game unlocked: [Game Name]! Your collection grows..."
- Streak active: "🔥 [X]-day streak! A new game is waiting for you."
- Streak at risk (missed yesterday): "Your [X]-day streak needs you today!"
- Premium nudge (Day 7): "Loving Game Off? Unlock all 50 games instantly →"

---

## IP & Legal Safety

**MUST use these generic names (not trademarked names):**
- ✅ "Falling Blocks" — NOT "Tetris"
- ✅ "Reversi" — NOT "Othello"
- ✅ "Yacht Dice" — if dice game added later, NOT "Yahtzee"
- ✅ "Crazy Eights" — NOT "Uno"
- ✅ "Lingo" or just "Word Guess" — NOT "Wordle"

**Game mechanics are NOT copyrightable.** Only names, specific board designs, and trade dress are protected. All our implementations use standard public-domain rulesets.

---

## App Store Optimization (ASO)

### Keywords to target:
`offline games, no wifi games, airplane mode games, no ads games, classic games, puzzle collection, solitaire, sudoku, minesweeper, brain games, flight games, travel games`

### App Store Screenshots (in order):
1. **Hero:** Bold text "100% OFFLINE. ZERO ADS. FOREVER." over gameplay montage
2. **Gameplay:** Satisfying Sudoku/Solitaire/Minesweeper in action (fluid, no menus)
3. **Collection:** "50 Hand-Crafted Classics" — show the beautiful game grid
4. **Daily Unlock:** "A new game every day. Build your collection."
5. **Stats:** "Track your progress. Beat your best."

### App Store Description Hook:
"Your flight is 3 hours long. We've got you covered. 50 classic games, fully offline, zero ads. Download once, play anywhere."

### Video Preview:
Show 15 seconds of uninterrupted, fluid gameplay across 3-4 games. No menus, no padlocks, no text overlays. Just satisfying game mechanics.

---

## Build Order (FOLLOW THIS SEQUENCE)

### Phase 1: Shell (Day 1-2)
1. Project setup + Expo config
2. Bottom tab navigation (Today / Collection / Profile)
3. Onboarding flow (3 screens)
4. AsyncStorage schema + unlock system logic
5. Dark theme + design system (colors, fonts, components)

### Phase 2: Core Card Engine (Day 3-5)
6. Shared card rendering engine (deck, drag-drop, z-index, snap)
7. Klondike Solitaire (first playable game)
8. FreeCell (reuse card engine, different rules)
9. Spider Solitaire (reuse card engine)

### Phase 3: Core Logic Engine (Day 6-9)
10. Shared grid/cell rendering engine
11. Sudoku (with generation + solver)
12. Minesweeper
13. Nonograms (Picross)
14. Tents and Trees

### Phase 4: Core Word + Match + Arcade (Day 10-13)
15. SQLite dictionary integration
16. Word Search
17. Wordle-style (Lingo)
18. Anagrams
19. Match-3 (SameGame)
20. Snake

### Phase 5: Core Board Games (Day 14-16)
21. Shared AI framework (minimax + alpha-beta)
22. Reversi
23. Checkers
24. Bridges (Hashiwokakero)

### Phase 6: Today + Collection + Profile Tabs (Day 17-19)
25. Today tab with hero card, countdown, streak display
26. Collection tab with category filter, game grid, lock states
27. Profile tab with stats dashboard, achievements
28. Tutorial system overlay

### Phase 7: Tier 2 Games (Day 20-28)
29. KenKen, Futoshiki, Slitherlink, Light Up, Shikaku
30. Golf, Tri Peaks, Pyramid solitaire variants
31. Mancala
32. Concentration (Pairs), Falling Blocks
33. Untangle, Net (Pipes), Hangman
34. Breakout

### Phase 8: Tier 3 Games (Day 29-38)
35. Chess (with embedded engine or simplified AI)
36. Classic Jigsaw (Bezier cuts, drag, pinch-zoom)
37. Kakuro, Backgammon, Mahjong Solitaire
38. Remaining Tier 3 games
39. Trivia engine + SQLite question database

### Phase 9: Tier 4 + Polish (Day 39-45)
40. Remaining Tier 4 games
41. Share card generation
42. Premium paywall UI (mock IAP for MVP)
43. Push notifications
44. Achievements system completion
45. Haptic feedback, sound effects, animations polish

### Phase 10: Launch Prep (Day 46-50)
46. Performance optimization
47. App Store assets (screenshots, preview video, description)
48. Beta testing
49. Bug fixes
50. Submit to App Store + Google Play

**Test after each phase before moving to the next.**

---

## What NOT to Build (MVP scope)

- ❌ No backend / no accounts / no login
- ❌ No leaderboards (v2 — requires backend)
- ❌ No social features beyond sharing (v2)
- ❌ No real IAP integration yet (mock the paywall UI, implement IAP in Phase 2)
- ❌ No multiplayer
- ❌ No additional games beyond the 50 (v2: add Peg Solitaire, Go, Yacht Dice, etc.)
- ❌ No crossword puzzles (require human-authored clues, can't procedurally generate well)
- ❌ No precision platformers or dual-stick games (bad on touchscreen)
- ❌ No 4-deck solitaire variants (cards too small on 6-inch screen)

---

## Games to NEVER Add (and why)

- **Tetris (by name)** — The Tetris Company litigates aggressively. Use "Falling Blocks."
- **Scrabble** — Trademarked board layout + tile distribution. If ever adding, reimagine completely.
- **Othello (by name)** — Trademarked by MegaHouse/Mattel. Use "Reversi."
- **Yahtzee / Uno** — Trademarked by Hasbro/Mattel. Use "Yacht Dice" / "Crazy Eights."
- **Precision platformers** — Virtual D-pads are terrible on glass screens.
- **Dual-stick shooters** — Two thumbs obscure the screen.
- **Grand strategy (Risk, etc.)** — Constant zoom/pan on tiny maps is miserable.
- **4-deck solitaire** — 208 cards on a 6-inch screen = unreadable.

---

## Marketing Positioning

### Tagline Options (pick one):
- "Your flight is 3 hours long. We've got you covered."
- "50 classic games. Zero ads. Works offline."
- "No Wi-Fi. No Ads. Just Play."
- "Download once, play anywhere."
- "Quality over quantity. A hand-crafted arcade in your pocket."

### Positioning Statement:
Game Off is the premium offline game collection for people who refuse to watch ads between every level. 50 hand-picked classics, procedurally generated for infinite replay, with zero internet required. Built for flights, trains, and anywhere the signal drops.

### Competitor Attack Angles:
- Their "10,000 games" = 32 games × difficulty variants. Ours = 50 genuinely different games.
- Their "ad-free" = still shows ads after purchase. Ours = literally zero ads, ever.
- Their AI = rigged, cheating bots. Ours = honest minimax with difficulty slider.
- Their collection = dumped at once, no reason to return. Ours = daily unlock ritual + stats progression.

---

*This plan synthesizes competitor analysis (100M+ download apps, 400K+ reviews), behavioral psychology research (Hooked Model, loss aversion, endowed progress, paradox of choice), and a comprehensive catalog of 50 procedurally generated classic games ranked by implementation priority. Build exactly this.*
