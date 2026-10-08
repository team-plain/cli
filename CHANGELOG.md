# @team-plain/cli

## 1.0.2

### Patch Changes

- 1b74762: Replace commander with Node's built-in argument parsing.

## 1.0.1

### Patch Changes

- 53ad08c: Ship a bundled ESM build of the CLI, now written in TypeScript, in place of the raw source, and publish it under the MIT licence.

## 1.0.0

### Major Changes

- 1f7051a: Move to `@team-plain/graphql`, the replacement for the deprecated `@team-plain/typescript-sdk`.
  
  - Requires Node.js 22.12 or later. Node.js 18 and 20 are end of life. To stay on them, pin `@team-plain/cli@0`.
  - The API key needs the `knowledgeSource:create` permission. The README and `--help` previously said `indexedDocument:create`, which was wrong.
  - Errors print as a single line, with the API error code where there is one, in place of the request ID.
  - Passing more arguments than a command takes is now an error. `plain index-url a b` previously indexed `a` and ignored `b`.

## 0.4.0

### Minor Changes

- 2d75379: Use knowledge source for index URL

## 0.3.2

### Patch Changes

- daf2b86: Add labelTypes default to index-sitemap

## 0.3.1

### Patch Changes

- 7413182: Fix uneeded import

## 0.3.0

### Minor Changes

- 69d1072: Update sitemap function to create a knowledge source

### Patch Changes

- 09b3f99: Update index-sitemap logging

## 0.2.2

### Patch Changes

- ebe38b7: Fix error handling

## 0.2.1

### Patch Changes

- 0be71aa: Fix non awaited promise

## 0.2.0

### Minor Changes

- 81c28ff: Fixed error handling

## 0.1.2

### Patch Changes

- 3de5608: Test release process

## 0.1.1

### Patch Changes

- e65c4fd: Fix error handling for index-sitemap

## 0.1.0

### Minor Changes

- 0250e9d: - Add support for labelTypeIds to index-url and index-sitemap

## 0.0.4

### Patch Changes

- 17d8d20: fix location of main bin

## 0.0.3

### Patch Changes

- 221caf8: Fix permissions
