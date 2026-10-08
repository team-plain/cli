import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, beforeEach, describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import packageJson from "../package.json" with { type: "json" };

const CLI = fileURLToPath(new URL("../dist/index.mjs", import.meta.url));

type Response = { status: number; json: unknown };
type Request = { authorization?: string; body: { variables: unknown } };

let server: Server;
let apiUrl: string;
let requests: Request[];
let respond: () => Response;

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
	await new Promise<void>((resolve) =>
		server.listen(0, "127.0.0.1", () => resolve()),
	);
	apiUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/graphql`;
});

after(() => server.close());

beforeEach(() => {
	requests = [];
	respond = () =>
		mutationResponse({ knowledgeSource: { id: "ks_1" }, error: null });
});

function mutationResponse(createKnowledgeSource: unknown): Response {
	return { status: 200, json: { data: { createKnowledgeSource } } };
}

function run(
	args: string[],
	env: Record<string, string> = { PLAIN_API_KEY: "plainApiKey_test" },
): Promise<{ code: number | null; stdout: string; stderr: string }> {
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

describe("argument parsing", () => {
	test("accepts repeated label type flags", async () => {
		const { code } = await run([
			"index-url",
			"-l",
			"lt_1",
			"--labelTypeIds=lt_2",
			"--",
			"https://example.com/page",
		]);

		assert.equal(code, 0);
		assert.deepEqual(requests[0].body.variables, {
			input: {
				url: "https://example.com/page",
				type: "URL",
				labelTypeIds: ["lt_1", "lt_2"],
			},
		});
	});

	test("rejects a wrong number of arguments", async () => {
		const { code, stderr } = await run(["index-url"]);

		assert.equal(code, 1);
		assert.match(stderr, /'index-url' expects one <url> argument, got 0/);
		assert.equal(requests.length, 0);
	});

	test("rejects unknown options", async () => {
		const { code, stderr } = await run(["index-url", "--nope", "a"]);

		assert.equal(code, 1);
		assert.match(stderr, /Unknown option '--nope'/);
	});

	test("rejects unknown commands", async () => {
		const { code, stderr } = await run(["nope"]);

		assert.equal(code, 1);
		assert.match(stderr, /unknown command 'nope'/);
	});
});

describe("help", () => {
	test("lists every command", async () => {
		const { code, stdout } = await run(["--help"]);

		assert.equal(code, 0);
		assert.match(stdout, /index-url/);
		assert.match(stdout, /index-sitemap/);
	});

	test("prints the version", async () => {
		const { code, stdout } = await run(["--version"]);

		assert.equal(code, 0);
		assert.equal(stdout.trim(), packageJson.version);
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
