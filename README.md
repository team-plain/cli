# @team-plain/cli

This CLI is used to interact with the Plain.com API.

If you run into any issues please open an issue or get in touch with us at [help@plain.com](mailto:help@plain.com).

## Installation

```
npm install -g @team-plain/cli
```

This installs the package globally and makes the `plain` command available in your path.

The cli has a help command that can be used to get more information about the available commands:
```
plain --help
```

## Authentication

To authenticate with your Plain workspace, the CLI uses a [Plain API Key](https://www.plain.com/docs/api-reference/graphql/authentication). The key is read from the environment varialble `PLAIN_API_KEY`

See below for permissions required for each command.
```
export PLAIN_API_KEY=plainApiKey_xxx
```

## Commands

### Index Documents

These commands are used for indexing documents for use with Smart AI Responses. The contents of provided urls are scraped and indexed using Open AI.

### `index-url`

Index a single document by URL.

Required permissions: `indexedDocument:create`

```
plain index-url <url>
```

Options:
- `-l, --labelTypeIds <labelTypeIds...>`: Array of label type IDs to associate with the indexed url

### `index-sitemap`

Index all the urls in a given sitemap you provide.

Required permissions: `indexedDocument:create`

```
plain index-sitemap <sitemap url>`
```

Options:

- `-l, --labelTypeIds <labelTypeIds...>`: Array of label type IDs to associate with the indexed url from the sitemap.