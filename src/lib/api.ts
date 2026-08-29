import type { ApiRequestOptions, JsonBody } from "@/types/data-type";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

if (!API_BASE_URL && import.meta.env.PROD) {
  console.error(
    "VITE_API_BASE_URL is not configured; API calls will use a relative path.",
  );
}

const API_TIMEOUT = 15_000;

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(
    message: string,
    status: number,
    options?: {
      code?: string;
      details?: unknown;
      requestId?: string;
    },
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = options?.code;
    this.details = options?.details;
    this.requestId = options?.requestId;
  }
}

function prepareRequestBody(
  body?: BodyInit | JsonBody,
): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }

  if (body instanceof FormData) {
    return body;
  }

  if (typeof body === "string") {
    return body;
  }

  return JSON.stringify(body);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getApiErrorMessage(data: unknown, status: number): string {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (
    isRecord(data) &&
    typeof data.message === "string" &&
    data.message.trim()
  ) {
    return data.message;
  }

  return `Request failed with status ${status}`;
}

function getApiErrorDetails(data: unknown): {
  code?: string;
  details?: unknown;
  requestId?: string;
} {
  if (!isRecord(data)) {
    return {};
  }

  const error = isRecord(data.error) ? data.error : undefined;

  return {
    code: error && typeof error.code === "string" ? error.code : undefined,
    details: error?.details,
    requestId:
      typeof data.request_id === "string" ? data.request_id : undefined,
  };
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, API_TIMEOUT);

  const signal = options.signal
    ? AbortSignal.any([options.signal, controller.signal])
    : controller.signal;

  try {
    const requestBody = prepareRequestBody(options.body);
    const isFormData = options.body instanceof FormData;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      body: requestBody,
      credentials: "include",
      signal,
      headers: {
        ...(isFormData
          ? {}
          : {
              "Content-Type": "application/json",
            }),
        ...options.headers,
      },
    });

    const contentType = response.headers.get("content-type") ?? "";

    let data: unknown = null;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const message = getApiErrorMessage(data, response.status);
      const errorDetails = getApiErrorDetails(data);

      throw new ApiError(message, response.status, errorDetails);
    }

    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      if (!timedOut) {
        throw error;
      }

      throw new Error(
        "The request timed out. Please check your connection and try again.",
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}