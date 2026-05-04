# AI-Assisted Workflow

## Tools used

- Windsurf Cascade coding agent
- IDE-integrated code search, file reading, and patch tools
- Vitest test runner for frontend and backend verification

## How AI was used

AI was used as a pair-programming assistant to speed up implementation and validation while keeping decisions explicit and reviewable.

Main usage patterns:

1. Explore existing code structure and identify integration points.
2. Propose focused implementation steps for backend, frontend, and tests.
3. Generate and apply targeted patches for requested changes.
4. Iterate on failing/flaky tests and stabilize timer-based assertions.
5. Prepare documentation updates for run/test instructions and trade-offs.

## Prompt style

Typical prompts were short and task-oriented, for example:

- "Implement backend loaders and booking domain logic."
- "Add frontend tests and cover all components/scenarios."
- "Fix flaky countdown auto-close test."
- "Add backend tests for domain and API routes."
- "Update README and finalize deliverables."

## Approximate workflow size

- Multiple iterative sessions
- Dozens of focused edit/test cycles
- Continuous validation with `npm run test:web` and `npm run test:server`

## Human decisions

Final choices (architecture, UX behavior, trade-offs, and scope boundaries) were made by the developer, with AI suggestions reviewed and adjusted before acceptance.
