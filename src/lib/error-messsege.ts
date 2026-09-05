export function getUserFriendlyErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "Unable to connect to the server. Please check your connection and try again.";
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("network")) {
      return "Unable to connect to the server. Please try again.";
    }
    if (message.includes("timeout")) {
      return "The request took too long. Please try again.";
    }
    if (message.includes("unauthorized") || message.includes("401")) {
      return "Your session has expired. Please sign in again.";
    }
    if (message.includes("forbidden") || message.includes("403")) {
      return "You don't have permission to perform this action.";
    }
    if (message.includes("not found") || message.includes("404")) {
      return "The requested product could not be found.";
    }
    if (message.includes("sku")) {
      return "This SKU already exists. Please use a different SKU.";
    }
    if (message.includes("422")) {
      return "Some of the information you entered is invalid. Please check the form.";
    }
    if (message.includes("500")) {
      return "Something went wrong on the server. Please try again later.";
    }
    return fallback;
  }
  return fallback;
}

export function getPasscodeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Invalid passcode.";
  }

  try {
    const parsed = JSON.parse(error.message);

    const details = parsed?.error?.details;

    if (details) {
      const { remaining_attempts, retry_after_seconds } = details;

      if (remaining_attempts !== undefined) {
        if (remaining_attempts === 0 && retry_after_seconds) {
          const minutes = Math.ceil(retry_after_seconds / 60);

          return `Invalid passcode. Try again after ${minutes} minute${
            minutes === 1 ? "" : "s"
          }.`;
        }

        return `Invalid passcode. ${remaining_attempts} attempt${
          remaining_attempts === 1 ? "" : "s"
        } left before a ${Math.ceil(retry_after_seconds / 60)}-minute cooldown.`;
      }
    }

    return parsed?.message || "Invalid passcode.";
  } catch {
    return error.message || "Invalid passcode.";
  }
}
