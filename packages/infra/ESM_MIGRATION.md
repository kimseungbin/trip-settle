# AWS CDK ESM Migration Roadmap

**Status:** Phase 1 Complete ✅
**Last Updated:** 2025-01-27
**Current Module System:** CommonJS with tsx execution
**Target:** Full ESM Support

---

## Overview

This document tracks the progressive migration of the infrastructure package from CommonJS to full ECMAScript Modules (ESM) support. The migration follows a phased approach to minimize risk and ensure stability at each step.

## Current State

- ✅ **Execution:** tsx (2.7x faster than ts-node)
- ✅ **Type Checking:** Separate `npm run type-check` script
- ✅ **Module System:** CommonJS (tsconfig: `"module": "commonjs"`)
- ✅ **Package Type:** Not declared (defaults to CommonJS)
- ✅ **Import Syntax:** Works with both CJS and ESM packages

## Benefits Already Achieved

- **Performance:** ~2.7x speedup in CDK execution (tsx vs ts-node)
- **ESM Package Support:** Can import pure ESM packages without errors
- **Type Safety:** Separate type-checking ensures no type errors slip through
- **Stability:** Zero breaking changes to existing code

---

## Migration Phases

### ✅ Phase 1: Foundation - Minimal tsx Migration (COMPLETE)

**Completed:** 2025-01-27
**Risk Level:** 🟢 LOW
**Status:** ✅ STABLE

#### Changes Made:
1. ✅ Installed `tsx` v4.20.6 as dev dependency
2. ✅ Updated `cdk.json` to use `npx tsx bin/infra.ts`
3. ✅ Added `type-check` script to package.json
4. ✅ Updated tsconfig.json with `noEmit` and `incremental` options

#### Verification:
- ✅ `npm run synth --workspace=infra` works
- ✅ `npm run type-check --workspace=infra` passes
- ✅ No regressions in CDK functionality

#### Files Modified:
- `packages/infra/package.json` - Added tsx dep, added type-check script
- `packages/infra/cdk.json` - Changed executor from ts-node to tsx
- `packages/infra/tsconfig.json` - Added noEmit and incremental flags

---

### 🔄 Phase 2: Validation & Monitoring (IN PROGRESS)

**Start Date:** 2025-01-27
**Duration:** 1-2 weeks
**Risk Level:** 🟢 LOW
**Status:** 📊 OBSERVING

#### Objectives:
- Monitor CDK operations in development
- Ensure tsx remains stable across all use cases
- Collect feedback and identify any edge cases
- Verify CI/CD pipeline compatibility

#### Success Criteria:
- [ ] No issues reported in 2 weeks
- [ ] CI/CD pipeline stable
- [ ] All CDK commands work reliably (synth, diff, deploy, destroy)
- [ ] Team comfortable with tsx

#### Monitoring Checklist:
- [ ] Week 1: Daily CDK operations (synth, diff)
- [ ] Week 2: Deploy to test environment (if applicable)
- [ ] Check CI/CD logs for any warnings/errors
- [ ] Verify type-check runs correctly in CI

#### Decision Point:
**GO/NO-GO for Phase 3?**
If stable after 2 weeks → Proceed to TypeScript config updates
If issues found → Troubleshoot and extend monitoring period

---

### ⏸️ Phase 3A: TypeScript Config Modernization (PENDING)

**Start Date:** TBD (after Phase 2 approval)
**Duration:** 1 day
**Risk Level:** 🟡 MEDIUM
**Status:** 📋 PLANNED

#### Changes Planned:
Update `tsconfig.json` to use modern ESM-compatible settings while maintaining tsx execution:

