# @team-plain/cli

This CLI is used to interact with the Plain.com API.

If you run into any issues please open an issue or get in touch with us at [help@plain.com](mailto:help@plain.com).

## Installation

Requires Node.js 22.12 or later.

```
npm install -g @team-plain/cli
```

This installs the package globally and makes the `plain` command available in your path.

The cli has a help command that can be used to get more information about the available commands:

```
plain --help
```

## Authentication

To authenticate with your Plain workspace, the CLI uses a [Plain API Key](https://www.plain.com/docs/api-reference/graphql/authentication). The key is read from the environment variable `PLAIN_API_KEY`.

See below for permissions required for each command.

```
export PLAIN_API_KEY=plainApiKey_xxx
```

## Commands

### Knowledge Sources

These commands add pages to Plain as [knowledge sources](https://www.plain.com/docs/product/agents/knowledge-sources), which Ari uses to answer customers. Plain fetches and indexes the content of each URL. Running a command again for a URL that's already a knowledge source reindexes it.

### `index-url`

Index a single page by URL.

Required permissions: `knowledgeSource:create`

```
plain index-url <url>
```

Options:

- `-l, --labelTypeIds <labelTypeIds...>`: Array of label type IDs to associate with the indexed url

### `index-sitemap`

Index all the urls in a given sitemap you provide.

Required permissions: `knowledgeSource:create`

```
plain index-sitemap <sitemap url>
```

Options:

- `-l, --labelTypeIds <labelTypeIds...>`: Array of label type IDs to associate with the indexed urls from the sitemap

## Running in CI

Pin the major version so a future breaking release can't change your workflow unannounced. For example, to reindex your docs from GitHub Actions:

```yaml
- uses: actions/setup-node@v7
  with:
    node-version: 24

- name: Index docs
  run: npx --yes @team-plain/cli@1 index-sitemap https://docs.example.com/sitemap.xml
  env:
    PLAIN_API_KEY: ${{ secrets.PLAIN_API_KEY }}
```
