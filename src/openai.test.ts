import { describe, it, mock, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import OpenAI from "openai";

import { OpenAITextInference } from "./openai.js";

function makeClient(content: string): OpenAI {
  return {
    chat: {
      completions: {
        create: mock.fn(async () => ({
          choices: [{ message: { content } }],
        })),
      },
    },
  } as unknown as OpenAI;
}

let dir: string;

before(() => {
  dir = mkdtempSync(join(tmpdir(), "ck-openai-test-"));
});

after(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("OpenAITextInference", () => {
  it("returns the content from the first choice", async () => {
    const client = makeClient('{"result":"ok"}');
    const inference = new OpenAITextInference("gpt-4o", { client });

    const result = await inference.infer("some prompt");

    assert.strictEqual(result, '{"result":"ok"}');
  });

  it("sends user message with the prompt text", async () => {
    const client = makeClient("response");
    const inference = new OpenAITextInference("gpt-4o", { client });

    await inference.infer("my prompt");

    const createFn = client.chat.completions.create as ReturnType<
      typeof mock.fn
    >;
    const [args] = createFn.mock.calls[0].arguments as [
      OpenAI.ChatCompletionCreateParamsNonStreaming,
    ];
    const userMsg = args.messages.find((m) => m.role === "user");
    assert.strictEqual(userMsg?.content, "my prompt");
  });

  it("prepends a system message when systemPrompt is provided", async () => {
    const client = makeClient("response");
    const inference = new OpenAITextInference("gpt-4o", { client });

    await inference.infer("prompt", {
      systemPrompt: "You are a helpful assistant.",
    });

    const createFn = client.chat.completions.create as ReturnType<
      typeof mock.fn
    >;
    const [args] = createFn.mock.calls[0].arguments as [
      OpenAI.ChatCompletionCreateParamsNonStreaming,
    ];
    assert.strictEqual(args.messages[0]?.role, "system");
    assert.strictEqual(
      args.messages[0]?.content,
      "You are a helpful assistant.",
    );
  });

  it("omits the system message when systemPrompt is absent", async () => {
    const client = makeClient("response");
    const inference = new OpenAITextInference("gpt-4o", { client });

    await inference.infer("prompt");

    const createFn = client.chat.completions.create as ReturnType<
      typeof mock.fn
    >;
    const [args] = createFn.mock.calls[0].arguments as [
      OpenAI.ChatCompletionCreateParamsNonStreaming,
    ];
    const systemMsg = args.messages.find((m) => m.role === "system");
    assert.strictEqual(systemMsg, undefined);
  });

  it("uses the provided modelId", async () => {
    const client = makeClient("response");
    const inference = new OpenAITextInference("llama-3.3-70b-versatile", {
      client,
    });

    await inference.infer("prompt");

    const createFn = client.chat.completions.create as ReturnType<
      typeof mock.fn
    >;
    const [args] = createFn.mock.calls[0].arguments as [
      OpenAI.ChatCompletionCreateParamsNonStreaming,
    ];
    assert.strictEqual(args.model, "llama-3.3-70b-versatile");
  });

  it("uses the provided maxTokens option", async () => {
    const client = makeClient("response");
    const inference = new OpenAITextInference("gpt-4o", {
      client,
      maxTokens: 512,
    });

    await inference.infer("prompt");

    const createFn = client.chat.completions.create as ReturnType<
      typeof mock.fn
    >;
    const [args] = createFn.mock.calls[0].arguments as [
      OpenAI.ChatCompletionCreateParamsNonStreaming,
    ];
    assert.strictEqual(args.max_tokens, 512);
  });

  it("returns an empty string when the response has no content", async () => {
    const client = {
      chat: {
        completions: {
          create: mock.fn(async () => ({
            choices: [{ message: { content: null } }],
          })),
        },
      },
    } as unknown as OpenAI;
    const inference = new OpenAITextInference("gpt-4o", { client });

    const result = await inference.infer("prompt");

    assert.strictEqual(result, "");
  });
});

describe("OpenAITextInference config resolution", () => {
  it("resolves modelId from explicit arg", () => {
    assert.doesNotThrow(
      () => new OpenAITextInference("gpt-4o", { client: makeClient("ok") }),
    );
  });

  it("resolves modelId from config file", () => {
    const cfg = join(dir, "openai.yml");
    writeFileSync(cfg, "modelId: gpt-4o\n");
    assert.doesNotThrow(
      () =>
        new OpenAITextInference(undefined, {
          configFile: cfg,
          client: makeClient("ok"),
        }),
    );
  });

  it("throws when modelId is absent and config file has no model", () => {
    const cfg = join(dir, "no-model.yml");
    writeFileSync(cfg, "apiKey: sk-test\n");
    assert.throws(
      () =>
        new OpenAITextInference(undefined, {
          configFile: cfg,
          client: makeClient("ok"),
        }),
      /modelId is required/,
    );
  });

  it("throws when explicit configFile is not found", () => {
    assert.throws(
      () =>
        new OpenAITextInference(undefined, {
          configFile: join(dir, "ghost.yml"),
        }),
      /Config file not found/,
    );
  });

  it("env var OPENAI_API_KEY takes priority over config file", () => {
    const cfg = join(dir, "envvar.yml");
    writeFileSync(cfg, "modelId: gpt-4o\napiKey: from-file\n");
    const prev = process.env["OPENAI_API_KEY"];
    process.env["OPENAI_API_KEY"] = "from-env";
    try {
      assert.doesNotThrow(
        () =>
          new OpenAITextInference(undefined, {
            configFile: cfg,
            client: makeClient("ok"),
          }),
      );
    } finally {
      if (prev === undefined) delete process.env["OPENAI_API_KEY"];
      else process.env["OPENAI_API_KEY"] = prev;
    }
  });
});
