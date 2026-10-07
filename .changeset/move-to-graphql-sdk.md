---
"@team-plain/cli": major
---

Move to `@team-plain/graphql`, the replacement for the deprecated `@team-plain/typescript-sdk`.

- Requires Node.js 22.12 or later. Node.js 18 and 20 are end of life. To stay on them, pin `@team-plain/cli@0`.
- The API key needs the `knowledgeSource:create` permission. The README and `--help` previously said `indexedDocument:create`, which was wrong.
- Errors now print as a single line with the error code, without a request ID or stack trace.
