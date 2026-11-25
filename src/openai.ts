import OpenAI from "openai";

import type {
  InferenceOptions,
  IInferenceProvider,
} from "@commonkads/engine";
import { createDiagnosticsLogger } from "@commonkads/engine";

const DEFAULT_MAX_TOKENS = 8192;
const logger = createDiagnosticsLogger("providers:openai");

export interface OpenAITextInferenceOptions {
  apiKey?: string;
  /** Base URL override — use to point at Groq, Mistral, Together AI, or any OpenAI-compatible endpoint. */
  baseURL?: string;
  maxTokens?: number;
  /** Injectable for testing; defaults to a real `OpenAI` client. */
  client?: OpenAI;
}

/** `IInferenceProvider` backed by any OpenAI-compatible chat completions API. */
export class OpenAITextInference implements IInferenceProvider {
  private readonly client: OpenAI;

  constructor(
    private readonly modelId: string,
    private readonly options: OpenAITextInferenceOptions = {},
  ) {
    this.client =
      options.client ??
      new OpenAI({
        ...(options.apiKey ? { apiKey: options.apiKey } : {}),
        ...(options.baseURL ? { baseURL: options.baseURL } : {}),
      });
  }

  async infer(prompt: string, options: InferenceOptions = {}): Promise<string> {
    logger.debug(
      `calling model=${this.modelId} promptLength=${prompt.length} explain=${Boolean(options.explain)}`,
    );

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      ...(options.systemPrompt
        ? [{ role: "system" as const, content: options.systemPrompt }]
        : []),
      { role: "user", content: prompt },
    ];

    const response = await this.client.chat.completions.create({
      model: this.modelId,
      max_tokens: this.options.maxTokens ?? DEFAULT_MAX_TOKENS,
      messages,
    });

    return response.choices[0]?.message?.content ?? "";
  }
}
