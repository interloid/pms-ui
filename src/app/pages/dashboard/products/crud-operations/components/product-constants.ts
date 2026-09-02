import type { ImageError, ProductImage } from "@/types/data-type";

export const MAX_IMAGES = 6;
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function validateImage(file: File): ImageError | null {
  if (
    !ALLOWED_FILE_TYPES.includes(
      file.type as (typeof ALLOWED_FILE_TYPES)[number],
    )
  ) {
    return {
      fileName: file.name,
      fileSize: file.size,
      message: "is not supported.",
      details: "Please use JPG, PNG, or WEBP.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      fileName: file.name,
      fileSize: file.size,
      message: "exceeds the 5 MB limit.",
    };
  }

  return null;
}

export function isDuplicateFile(file: File, images: ProductImage[]): boolean {
  return images.some(
    (image) =>
      image.file.name === file.name &&
      image.file.size === file.size &&
      image.file.lastModified === file.lastModified,
  );
}
