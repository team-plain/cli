#!/usr/bin/env node

import { type KnowledgeSourceType, PlainClient } from "@team-plain/graphql";
import { program } from "commander";
import packageJson from "../package.json" with { type: "json" };

const DOCS_URL = "https://www.plain.com/docs/product/agents/knowledge-sources";
const PERMISSIONS_HELP =
	"To use this you need to set an environment variable called PLAIN_API_KEY with the following permissions: \n- knowledgeSource:create";

type IndexOptions = { labelTypeIds?: string[] };

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
	labelTypeIds: string[] = [],
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

program.name("plain").version(packageJson.version).description("Plain CLI");

program
	.command("index-url")
	.description(
		`This will index a specific url you provide.\n\n${PERMISSIONS_HELP}`,
	)
	.argument("<url>")
	.option("-l, --labelTypeIds <labelTypeIds...>", "Array of label type IDs")
	.action(async (url: string, options: IndexOptions) => {
		await createKnowledgeSource(url, "URL", options.labelTypeIds);
		console.log(
			`✅ Successfully indexed URL ${url} - The URL will be indexed and knowledge sources will be available in Plain. See ${DOCS_URL} for more information.`,
		);
	});

program
	.command("index-sitemap")
	.description(
		`This will index all the urls in a given sitemap you provide.\n\n${PERMISSIONS_HELP}`,
	)
	.argument("<sitemap url>")
	.option("-l, --labelTypeIds <labelTypeIds...>", "Array of label type IDs")
	.action(async (url: string, options: IndexOptions) => {
		await createKnowledgeSource(url, "SITEMAP", options.labelTypeIds);
		console.log(
			`✅ Successfully indexed sitemap ${url} - The sitemap will be indexed and knowledge sources will be available in Plain. See ${DOCS_URL} for more information.`,
		);
	});

program.parse(process.argv);