```json
{
  "compilerOptions": {
    "target": "ES2022",           // ⬆️ Upgrade from ES2021
    "module": "ES2022",            // 🔄 Change from CommonJS
    "moduleResolution": "bundler", // 🔄 Modern resolution
    "lib": ["ES2022"],             // ⬆️ Upgrade libs
    // Keep existing strict settings
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    // Keep existing practical settings
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": false,
    // Keep optimizations from Phase 1
    "noEmit": true,
    "incremental": true,
    // Keep existing settings
    "strictPropertyInitialization": false,
    "types": ["node"]
  }
}
```

#### Why `moduleResolution: "bundler"`?
- Modern alternative to `"node16"` or `"nodenext"`
- Works better with tsx and esbuild
- Doesn't enforce `.js` extensions in imports (yet)
- Provides ESM semantics without breaking changes

#### Testing Plan:
1. [ ] Update tsconfig.json
2. [ ] Run `npm run type-check` (must pass)
3. [ ] Verify VS Code IntelliSense works
4. [ ] Run `npm run synth` (should work - tsx handles it)
5. [ ] Check for any new type errors in IDE
6. [ ] Test all CDK commands (diff, deploy if available)

#### Success Criteria:
- [ ] Type checking passes
- [ ] IDE IntelliSense works correctly
- [ ] No new type errors introduced
- [ ] CDK operations still work

#### Rollback Plan:
Git revert tsconfig.json if type errors occur

---

### ⏸️ Phase 3B: Package.json ESM Declaration (PENDING)

**Start Date:** TBD (after Phase 3A approval)
**Duration:** 1 day
**Risk Level:** 🟡 MEDIUM
**Status:** 📋 PLANNED

#### Changes Planned:
Add ESM declaration to `package.json`:

```json
{
  "type": "module"
}
```

#### Impact Analysis:
- **Files affected:** All `.ts` files interpreted as ESM by Node.js
- **Import statements:** Will need `.js` extensions (Phase 4)
- **Requires:** Must be converted to `import` statements (Phase 4)
- **__dirname:** Must be replaced with `import.meta.dirname` (Phase 4)

**Note:** Phase 3B is intentionally separate from Phase 4 to isolate the impact of the package.json change before making code changes.

#### Testing Plan:
1. [ ] Add `"type": "module"` to package.json
2. [ ] Run `npm run synth`
3. [ ] Check for any runtime errors (likely will occur - expected!)
4. [ ] Document errors for Phase 4 fixes
5. [ ] If errors are minor, proceed to Phase 4
6. [ ] If errors are severe, rollback and reassess

#### Expected Errors:
- Import statements may need `.js` extensions
- `__dirname` may be undefined
- Some Node.js APIs may behave differently

#### Success Criteria:
- [ ] `"type": "module"` added to package.json
- [ ] Errors documented and understood
- [ ] Ready to proceed to Phase 4 code changes

#### Rollback Plan:
Remove `"type": "module"` if testing reveals unexpected complexity

---

### ⏸️ Phase 4: Code Migration to Pure ESM (PENDING)

**Start Date:** TBD (after Phase 3B)
**Duration:** 2-3 days
**Risk Level:** 🟠 MEDIUM-HIGH
**Status:** 📋 PLANNED

#### Changes Required:

##### 4.1: Replace CommonJS Idioms

**File: `bin/infra.ts`**
```typescript
// BEFORE (CommonJS)
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { TripSettleStack } from '../lib/trip-settle-stack'

// AFTER (ESM)
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { TripSettleStack } from '../lib/trip-settle-stack.js'  // Add .js extension

// If using __dirname anywhere:
// BEFORE:
// const configPath = path.join(__dirname, '../config')

// AFTER (Node.js 20.11+):
// const configPath = path.join(import.meta.dirname, '../config')
```

**File: `lib/trip-settle-stack.ts`**
```typescript
// BEFORE
import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds'
import { config } from '../config'

// AFTER
import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds'
import { config } from '../config/index.js'  // Add .js extension
```

**File: `config/index.ts`**
```typescript
// Check for any path operations using __dirname
// Replace with import.meta.dirname if found
```

##### 4.2: Add File Extensions to Imports

