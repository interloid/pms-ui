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