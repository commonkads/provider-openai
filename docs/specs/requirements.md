# Requirements — @commonkads/provider-openai

## Overview

OpenAI-compatible provider implementation for the [CommonKADS engine](https://github.com/commonkads/engine). Provides `IInferenceProvider` backed by any OpenAI-compatible chat completions API — OpenAI, Groq, Mistral, Together AI, and others via `baseURL`.

## REQ-1 — OpenAITextInference

Implements `IInferenceProvider`. Constructor accepts `modelId: string` and `OpenAITextInferenceOptions`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | — | API key; falls back to `OPENAI_API_KEY` env var |
| `baseURL` | `string` | — | Override endpoint URL for OpenAI-compatible APIs (Groq, Mistral, etc.) |
| `maxTokens` | `number` | `8192` | Maximum tokens in the response |
| `client` | `OpenAI` | — | Injectable for testing |

`infer()` calls `chat.completions.create` and returns the first choice's message content. When `options.systemPrompt` is provided, it is prepended as a `system` role message.

## REQ-2 — Registry Integration

`registerOpenAIProviders()` registers a builder for type `"openai"`. The `register` named export is an alias. `OpenAIProviderOptions` (`{ type: "openai"; model; apiKey?; baseURL?; maxTokens? }`) is the config shape.

## REQ-3 — Credentials

Pass `apiKey` to the constructor or set `OPENAI_API_KEY` in the environment. For third-party compatible endpoints, set `baseURL` to point at that provider's API.

## Out of Scope

- Streaming responses
- Embeddings, image generation, or audio
- Function/tool calling
- Assistants API
