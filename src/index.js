#!/usr/bin/env node

const { program } = require("commander");
const packageJson = require("../package.json");
const { PlainClient } = require("@team-plain/typescript-sdk");
const Sitemapper = require("sitemapper");

function getClient() {
	const envVarName = "PLAIN_API_KEY";
	const apiKey = process.env[envVarName];

	if (!apiKey) {
		console.error("Error: PLAIN_API_KEY environment variable is not set.");
		process.exit(1);
	}

	const client = new PlainClient({
		apiKey,
	});

	return client;
}

function handleError(message, requestId = "–") {
	console.error(`Failed to index document: ${message} (${requestId})`);
	process.exit(1);
}

async function indexUrl(url) {
	const client = getClient();

	const res = await client.indexDocument({
		url,
	});

	if (res.isErr) {
		handleError(res.error.message, res.error.requestId);
	}

	console.log(`✅ Succesfully indexed ${url}`);
}

program.name("plain").version(packageJson.version).description("Plain CLI");

program
	.command("index-url")
	.description(
		"This will index a specific url you provide.\n\nTo use this you need to set an environment variable called PLAIN_API_KEY with the following permissions: \n- indexedDocument:create",
	)
	.argument("<url>")
	.action(async (url) => {
		indexUrl(url);
	});

program
	.command("index-sitemap")
	.description(
		"This will index all the urls in a given sitemap you provide.\n\nTo use this you need to set an environment variable called PLAIN_API_KEY with the following permissions: \n- indexedDocument:create",
	)
	.argument("<sitemap url>")
	.action(async (url) => {
		const sitemap = new Sitemapper();

		const urls = [];

		try {
			const res = await sitemap.fetch(url);
			urls.push(...res.sites);
		} catch (e) {
			console.err(`Failed to fetch sitemap: ${e.message}`);
		}

		for (const url of urls) {
			await indexUrl(url);
		}

		console.log(`Succesfully indexed ${urls.length} urls`);
	});

program.parse(process.argv);
