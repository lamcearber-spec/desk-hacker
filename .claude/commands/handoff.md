# /handoff

Prepare session for handoff to next session or human review.

## Steps

1. Update WORKING.md with:
   - Current task status
   - What was completed
   - What's remaining
   - Any blockers discovered

2. Log to memory/YYYY-MM-DD.md:
   - Key decisions made
   - Files created/modified
   - Important context

3. If code was written:
   - Ensure tests pass
   - Commit with clear message
   - Note any TODOs left

4. Output summary:
   ```
   ## Session Handoff
   
   ### Completed
   - Item 1
   - Item 2
   
   ### In Progress
   - Item (X% done)
   
   ### Blocked
   - Item: reason
   
   ### Next Steps
   1. Do this
   2. Then this
   ```
