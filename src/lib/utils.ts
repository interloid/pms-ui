import type { AuthErrorCode } from "@/types/auth";
import type { ProductImage } from "@/types/data-type";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function revokeImageUrls(images: ProductImage[]) {
  for (const image of images) {
    URL.revokeObjectURL(image.previewUrl);
  }
}

export function getAuthErrorCode(error: unknown): AuthErrorCode {
  if (error instanceof TypeError) {
    return "NETWORK_ERROR";
  }

  return "UNKNOWN_ERROR";
}
