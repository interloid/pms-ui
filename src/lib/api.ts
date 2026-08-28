import type { ApiRequestOptions, JsonBody } from "@/types/data-type";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_TIMEOUT = 15_000;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

function prepareRequestBody(body?: BodyInit | JsonBody): BodyInit | undefined {
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
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT);

  try {
    const requestBody = prepareRequestBody(options.body);
    const isFormData = options.body instanceof FormData;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      body: requestBody,
      signal: controller.signal,
      credentials: "include",
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
      throw new Error(
        "The request timed out. Please check your connection and try again.",
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
