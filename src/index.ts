import { registerProvider } from "@commonkads/engine";
import { OpenAITextInference } from "./openai.js";

export { OpenAITextInference };
export type { OpenAITextInferenceOptions } from "./openai.js";

export interface OpenAIProviderOptions {
  type: "openai";
  model: string;
  apiKey?: string;
  baseURL?: string;
  maxTokens?: number;
}

export function registerOpenAIProviders(): void {
  registerProvider("openai", (opts) => {
    const o = opts as unknown as OpenAIProviderOptions;
    return new OpenAITextInference(o.model, {
      apiKey: o.apiKey,
      baseURL: o.baseURL,
      maxTokens: o.maxTokens,
    });
  });
}

export { registerOpenAIProviders as register };
