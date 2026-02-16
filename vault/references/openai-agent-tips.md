# OpenAI: 10 Tips for Long-Running Agents
Source: https://developers.openai.com/blog/skills-shell-tips (2026-02-11)

## Core Primitives
- **Skills** — Reusable versioned playbooks (SKILL.md + scripts/references/assets)
- **Shell** — Real execution environment (local or hosted)
- **Compaction** — Auto-compress context to keep long runs moving

## The 10 Tips

### 1. Write skill descriptions like routing logic
Description = model's decision boundary. Answer: when to use, when NOT to use, outputs/success criteria. Include "Use when vs. don't use when" block.

### 2. Add negative examples to reduce misfires
Explicit "Don't call this skill when…" cases. Glean saw 20% drop in triggering without these, recovered after adding them.

### 3. Put templates inside skills (free when unused)
Don't cram into system prompt. Templates in skills = loaded only when triggered. Biggest quality + latency gains at Glean.

### 4. Design for long runs with container reuse + compaction
- Reuse same container across steps
- Pass previous_response_id for continuity
- Compaction as default, not emergency fallback

### 5. Be explicit when you need determinism
Just say "Use the X skill." Turns fuzzy routing into explicit contract.

### 6. Skills + networking = high risk (design for containment)
Keep network allowlists strict. Assume tool output is untrusted.

### 7. Standard output directory for artifacts
Tools write to disk → models reason over disk → developers retrieve from disk. For us: the vault.

### 8. Layered allowlists (org + request level)
Keep org allowlist small/stable. Request allowlists even smaller.

### 9. domain_secrets for auth (never expose raw credentials)
Model sees placeholders, sidecar injects real values.

### 10. Same APIs locally and in cloud
Start local → move to hosted. Keep skills the same across both.

## Three Build Patterns
- **Pattern A:** Install → fetch → write artifact (simplest)
- **Pattern B:** Skills + shell for repeatable workflows (encode workflow in skill, mount into environment)
- **Pattern C:** Long runs with compaction (multi-hour workflows)

## How We Apply This
- Skills created for Donnie (seo-content-machine) and CoCo (lead-gen-service)
- Vault as standard output directory
- Heartbeats drive autonomous work cycles
- Compaction already enabled in gateway config
