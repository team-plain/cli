#!/usr/bin/env node

import { parseArgs } from "node:util";
import { type KnowledgeSourceType, PlainClient } from "@team-plain/graphql";
import packageJson from "../package.json" with { type: "json" };

const DOCS_URL = "https://www.plain.com/docs/product/agents/knowledge-sources";
const PERMISSIONS_HELP =
	"To use this you need to set an environment variable called PLAIN_API_KEY with the following permissions: \n- knowledgeSource:create";

type Command = {
	type: KnowledgeSourceType;
	noun: string;
	argument: string;
	description: string;
};

const COMMANDS: Record<string, Command> = {
	"index-url": {
		type: "URL",
		noun: "URL",
		argument: "<url>",
		description: "This will index a specific url you provide.",
	},
	"index-sitemap": {
		type: "SITEMAP",
		noun: "sitemap",
		argument: "<sitemap url>",
		description: "This will index all the urls in a given sitemap you provide.",
	},
};

const HELP = `Usage: plain <command> [options]

Plain CLI

Commands:
  index-url <url>              Index a single page by URL
  index-sitemap <sitemap url>  Index all the urls in a sitemap

Options:
  -V, --version  Output the version number
  -h, --help     Display help`;

function commandHelp(name: string, { argument, description }: Command): string {
	return `Usage: plain ${name} ${argument} [options]

${description}

${PERMISSIONS_HELP}

Options:
  -l, --labelTypeIds <labelTypeIds...>  Array of label type IDs
  -h, --help                            Display help`;
}

function usageError(message: string): never {
	console.error(`error: ${message}\nRun 'plain --help' for usage.`);
	process.exit(1);
}

function getClient(): PlainClient {
	const apiKey = process.env.PLAIN_API_KEY;
	const apiUrl = process.env.PLAIN_API_URL;

	if (!apiKey) {
		console.error("Error: PLAIN_API_KEY environment variable is not set.");
		process.exit(1);
	}

	if (apiUrl) {
		console.info("Using PLAIN_API_URL provided from environment: ", apiUrl);
	}

	return new PlainClient({
		apiKey,
		apiUrl,
	});
}

function fail(url: string, message: string): never {
	console.error(`Failed to index ${url}: ${message}`);
	process.exit(1);
}

async function createKnowledgeSource(
	url: string,
	type: KnowledgeSourceType,
	labelTypeIds: string[],
): Promise<void> {
	try {
		const { error } = await getClient().mutation.createKnowledgeSource({
			input: { url, type, labelTypeIds },
		});
		if (error) {
			fail(url, `${error.message} (${error.code})`);
		}
	} catch (err) {
		fail(url, err instanceof Error ? err.message : String(err));
	}
}

function parse(args: string[]) {
	try {
		return parseArgs({
			args,
			options: {
				labelTypeIds: { type: "string", short: "l", multiple: true },
				help: { type: "boolean", short: "h" },
			},
			allowPositionals: true,
			tokens: true,
		}).tokens;
	} catch (err) {
		return usageError(err instanceof Error ? err.message : String(err));
	}
}

async function index(name: string, command: Command, args: string[]) {
	// `-l a b` keeps collecting label type IDs until the next flag, as it did
	// when this CLI used commander.
	const labelTypeIds: string[] = [];
	const positionals: string[] = [];
	let collecting = false;
	for (const token of parse(args)) {
		if (token.kind === "option" && token.name === "help") {
			console.log(commandHelp(name, command));
			return;
		}
		if (token.kind === "option") {
			labelTypeIds.push(token.value ?? "");
			collecting = true;
		} else if (token.kind === "positional") {
			(collecting ? labelTypeIds : positionals).push(token.value);
		} else {
			collecting = false;
		}
	}

	const { type, noun, argument } = command;
	if (positionals.length !== 1) {
		usageError(
			`'${name}' expects one ${argument} argument, got ${positionals.length}`,
		);
	}

	const [url] = positionals;
	await createKnowledgeSource(url, type, labelTypeIds);
	console.log(
		`✅ Successfully indexed ${noun} ${url} - The ${noun} will be indexed and knowledge sources will be available in Plain. See ${DOCS_URL} for more information.`,
	);
}

const [name, ...args] = process.argv.slice(2);

if (!name || name === "-h" || name === "--help") {
	console.log(HELP);
} else if (name === "-V" || name === "--version") {
	console.log(packageJson.version);
} else if (Object.hasOwn(COMMANDS, name)) {
	await index(name, COMMANDS[name], args);
} else {
	usageError(`unknown command '${name}'`);
}
