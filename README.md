<div align="center">
  <img src="./logo.png" alt="Plain" width="100px">
</div>

<!-- omit in toc -->
# @team-plain/cli

CLI for interacting with the [Plain](https://www.plain.com) API.

Specifically for indexing content as
[Knowledge Sources](https://www.plain.com/docs/product/agents/knowledge-sources) in your Plain
workspaces, to be used by [Plain Agents](https://www.plain.com/docs/product/agents).

- [Installation](#installation)
- [Authentication](#authentication)
- [Commands](#commands)
  - [Knowledge Sources](#knowledge-sources)
  - [`index-url`](#index-url)
  - [`index-sitemap`](#index-sitemap)
- [Running in CI](#running-in-ci)


## Installation

Requires Node.js 22.12 or later.

```bash
npm install -g @team-plain/cli
plain --help
```

## Authentication

To authenticate with your Plain workspace, the CLI uses a
[Plain API Key](https://www.plain.com/docs/api-reference/graphql/authentication), read from the
`PLAIN_API_KEY` environment variable.

```bash
export PLAIN_API_KEY=plainApiKey_xxx
```

## Commands

### Knowledge Sources

Commands for indexing content as
[Knowledge Sources](https://www.plain.com/docs/product/agents/knowledge-sources) in your Plain
workspace, so that [Plain Agents](https://www.plain.com/docs/product/agents), such as
[Ari](https://www.plain.com/docs/product/agents/ari), can use it to answer customer questions and as
context.

Each command fetches and indexes the content of the provided URL or sitemap. Running a command again
for a URL or sitemap that's already a knowledge source reindexes it.

### `index-url`

Index a single page by URL.

Required permissions: `knowledgeSource:create`

```bash
PLAIN_API_KEY=plainApiKey_xxx plain index-url <url>
```

Options:

- `-l, --labelTypeIds <labelTypeIds...>`: Array of label type IDs to associate with the indexed url

### `index-sitemap`

Index all the urls in a given sitemap you provide.

Required permissions: `knowledgeSource:create`

```bash
PLAIN_API_KEY=plainApiKey_xxx plain index-sitemap <sitemap url>
```

Options:

- `-l, --labelTypeIds <labelTypeIds...>`: Array of label type IDs to associate with the indexed urls
  from the sitemap

## Running in CI

Use the CLI in your CI pipeline to index your content as Knowledge Sources, for example when you
publish new documentation to a Mintlify site.

```yaml
- uses: actions/setup-node@v7
  with:
    node-version: 24

- name: Index docs
  run: npx --yes @team-plain/cli@1 index-sitemap https://docs.example.com/sitemap.xml
  env:
    PLAIN_API_KEY: ${{ secrets.PLAIN_API_KEY }}
```
