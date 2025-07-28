#!/usr/bin/env node

const { program } = require("commander");
const packageJson = require("../package.json");
const { PlainClient } = require("@team-plain/typescript-sdk");

function getClient() {
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

function handleError(message, requestId = "–") {
	console.error(`Failed to index document: ${message} (${requestId})`);
	process.exit(1);
}

async function indexUrl(url, labelTypeIds = []) {
	const client = getClient();
	const res = await client.indexDocument({
		url,
		labelTypeIds,
	});
	if (res.error) {
		handleError(res.error.message, res.error.requestId);
	} else {
		console.log(`✅ Successfully indexed ${url}`);
	}
}

program.name("plain").version(packageJson.version).description("Plain CLI");

program
	.command("index-url")
	.description(
		"This will index a specific url you provide.\n\nTo use this you need to set an environment variable called PLAIN_API_KEY with the following permissions: \n- indexedDocument:create",
	)
	.argument("<url>")
	.option("-l, --labelTypeIds <labelTypeIds...>", "Array of label type IDs")
	.action(async (url, options) => {
		await indexUrl(url, options.labelTypeIds);
	});

program
	.command("index-sitemap")
	.description(
		"This will index all the urls in a given sitemap you provide.\n\nTo use this you need to set an environment variable called PLAIN_API_KEY with the following permissions: \n- indexedDocument:create",
	)
	.argument("<sitemap url>")
	.option("-l, --labelTypeIds <labelTypeIds...>", "Array of label type IDs")
	.action(async (url, options) => {
		const client = getClient();
		const res = await client.createKnowledgeSource({
			url,
			labelTypeIds: options.labelTypeIds || [],
			type: "SITEMAP",
		});
		if (res.error) {
			handleError(res.error.message, res.error.requestId);
		} else {
			console.log(
				`✅ Successfully indexed sitemap ${url} - The sitemap will be indexed and knowledge sources will be available in Plain. See https://plain.support.site/article/plain-ai-knowledge-sources for more information.`,
			);
		}
	});

program.parse(process.argv);
