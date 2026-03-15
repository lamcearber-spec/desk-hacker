# Claude Code Build Workflow

> Based on Ross Mike's workflow from "Claude Code Clearly Explained" (Greg Isenberg podcast)
> Core principle: **Slop in = slop out.** Your input quality dictates your output quality.

---

## Step 1: Write Your Initial Plan

Create a plan file (`plan.md`) with your idea. Don't worry about perfection yet — just get the concept down with as much detail as you already know.

```markdown
# Project: [Name]

## What it does
[One paragraph description]

## Target user
[Who is this for?]

## Core features
1. [Feature 1] — [what it does, why it matters]
2. [Feature 2] — [what it does, why it matters]
3. [Feature 3] — [what it does, why it matters]

## Tech stack (if you have preferences)
- Frontend: [e.g. Next.js, React Native]
- Backend: [e.g. FastAPI, Node]
- Database: [e.g. PostgreSQL, SQLite]

## UI/UX direction
[Minimal? Dashboard-heavy? Wizard-style? Reference apps you like]

## What success looks like
[How do you know it's working?]
```

---

## Step 2: The "Ask User Question" Technique ⭐

This is the key step. Don't start building yet. Instead, paste this prompt into Claude Code:

```
Read the plan file at [path/to/plan.md].

Interview me in detail using the ask user question tool about literally anything — technical implementation, UI/UX concerns, trade-offs, edge cases, and decisions I haven't made yet.

Ask one question at a time. Wait for my answer before the next question. Cover:
- Workflow and user journey (step by step)
- UI/UX decisions (layout, navigation, style)
- Technical trade-offs (performance, simplicity, scalability)
- Edge cases and error handling
- Monetization or access control (if applicable)
- Data model and relationships

After all questions are answered, update the plan file with a detailed PRD incorporating all my answers.
```

**Why this works:** Claude stops guessing. YOU make the decisions. The resulting PRD is detailed enough that Claude won't have to improvise during implementation.

---

## Step 3: Build Feature by Feature

Once you have your detailed PRD, build **one feature at a time**:

```
Implement [Feature X] from the PRD at [path/to/plan.md].

Follow the acceptance criteria exactly. After implementing:
1. List what you built
2. List what you'd test
3. Ask me to verify before moving on
```

**Don't automate yet.** Build manually, test each feature, develop your instinct for what feels right.

---

## Rules to Follow

### 1. The 50% Context Rule
Never let context usage exceed 50%. When you hit ~40-50%:
- Summarize progress so far
- Start a fresh session
- Paste the summary + PRD into the new session
- Continue from where you left off

### 2. Earn the Right to Automate
Don't use automated loops (YOLO mode, etc.) until you've:
- Built at least one project manually end-to-end
- Developed "vibe QA" — the instinct to feel when something's off
- Learned how to fix things when they break

### 3. Plan > Tools
When output is bad, the fix is almost never "more tools" or MCP servers.
The fix is a better plan. Go back to Step 2.

### 4. Audacity Over Syntax
Everyone can clone features. What makes software different is **taste**.
Don't just build what works — build something that feels right.
Think about animations, colors, micro-interactions, UX flow.

### 5. Good Plan Structure
A good plan has:
- Specific features (not vague goals)
- Acceptance criteria per feature
- UI decisions already made
- Technical trade-offs resolved
- Edge cases considered

---

## Quick Reference — The Prompt

Copy-paste this anytime you start a new project:

```
Read the plan file at plan.md.

Interview me in detail about literally anything — technical implementation, UI/UX concerns, trade-offs, and decisions I haven't made yet.

Ask one question at a time. Wait for my answer before asking the next.

After all questions are answered, update plan.md with a detailed PRD incorporating all my answers.
```

---

*Source: [Claude Code Clearly Explained](https://www.youtube.com/watch?v=5G9PAIUs5Pk) — Greg Isenberg × Ross Mike*
