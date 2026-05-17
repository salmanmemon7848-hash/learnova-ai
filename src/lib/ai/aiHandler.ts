import type {
  AIHandlerInput,
  AIHandlerOutput,
  AIProviderName,
  AIVisionHandlerInput,
  TaskComplexity,
} from './types';
import { AIProviderError, normalizeThrownError } from './types';
import * as groq from './providers/groq';
import * as gemini from './providers/gemini';
import * as openai from './providers/openai';
import * as openrouter from './providers/openrouter';
import * as searxng from './providers/searxng';

export type { AIHandlerInput, AIHandlerOutput, AIProviderName, TaskComplexity };

const UNAVAILABLE_MESSAGE = 'Our AI is temporarily unavailable. Please try again in a moment.';

type ProviderDefinition = {
  name: AIProviderName;
  call: (prompt: string, context: string | undefined, taskComplexity: TaskComplexity) => Promise<string>;
};

const providerMap: Record<AIProviderName, ProviderDefinition> = {
  groq: {
    name: 'groq',
    call: (prompt, context) => groq.call(prompt, context),
  },
  gemini: {
    name: 'gemini',
    call: (prompt, context, taskComplexity) => gemini.call(prompt, context, taskComplexity),
  },
  openai: {
    name: 'openai',
    call: (prompt, context, taskComplexity) => openai.call(prompt, context, taskComplexity),
  },
  openrouter: {
    name: 'openrouter',
    call: (prompt, context, taskComplexity) => openrouter.call(prompt, context, taskComplexity),
  },
  searxng: {
    name: 'searxng',
    call: (prompt) => searxng.call(prompt),
  },
};

function getProviderChain(isSearchFeature: boolean): ProviderDefinition[] {
  const chain: AIProviderName[] = isSearchFeature
    ? ['groq', 'gemini', 'openai', 'openrouter', 'searxng']
    : ['groq', 'gemini', 'openai', 'openrouter'];


  return chain.map((provider) => providerMap[provider]);
}

function logFallback(
  provider: AIProviderName,
  featureName: string,
  error: AIProviderError,
  nextProvider?: AIProviderName
): void {
  const payload = {
    timestamp: new Date().toISOString(),
    featureName,
    failedProvider: provider,
    reason: error.reason,
    status: error.status ?? null,
    switchedTo: nextProvider ?? null,
  };

  console.error('[AI Fallback]', payload);
}

export async function aiHandler(input: AIHandlerInput): Promise<AIHandlerOutput> {
  const failedProviders: string[] = [];
  const chain = getProviderChain(input.isSearchFeature);

  for (let index = 0; index < chain.length; index += 1) {
    const provider = chain[index];

    try {
      const result = await provider.call(input.prompt, input.context, input.taskComplexity);
      const cleanResult = result?.trim() ?? '';

      if (cleanResult) {
        return {
          result: cleanResult,
          provider: provider.name,
          fallbackTriggered: failedProviders.length > 0,
          failedProviders: failedProviders.length > 0 ? failedProviders : undefined,
        };
      }

      throw new AIProviderError(provider.name, 'empty_response', `${provider.name} returned empty response`);
    } catch (error) {
      const providerError = normalizeThrownError(provider.name, error);
      failedProviders.push(provider.name);

      const nextProvider = chain[index + 1]?.name;
      logFallback(provider.name, input.featureName, providerError, nextProvider);

      if (!providerError.shouldFallback) {
        break;
      }
    }
  }

  console.error('[AI Handler] ALL text providers failed.', {
    failedProviders,
    featureName: input.featureName,
  });

  return {
    result: UNAVAILABLE_MESSAGE,
    provider: null,
    fallbackTriggered: true,
    failedProviders,
  };
}

export async function aiVisionHandler(input: AIVisionHandlerInput): Promise<AIHandlerOutput> {
  const failedProviders: string[] = [];
  const visionChain: Array<Pick<ProviderDefinition, 'name'> & {
    callVision: (prompt: string, imageBase64: string, mimeType: string, taskComplexity: TaskComplexity) => Promise<string>;
  }> = [
    { name: 'gemini', callVision: gemini.callVision },
    { name: 'openai', callVision: openai.callVision },
  ];

  for (let index = 0; index < visionChain.length; index += 1) {
    const provider = visionChain[index];

    try {
      const result = await provider.callVision(
        input.prompt,
        input.imageBase64,
        input.mimeType,
        input.taskComplexity
      );
      const cleanResult = result?.trim() ?? '';

      if (cleanResult) {
        return {
          result: cleanResult,
          provider: provider.name,
          fallbackTriggered: failedProviders.length > 0,
          failedProviders: failedProviders.length > 0 ? failedProviders : undefined,
        };
      }

      throw new AIProviderError(provider.name, 'empty_response', `${provider.name} returned empty response`);
    } catch (error) {
      const providerError = normalizeThrownError(provider.name, error);
      failedProviders.push(provider.name);
      const nextProvider = visionChain[index + 1]?.name;
      logFallback(provider.name, input.featureName, providerError, nextProvider);

      if (!providerError.shouldFallback) {
        break;
      }
    }
  }

  console.error('[Vision Handler] ALL vision providers failed. Image cannot be processed.', {
    failedProviders,
    featureName: input.featureName,
    mimeType: input.mimeType,
    imageSizeBytes: input.imageBase64?.length ?? 0,
  });

  return {
    result: UNAVAILABLE_MESSAGE,
    provider: null,
    fallbackTriggered: true,
    failedProviders,
  };
}

export function fallbackUnavailableMessage(): string {
  return UNAVAILABLE_MESSAGE;
}

export type AIChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export function messagesToPrompt(messages: AIChatMessage[]): string {
  return messages
    .filter((message) => message.role !== 'system' && message.content.trim())
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join('\n\n');
}
