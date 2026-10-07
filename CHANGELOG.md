# @team-plain/cli

## 1.0.0

### Major Changes

- 1f7051a: Move to `@team-plain/graphql`, the replacement for the deprecated `@team-plain/typescript-sdk`.
  
  - Requires Node.js 22.12 or later. Node.js 18 and 20 are end of life. To stay on them, pin `@team-plain/cli@0`.
  - The API key needs the `knowledgeSource:create` permission. The README and `--help` previously said `indexedDocument:create`, which was wrong.
  - Errors now print as a single line with the error code, without a request ID or stack trace.

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
