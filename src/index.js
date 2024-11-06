#!/usr/bin/env node

const { program } = require("commander");
const packageJson = require("../package.json");
const { PlainClient } = require("@team-plain/typescript-sdk");
const Sitemapper = require("sitemapper");

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

	if (res.isErr) {
		handleError(res.error.message, res.error.requestId);
	}

	console.log(`✅ Successfully indexed ${url}`);
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
		const sitemap = new Sitemapper();
		const labelTypeIds = options.labelTypeIds;
		const urls = [];

		try {
			const res = await sitemap.fetch(url);
			urls.push(...res.sites);
		} catch (e) {
			console.err(`Failed to fetch sitemap: ${e.message}`);
		}

		for (const url of urls) {
			await indexUrl(url, labelTypeIds);
		}

		console.log(`Successfully indexed ${urls.length} urls`);
	});

program.parse(process.argv);
