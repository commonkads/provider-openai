# @commonkads/provider-openai

> **Disclaimer:** This project is an independent open-source software implementation inspired by the CommonKADS knowledge engineering methodology (Schreiber et al.). It is not affiliated with or endorsed by the original methodology authors or any third-party trademark holders.

OpenAI-compatible provider implementation for the [CommonKADS engine](https://github.com/commonkads/engine). Supports OpenAI, Groq, Mistral, Together AI, and any OpenAI-compatible endpoint.

## Provided implementations

| Export | Interface | Description |
|--------|-----------|-------------|
| `OpenAITextInference` | `IInferenceProvider` | OpenAI-compatible chat completions API |

## Usage

### Via the registry (recommended)

```ts
import { registerOpenAIProviders } from '@commonkads/provider-openai';
import { buildInference } from '@commonkads/engine';

// Call once at startup, before any buildInference calls.
registerOpenAIProviders();

const inference = buildInference({
  type: 'openai',
  model: 'gpt-4o',
  apiKey: process.env.OPENAI_API_KEY,
});
```

### Direct construction

```ts
import { OpenAITextInference } from '@commonkads/provider-openai';

// OpenAI
const inference = new OpenAITextInference('gpt-4o', {
  apiKey: process.env.OPENAI_API_KEY,
});

// Groq (OpenAI-compatible)
const groq = new OpenAITextInference('llama-3.3-70b-versatile', {
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});
```

## Third-party extension pattern

`registerOpenAIProviders()` is the official extension point for wiring providers into
the engine without forking it. See `@commonkads/provider-aws` for the full pattern
documentation.

## Credentials

Set `OPENAI_API_KEY` in the environment, or pass `apiKey` directly to the constructor.
For other compatible providers, also pass `baseURL` pointing at their endpoint.
