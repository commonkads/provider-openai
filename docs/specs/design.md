# Design — @commonkads/provider-openai

## 1. Component Overview

| File | Export | Engine Interface |
|------|--------|-----------------|
| `src/openai.ts` | `OpenAITextInference`, `OpenAITextInferenceOptions` | `IInferenceProvider` |
| `src/index.ts` | `registerOpenAIProviders`, `register`, `OpenAIProviderOptions` | — |

## 2. Interface Implementation

`OpenAITextInference implements IInferenceProvider`

The `infer(prompt, options?)` method:
1. Builds a messages array — optional `system` role message from `options.systemPrompt`, then a `user` message with the prompt
2. Calls `this.client.chat.completions.create` with model, `max_tokens`, and messages
3. Returns `response.choices[0].message.content ?? ''`

## 3. Options Schema

```ts
interface OpenAITextInferenceOptions {
  apiKey?: string;
  baseURL?: string;    // for Groq, Mistral, Together AI, etc.
  maxTokens?: number;  // default 8192
  client?: OpenAI;     // injectable for testing
}
```

## 4. Registry Wiring

```ts
registerOpenAIProviders();
// Registers: registerProvider('openai', (opts) => new OpenAITextInference(opts.model, { ... }))

// OpenAI
const inference = buildInference({ type: 'openai', model: 'gpt-4o' });

// Groq via compatible endpoint
const inference = buildInference({
  type: 'openai',
  model: 'llama-3.3-70b-versatile',
  baseURL: 'https://api.groq.com/openai/v1',
});
```
