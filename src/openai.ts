import OpenAI from "openai";

import type {
  InferenceOptions,
  InferenceProvider,
  ProviderFileConfig,
} from "@commonkads/engine";
import {
  createDiagnosticsLogger,
  loadProviderConfig,
} from "@commonkads/engine";

const DEFAULT_MAX_TOKENS = 8192;
const logger = createDiagnosticsLogger("providers:openai");

type OpenAIFileConfig = ProviderFileConfig & { baseURL?: string };

export interface OpenAITextInferenceOptions {
  apiKey?: string;
  /** Base URL override — use to point at Groq, Mistral, Together AI, or any OpenAI-compatible endpoint. */
  baseURL?: string;
  maxTokens?: number;
  /** Path to a provider config file; defaults to ~/.commonkads/openai.yml. */
  configFile?: string;
  /** Injectable for testing; defaults to a real `OpenAI` client. */
  client?: OpenAI;
}

/** `InferenceProvider` backed by any OpenAI-compatible chat completions API. */
export class OpenAITextInference implements InferenceProvider {
  private readonly client: OpenAI;
  private readonly modelId: string;

  constructor(
    modelId?: string,
    private readonly options: OpenAITextInferenceOptions = {},
  ) {
    const fileConfig = loadProviderConfig<OpenAIFileConfig>(
      "openai",
      options.configFile,
    );

    let resolvedModel: string;
    let modelSource: string;
    if (modelId !== undefined) {
      resolvedModel = modelId;
      modelSource = "explicit-arg";
    } else if (fileConfig.modelId !== undefined) {
      resolvedModel = fileConfig.modelId;
      modelSource = "config-file";
    } else {
      throw new Error(
        "modelId is required: pass it or set modelId in ~/.commonkads/providers/openai.yml",
      );
    }
    this.modelId = resolvedModel;

    const resolvedApiKey =
      options.apiKey ?? process.env["OPENAI_API_KEY"] ?? fileConfig.apiKey;
    const apiKeySource =
      options.apiKey !== undefined
        ? "explicit-arg"
        : process.env["OPENAI_API_KEY"] !== undefined
          ? "env-var"
          : fileConfig.apiKey !== undefined
            ? "config-file"
            : "sdk-default";

    logger.info(`config: model="${resolvedModel}" source=${modelSource}`);
    if (resolvedApiKey !== undefined) {
      logger.info(`config: apiKey=*** source=${apiKeySource}`);
    } else {
      logger.info(`config: apiKey=<none> source=${apiKeySource}`);
    }

    const resolvedBaseURL = options.baseURL ?? fileConfig.baseURL;

    this.client =
      options.client ??
      new OpenAI({
        ...(resolvedApiKey ? { apiKey: resolvedApiKey } : {}),
        ...(resolvedBaseURL ? { baseURL: resolvedBaseURL } : {}),
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