All relative imports must include `.js` extension (TypeScript requirement for ESM):

```typescript
// BEFORE
import { TripSettleStack } from '../lib/trip-settle-stack'
import { config } from '../config'

// AFTER
import { TripSettleStack } from '../lib/trip-settle-stack.js'
import { config } from '../config/index.js'
```

**Note:** Use `.js` even though source files are `.ts` (TypeScript transpilation rule)

##### 4.3: Files to Update

Checklist:
- [ ] `bin/infra.ts` - Add `.js` extensions to imports
- [ ] `lib/trip-settle-stack.ts` - Add `.js` extensions to imports
- [ ] `config/index.ts` - Check for CommonJS patterns, add extensions if it imports anything

#### Testing Plan:
1. [ ] Update each file incrementally
2. [ ] Run `npm run type-check` after each change (must pass)
3. [ ] Run `npm run synth` after each change (must work)
4. [ ] Test all CDK commands
5. [ ] Verify no runtime errors

#### Success Criteria:
- [ ] All imports use `.js` extensions
- [ ] No `require()` statements remain
- [ ] No `__dirname` usage (replaced with `import.meta.dirname`)
- [ ] Type checking passes
- [ ] CDK operations work correctly
- [ ] No runtime errors

#### Rollback Plan:
Git revert individual commits if issues arise. If multiple issues occur, revert entire Phase 4 and reassess.

---

### ⏸️ Phase 5: Lambda Function ESM Support (FUTURE)

**Start Date:** TBD (as needed)
**Duration:** 2-3 days
**Risk Level:** 🟠 MEDIUM-HIGH
**Status:** 📋 PLANNED (only if adding Lambda functions)

**Note:** This phase is only applicable if you add `NodejsFunction` constructs to the CDK stack in the future.

#### When to Use This:
- Adding Lambda functions to the infrastructure
- Using `aws-cdk-lib/aws-lambda-nodejs` NodejsFunction construct
- Want Lambda runtime to use ESM (optional but recommended)

#### Configuration Example:
```typescript
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs'

new NodejsFunction(this, 'MyFunction', {
  entry: 'lambda/handler.ts',
  runtime: Runtime.NODEJS_20_X,
  bundling: {
    format: OutputFormat.ESM,  // Enable ESM output
    mainFields: ['module', 'main'],  // Prefer ESM exports
    // Inject CommonJS compatibility shims for AWS SDK
    banner: [
      "const require = (await import('node:module')).createRequire(import.meta.url);",
      "const __filename = (await import('node:url')).fileURLToPath(import.meta.url);",
      "const __dirname = (await import('node:path')).dirname(__filename);"
    ].join('\n')
  }
})
```

#### Why the Banner?
Some AWS SDK v3 packages and dependencies may use CommonJS patterns. The banner injects compatibility shims so both ESM and CJS code work in the Lambda runtime.

#### Testing Plan:
1. [ ] Deploy Lambda with ESM config
2. [ ] Test Lambda execution in AWS
3. [ ] Check CloudWatch logs for errors
4. [ ] Verify AWS SDK imports work
5. [ ] Test all Lambda functionality

#### Success Criteria:
- [ ] Lambda deploys successfully
- [ ] Function executes without errors
- [ ] AWS SDK operations work
- [ ] No runtime import errors in CloudWatch logs

---

### ⏸️ Phase 6: CI/CD Pipeline Updates (PENDING)

**Start Date:** TBD (after Phase 4)
**Duration:** 1 day
**Risk Level:** 🟡 MEDIUM
**Status:** 📋 PLANNED

#### Changes Required:

**File: `.github/workflows/deploy.yml`**

Add type-check step before CDK operations:

```yaml
- name: Type Check Infrastructure
  run: npm run type-check --workspace=infra

- name: CDK Synth
  run: npm run synth --workspace=infra

- name: CDK Deploy
  run: npm run deploy --workspace=infra
  env:
    AWS_REGION: ${{ vars.AWS_REGION }}
```

