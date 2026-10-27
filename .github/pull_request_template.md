## Summary

<!-- What changes and why. -->

## Story

<!-- Link the story file, e.g. _bmad-output/implementation-artifacts/1-2-….md -->

## New dependencies

<!-- One line of justification per new dependency, or "None". -->

## Agent Review Checklist

- [ ] I searched for an existing primitive, pattern or helper before creating one.
- [ ] No duplicated logic. Second occurrences are extracted where the concept is the same.
- [ ] Names use the GDD glossary, carry units, and need no comment.
- [ ] Every comment states a _why_ that the code cannot.
- [ ] Core code is pure: no clocks, no `Math.random`, no I/O.
- [ ] New content kinds or predicates have schema, implementation and test.
- [ ] Tests describe behaviour and use the shared builders.
- [ ] Lint, jscpd, knip, Stylelint, size-limit and tests pass.
