import { ApiError, type ApiRequestOptions, type JsonBody } from "@/types/data-type";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const API_TIMEOUT = 15_000;

if (!API_BASE_URL && import.meta.env.PROD) {
  console.error(
    "VITE_API_BASE_URL is not configured. API calls will use relative paths.",
  );
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

function getApiErrorDetails(data: unknown) {
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
    const isFormData = options.body instanceof FormData;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      body: prepareRequestBody(options.body),
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

    const data: unknown = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new ApiError(
        getApiErrorMessage(data, response.status),
        response.status,
        getApiErrorDetails(data),
      );
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