#### Why This Matters:
- tsx doesn't do type checking during execution
- CI must catch type errors before deployment
- Prevents runtime errors from type issues

#### Testing Plan:
1. [ ] Update workflow file
2. [ ] Push to feature branch
3. [ ] Verify CI passes with type-check step
4. [ ] Check CDK synth output in CI logs
5. [ ] Verify deployment still works (if running CD)

#### Success Criteria:
- [ ] CI/CD pipeline passes
- [ ] Type checking step succeeds
- [ ] CDK synth works in CI
- [ ] CDK deployment works in CI (if applicable)

#### Rollback Plan:
Remove type-check step if it causes CI failures (investigate and fix type errors first)

---

### ⏸️ Phase 7: Documentation & Knowledge Transfer (PENDING)

**Start Date:** TBD (after all phases complete)
**Duration:** 1 day
**Risk Level:** 🟢 LOW
**Status:** 📋 PLANNED

#### Documentation Updates Needed:

**File: `CLAUDE.md`**
- [ ] Add section on ESM configuration for infra package
- [ ] Document tsx usage and benefits
- [ ] Explain type-check requirement
- [ ] Add examples of ESM import patterns
- [ ] Document `import.meta.dirname` usage

**File: `README.md`** (if applicable)
- [ ] Update infrastructure section with ESM notes
- [ ] Document any changes to developer workflow
- [ ] Add troubleshooting section for ESM issues

**File: `packages/infra/README.md`** (create if needed)
- [ ] Document ESM setup
- [ ] Explain why tsx is used
- [ ] Provide examples of correct import syntax
- [ ] List common ESM pitfalls and solutions

#### Knowledge Transfer Topics:
- How tsx differs from ts-node
- Why type-check is separate
- ESM import syntax (`.js` extensions required)
- `import.meta.dirname` vs `__dirname`
- Troubleshooting ESM errors

#### Success Criteria:
- [ ] All documentation updated
- [ ] Team trained on ESM patterns
- [ ] Troubleshooting guide available
- [ ] Developer onboarding docs reflect ESM setup

---

## Complete Timeline

| Phase | Start | Duration | Risk | Dependencies |
|-------|-------|----------|------|--------------|
| **Phase 1** | 2025-01-27 | 1 day | 🟢 Low | None |
| **Phase 2** | 2025-01-27 | 1-2 weeks | 🟢 Low | Phase 1 ✅ |
| **Phase 3A** | TBD | 1 day | 🟡 Med | Phase 2 stable |
| **Phase 3B** | TBD | 1 day | 🟡 Med | Phase 3A ✅ |
| **Phase 4** | TBD | 2-3 days | 🟠 Med-High | Phase 3B ✅ |
| **Phase 5** | As needed | 2-3 days | 🟠 Med-High | Phase 4 ✅ |
| **Phase 6** | TBD | 1 day | 🟡 Med | Phase 4 ✅ |
| **Phase 7** | TBD | 1 day | 🟢 Low | All phases ✅ |

**Total Estimated Time (excluding Phase 5):** 4-6 weeks with validation periods

---

## Decision Gates

After each phase, evaluate:

1. ✅ **Is it stable?** - No issues in testing
2. ✅ **Does it work in CI?** - Pipeline passes
3. ✅ **Are there regressions?** - Functionality intact
4. ⚠️ **Should we continue?** - GO/NO-GO decision

**If any gate fails:**
1. STOP progress to next phase
2. Troubleshoot issues
3. Document findings
4. Rollback if necessary
5. Reassess timeline

---

## Rollback Strategy

Each phase is a separate Git commit. Rollback = `git revert <commit-hash>`.

