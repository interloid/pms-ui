import type { ApiRequestOptions, JsonBody } from "@/types/data-type";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

if (!API_BASE_URL && import.meta.env.PROD) {
  console.error(
    "VITE_API_BASE_URL is not configured; API calls will use a relative path.",
  );
}
const API_TIMEOUT = 15_000;

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
      let message = `Request failed with status ${response.status}`;

      if (typeof data === "string" && data.trim()) {
        message = data;
      } else if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        message = data.message;
      }
      throw new Error(message);
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