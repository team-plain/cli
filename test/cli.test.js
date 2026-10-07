import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { after, before, beforeEach, describe, test } from "node:test";

const CLI = new URL("../src/index.js", import.meta.url).pathname;

let server;
let apiUrl;
let requests;
let respond;

before(async () => {
	server = createServer((req, res) => {
		let body = "";
		req.on("data", (chunk) => {
			body += chunk;
		});
		req.on("end", () => {
			requests.push({
				authorization: req.headers.authorization,
				body: JSON.parse(body),
			});
			const { status, json } = respond();
			res.writeHead(status, { "content-type": "application/json" });
			res.end(JSON.stringify(json));
		});
	});
	await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
	apiUrl = `http://127.0.0.1:${server.address().port}/graphql`;
});

after(() => server.close());

beforeEach(() => {
	requests = [];
	respond = () =>
		mutationResponse({ knowledgeSource: { id: "ks_1" }, error: null });
});

function mutationResponse(createKnowledgeSource) {
	return { status: 200, json: { data: { createKnowledgeSource } } };
}

function run(args, env = { PLAIN_API_KEY: "plainApiKey_test" }) {
	return new Promise((resolve) => {
		const child = spawn(process.execPath, [CLI, ...args], {
			env: { PATH: process.env.PATH, PLAIN_API_URL: apiUrl, ...env },
		});
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", (chunk) => {
			stdout += chunk;
		});
		child.stderr.on("data", (chunk) => {
			stderr += chunk;
		});
		child.on("close", (code) => resolve({ code, stdout, stderr }));
	});
}

describe("index-url", () => {
	test("creates a URL knowledge source with label types", async () => {
		const { code, stdout } = await run([
			"index-url",
			"https://example.com/page",
			"-l",
			"lt_1",
			"lt_2",
		]);

		assert.equal(code, 0);
		assert.match(
			stdout,
			/Successfully indexed URL https:\/\/example\.com\/page/,
		);
		assert.equal(requests.length, 1);
		assert.equal(requests[0].authorization, "Bearer plainApiKey_test");
		assert.deepEqual(requests[0].body.variables, {
			input: {
				url: "https://example.com/page",
				type: "URL",
				labelTypeIds: ["lt_1", "lt_2"],
			},
		});
	});

	test("prints the mutation error and its code", async () => {
		respond = () =>
			mutationResponse({
				knowledgeSource: null,
				error: {
					message: "Plain AI must be enabled",
					type: "FORBIDDEN",
					code: "plain_ai_must_be_enabled",
					fields: [],
				},
			});

		const { code, stderr } = await run([
			"index-url",
			"https://example.com/page",
		]);

		assert.equal(code, 1);
		assert.match(
			stderr,
			/Failed to index https:\/\/example\.com\/page: Plain AI must be enabled \(plain_ai_must_be_enabled\)/,
		);
	});

	test("prints a rejected API key as one line", async () => {
		respond = () => ({
			status: 401,
			json: { errors: [{ message: "Invalid API key" }] },
		});

		const { code, stderr } = await run([
			"index-url",
			"https://example.com/page",
		]);

		assert.equal(code, 1);
		assert.match(
			stderr,
			/Failed to index https:\/\/example\.com\/page: Authentication error/,
		);
		assert.doesNotMatch(stderr, /\n\s+at /);
	});

	test("fails without an API key and makes no request", async () => {
		const { code, stderr } = await run(
			["index-url", "https://example.com/page"],
			{},
		);

		assert.equal(code, 1);
		assert.match(stderr, /PLAIN_API_KEY environment variable is not set/);
		assert.equal(requests.length, 0);
	});

	test("documents the permission the API checks", async () => {
		const { code, stdout } = await run(["index-url", "--help"]);

		assert.equal(code, 0);
		assert.match(stdout, /knowledgeSource:create/);
	});
});

describe("index-sitemap", () => {
	test("creates a sitemap knowledge source with no label types", async () => {
		const { code, stdout } = await run([
			"index-sitemap",
			"https://example.com/sitemap.xml",
		]);

		assert.equal(code, 0);
		assert.match(
			stdout,
			/Successfully indexed sitemap https:\/\/example\.com\/sitemap\.xml/,
		);
		assert.deepEqual(requests[0].body.variables, {
			input: {
				url: "https://example.com/sitemap.xml",
				type: "SITEMAP",
				labelTypeIds: [],
			},
		});
	});
});
