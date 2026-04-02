import { AVAILABLE_MODELS } from "@/lib/models";

const ALLOWED_MODEL_IDS = new Set(AVAILABLE_MODELS.map((model) => model.id));
const ALLOWED_ROLES = new Set(["system", "user", "assistant"]);

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface MultiChatBody {
  models: string[];
  messages?: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  message?: string;
}

export interface ValidatedChatPayload {
  models: string[];
  messages: ChatMessage[];
  maxTokens: number;
  temperature: number;
}

export function validateChatPayload(payload: unknown): {
  data?: ValidatedChatPayload;
  error?: string;
} {
  if (!payload || typeof payload !== "object") {
    return { error: "Request body must be a JSON object." };
  }

  const body = payload as MultiChatBody;

  if (!Array.isArray(body.models) || body.models.length === 0) {
    return { error: "Select at least one AI model." };
  }

  if (body.models.length > 3) {
    return { error: "A maximum of 3 models can be compared per request." };
  }

  const models = body.models.filter((modelId): modelId is string => typeof modelId === "string");
  if (models.length !== body.models.length) {
    return { error: "Every model identifier must be a string." };
  }

  if (new Set(models).size !== models.length) {
    return { error: "Duplicate models are not allowed." };
  }

  const invalidModel = models.find((modelId) => !ALLOWED_MODEL_IDS.has(modelId));
  if (invalidModel) {
    return { error: `Unsupported model requested: ${invalidModel}` };
  }

  let messages: ChatMessage[] = [];
  if (typeof body.message === "string" && body.message.trim().length > 0) {
    messages = [{ role: "user", content: body.message.trim() }];
  } else if (Array.isArray(body.messages) && body.messages.length > 0) {
    messages = body.messages
      .filter((message): message is ChatMessage => {
        return Boolean(
          message &&
            typeof message === "object" &&
            typeof message.role === "string" &&
            typeof message.content === "string",
        );
      })
      .map((message) => ({
        role: message.role,
        content: message.content.trim(),
      }))
      .filter((message) => message.content.length > 0);
  }

  if (messages.length === 0) {
    return { error: "Provide a non-empty message to compare." };
  }

  if (messages.length > 20) {
    return { error: "A maximum of 20 messages is allowed per request." };
  }

  const invalidRole = messages.find((message) => !ALLOWED_ROLES.has(message.role));
  if (invalidRole) {
    return { error: `Unsupported message role: ${invalidRole.role}` };
  }

  const totalCharacters = messages.reduce((sum, message) => sum + message.content.length, 0);
  if (totalCharacters > 12_000) {
    return { error: "The combined prompt is too large." };
  }

  const maxTokens = normalizeNumber(body.maxTokens, 512, 64, 1024);
  const temperature = normalizeNumber(body.temperature, 0.7, 0, 1);

  return {
    data: {
      models,
      messages,
      maxTokens,
      temperature,
    },
  };
}

function normalizeNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(Math.max(value, min), max);
}