| Phase | Rollback Complexity | Recovery Time | Files Affected |
|-------|---------------------|---------------|----------------|
| Phase 1 | 🟢 Trivial | 5 min | 3 files |
| Phase 3A | 🟢 Easy | 10 min | 1 file |
| Phase 3B | 🟡 Moderate | 15 min | 1 file |
| Phase 4 | 🟠 Complex | 30-60 min | 3+ files |
| Phase 5 | 🟠 Complex | 30-60 min | Multiple |
| Phase 6 | 🟡 Moderate | 15 min | 1 file |

---

## Key Learnings & Best Practices

### ✅ What's Working Well
- **tsx performance:** 2.7x faster than ts-node
- **Seamless CJS/ESM imports:** Can use any package type
- **Separate type checking:** Catches errors without slowing execution
- **Incremental approach:** Each phase is independently valuable

### ⚠️ Known Limitations
- **tsx doesn't type-check:** Must run `tsc --noEmit` separately
- **ESM requires .js extensions:** TypeScript import paths must end in `.js`
- **Breaking changes in Phase 4:** Code changes required for full ESM

### 💡 Recommendations
1. **Don't rush Phase 2:** Let Phase 1 prove stable before proceeding
2. **Test incrementally:** Each file change in Phase 4 should be tested
3. **Keep commits atomic:** One phase = one commit for easy rollback
4. **Document issues:** Track any problems encountered during migration

---

## Resources & References

### Official Documentation
- [AWS CDK TypeScript Guide](https://docs.aws.amazon.com/cdk/v2/guide/work-with-cdk-typescript.html)
- [TypeScript ESM Support](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)

### Community Resources
- [AWS CDK with ESM Guide](https://aripalo.technology/blog/2024/08/26/aws-cdk-with-esm/) - Comprehensive 2024 guide
- [tsx Documentation](https://github.com/privatenumber/tsx) - Official tsx repo
- [AWS CDK ESM Issue #23333](https://github.com/aws/aws-cdk/issues/23333) - Community discussion

### Internal Documentation
- `CLAUDE.md` - Project guidelines (will be updated in Phase 7)
- `.claude/skills/git-commit-rules/commit-rules.yaml` - Commit conventions
- `.github/workflows/deploy.yml` - CI/CD pipeline (will be updated in Phase 6)

---

## Migration Status Summary

**Current Phase:** Phase 2 (Validation & Monitoring)
**Next Action:** Monitor tsx stability for 1-2 weeks
**Blocker:** None
**Overall Progress:** 15% complete (1/7 phases)

**Phase Status:**
- ✅ Phase 1: Complete (2025-01-27)
- 🔄 Phase 2: In Progress
- ⏸️ Phase 3A: Pending approval
- ⏸️ Phase 3B: Pending Phase 3A
- ⏸️ Phase 4: Pending Phase 3B
- ⏸️ Phase 5: Pending Phase 4 (optional)
- ⏸️ Phase 6: Pending Phase 4
- ⏸️ Phase 7: Pending all phases

---

## Questions & Answers

**Q: Why not do full ESM migration in one go?**
A: High risk of breaking changes. Incremental approach allows testing and validation at each step, with easy rollback if issues occur.

**Q: Can we skip Phase 2 (monitoring)?**
A: Not recommended. Phase 1 introduces tsx, which needs real-world testing before committing to further changes.

**Q: What if Phase 3A/3B breaks type checking?**
A: Roll back the specific phase, investigate issues, and consider staying on Phase 1 (tsx with CommonJS) long-term if needed.

**Q: Is Phase 5 (Lambda ESM) required?**
A: No, only if you add Lambda functions later. Current infra has no Lambdas.

**Q: What if we never complete Phase 4?**
A: That's acceptable! Phase 1 alone provides significant value (speed, ESM package support). Full ESM is optional.

**Q: How do we know when to proceed to the next phase?**
A: Each phase has clear Success Criteria and Decision Gates. All must pass before proceeding.

---

**Document Version:** 1.0
**Last Reviewed:** 2025-01-27
**Next Review:** After Phase 2 completion (estimated 2025-02-10)
