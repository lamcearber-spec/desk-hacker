# /techdebt

Scan the current project for technical debt and duplicated code.

## Steps

1. Find duplicated code patterns:
   - Similar function implementations
   - Copy-pasted blocks
   - Repeated logic that could be abstracted

2. Identify code smells:
   - Functions over 50 lines
   - Files over 300 lines
   - Deeply nested conditionals (>3 levels)
   - Magic numbers/strings
   - TODO/FIXME/HACK comments

3. Check for:
   - Unused imports/variables
   - Dead code paths
   - Missing error handling
   - Inconsistent naming

## Output Format

```markdown
## Technical Debt Report

### 🔴 High Priority
- [file:line] Description

### 🟡 Medium Priority
- [file:line] Description

### 🟢 Low Priority (Nice to have)
- [file:line] Description

### 📊 Summary
- X duplicated patterns found
- Y long functions
- Z code smells
```

## Auto-fix Option

After showing report, ask:
"Want me to fix any of these? (all / high / specific items)"
