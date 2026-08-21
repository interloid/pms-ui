export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function convertKeysToCamelCase<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase) as T;
  }

  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        toCamelCase(key),
        convertKeysToCamelCase(value),
      ])
    ) as T;
  }

  return obj;
}

export function convertKeysToSnakeCase<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnakeCase) as T;
  }

  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        toSnakeCase(key),
        convertKeysToSnakeCase(value),
      ])
    ) as T;
  }

  return obj;
}

export function formatStatus(status: string): string {
  return status
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function statusToApi(status: string): string {
  return status.toLowerCase();
}

export function priceToString(price: number): string {
  return String(price);
}

export function priceToNumber(price: string | number): number {
  return Number(price);
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}



