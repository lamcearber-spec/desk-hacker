# CLAUDE.md - Rules for Claude Code

## Bash Behavior (CRITICAL)

**Avoid output buffering issues:**

1. **Don't pipe through:** `head`, `tail`, `less`, `more`
2. **Let commands complete fully** or use `--max-lines` flags
3. **Read log files directly** instead of tailing
4. **Run commands without pipes** when possible
5. **Use command-specific flags:**
   - ✅ `git log -n 10` instead of ❌ `git log | head -10`
   - ✅ `grep -m 10` instead of ❌ `grep | head -10`
6. **Avoid chained pipes** that buffer indefinitely

## Project Structure

```
/root/clawd/              # Main workspace
├── AGENTS.md             # Agent behavior rules
├── SOUL.md               # Personality/identity
├── USER.md               # About Arber
├── TOOLS.md              # Tool configs and credentials
├── MEMORY.md             # Long-term curated knowledge
├── WORKING.md            # Current task state (CHECK FIRST)
├── HEARTBEAT.md          # Heartbeat checklist
├── memory/               # Daily logs (YYYY-MM-DD.md)
├── life/areas/           # Knowledge graph (entities)
├── projects/             # Active projects
└── skills/               # Custom Clawdbot skills
```

## Workflow Rules

### Before Starting Any Task
1. Read WORKING.md to understand current state
2. Update WORKING.md with what you're about to do
3. If task is complex → enter plan mode first

### After Every Mistake
Update this file with a rule to prevent repeating it:
```
## [Category]
- Don't do X because Y
```

### After Every Session
- Update WORKING.md with progress
- Log significant events to memory/YYYY-MM-DD.md
- If task incomplete, leave clear handoff notes

## Code Style

- TypeScript > JavaScript
- Prefer named exports
- Use descriptive variable names
- Comment the "why", not the "what"
- Error handling: fail loudly, don't silently swallow

## Testing

- Run tests before committing: `npm test` or `pytest`
- If no tests exist, write them first for critical paths
- Don't skip failing tests, fix them

## Git

- Commit messages: `type: brief description`
- Types: feat, fix, docs, refactor, test, chore
- One logical change per commit
- Don't commit secrets or API keys

## Environment

- Node 22 available
- Python 3.x available
- Clawdbot workspace: /root/clawd
- Projects live in: /root/clawd/projects/

## Learned Lessons

### 2026-02-01
- Azure Germany West Central has NO model quota — use Sweden Central for OpenAI
- Always check quota/availability before creating resources

---
*This file is self-evolving. Update it after every correction.*
