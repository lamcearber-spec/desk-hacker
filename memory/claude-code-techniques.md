# Claude Code Techniques (from Boris Cherny, Creator)

Source: https://x.com/bcherny/status/2017742741636321619
Date: 2026-01-31

## Top 10 Tips

### 1. Parallel Worktrees (BIGGEST UNLOCK)
- Spin up 3-5 git worktrees, each with its own Claude session
- Shell aliases: za, zb, zc to hop between them
- Dedicated "analysis" worktree for logs/BigQuery
- Native worktree support in Claude Desktop app

### 2. Plan Mode First
- Start every complex task in plan mode
- Pour energy into the plan → Claude 1-shots implementation
- One Claude writes plan, second Claude reviews as "staff engineer"
- When things go sideways → switch back to plan mode, re-plan (don't keep pushing)
- Tell Claude to enter plan mode for verification steps too

### 3. Invest in CLAUDE.md
- After every correction: "Update your CLAUDE.md so you don't make that mistake again"
- Claude is eerily good at writing rules for itself
- Ruthlessly edit over time until mistake rate drops
- Maintain a notes directory per project, point CLAUDE.md at it

### 4. Create Custom Skills/Commands
- If you do something more than once a day → make it a skill
- `/techdebt` command at end of every session to find/kill duplicated code
- Slash command to sync 7 days of Slack, GDrive, Asana, GitHub into context
- Analytics-engineer agents that write dbt models, review code, test changes

### 5. Let Claude Fix Bugs Autonomously
- Slack MCP + paste bug thread + say "fix" → zero context switching
- "Go fix the failing CI tests" - don't micromanage
- Point Claude at docker logs for distributed system troubleshooting

### 6. Level Up Prompting
- Challenge Claude: "Grill me on these changes and don't make a PR until I pass your test"
- "Prove to me this works" - have Claude diff behavior between main and feature branch
- After mediocre fix: "Knowing everything you know now, scrap this and implement the elegant solution"
- Write detailed specs, reduce ambiguity before handing work off

### 7. Terminal & Environment
- Ghostty terminal (synchronized rendering, 24-bit color, proper unicode)
- `/statusline` to show context usage + git branch
- Color-code and name terminal tabs (tmux)
- **Voice dictation** - you speak 3x faster than you type (fn x2 on macOS)

### 8. Use Subagents
- Append "use subagents" for more compute on a problem
- Offload tasks to subagents → keep main context clean
- Route permission requests to Opus 4.5 via hook for auto-approval of safe ones

### 9. Claude for Data/Analytics
- Use "bq" CLI for BigQuery queries directly in Claude Code
- BigQuery skill checked into codebase
- Works for any database with CLI, MCP, or API
- Boris: hasn't written SQL in 6+ months

### 10. Learning with Claude
- Enable "Explanatory" or "Learning" output style in /config
- Have Claude generate visual HTML presentations for unfamiliar code
- Ask for ASCII diagrams of protocols and codebases
- Spaced-repetition learning skill: explain understanding → Claude fills gaps

## Bonus Tips (from replies)

- **Chrome MCP** - validate web changes visually (game changer)
- **Auto-evaluate sessions** with score-based criteria for learnings
- **Code review in CI** - run `claude -p` in GitHub Actions (Anthropic does this)
- `/permissions` - pre-allow permissions to reduce prompts
- For duplication: make Claude explore codebase in plan phase, run `claude -p` in CI to catch duplicates

## Key Mindset
- "Treat it like a coworker, not a tool" - Mike Mickelson
- No one right way - experiment to see what works for you

---
*Saved: 2026-02-01*
