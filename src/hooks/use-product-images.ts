import { useCallback, useState, type ChangeEvent, type DragEvent } from "react";
import {
  MAX_IMAGES,
  validateImage,
} from "@/app/pages/dashboard/products/crud-operations/components/product-constants";
import type { ImageError, ProductImage } from "@/types/data-type";

interface UseProductImagesOptions {
  maxImages?: number;
  isSubmitting?: boolean;
  shouldAutoSetPrimary?: () => boolean;
}

interface UseProductImagesReturn {
  images: ProductImage[];
  imageError: ImageError | null;
  isDragging: boolean;
  remainingSlots: number;
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleDragEnter: (event: DragEvent<HTMLLabelElement>) => void;
  handleDragOver: (event: DragEvent<HTMLLabelElement>) => void;
  handleDragLeave: (event: DragEvent<HTMLLabelElement>) => void;
  handleDrop: (event: DragEvent<HTMLLabelElement>) => void;
  removeImage: (id: string) => void;
  setPrimaryImage: (id: string) => void;
  clearPrimaryImage: () => void;
  clearImages: () => void;
}

export function useProductImages({
  maxImages = MAX_IMAGES,
  isSubmitting = false,
  shouldAutoSetPrimary,
}: UseProductImagesOptions = {}): UseProductImagesReturn {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [imageError, setImageError] = useState<ImageError | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const remainingSlots = Math.max(maxImages - images.length, 0);

  const processFiles = useCallback(
    (fileList: FileList | File[]) => {
      const selectedFiles = Array.from(fileList);

      if (selectedFiles.length === 0 || isSubmitting) {
        return;
      }

      setImageError(null);

      const availableSlots = Math.max(maxImages - images.length, 0);

      if (availableSlots <= 0) {
        setImageError({
          message: `You can upload a maximum of ${maxImages} images.`,
        });
        return;
      }

      let firstError: ImageError | null = null;

      if (selectedFiles.length > availableSlots) {
        firstError = {
          message: `You can only add ${availableSlots} more image${
            availableSlots === 1 ? "" : "s"
          }.`,
        };
      }

      const filesToProcess = selectedFiles.slice(0, availableSlots);

      const addedImages: ProductImage[] = [];

      for (const file of filesToProcess) {
        const validationError = validateImage(file);

        if (validationError) {
          firstError ??= validationError;
          continue;
        }

        addedImages.push({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          isPrimary:
            (shouldAutoSetPrimary?.() ?? false) &&
            images.length === 0 &&
            addedImages.length === 0,
        });
      }

      if (addedImages.length > 0) {
        setImages((previous) => [...previous, ...addedImages]);
      }

      setImageError(firstError);
    },
    [images, isSubmitting, maxImages, shouldAutoSetPrimary],
  );

  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      processFiles(event.target.files ?? []);
      event.target.value = "";
    },
    [processFiles],
  );

  const handleDragEnter = useCallback(
    (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (isSubmitting || remainingSlots <= 0) {
        return;
      }

      setIsDragging(true);
    },
    [isSubmitting, remainingSlots],
  );

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (isSubmitting || remainingSlots <= 0) {
        return;
      }

      event.dataTransfer.dropEffect = "copy";
      setIsDragging(true);
    },
    [isSubmitting, remainingSlots],
  );

  const handleDragLeave = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      event.stopPropagation();

      setIsDragging(false);

      if (isSubmitting) {
        return;
      }

      if (remainingSlots <= 0) {
        setImageError({
          message: `Maximum ${maxImages} images allowed.`,
        });
        return;
      }

      processFiles(event.dataTransfer.files);
    },
    [isSubmitting, maxImages, processFiles, remainingSlots],
  );

  const removeImage = useCallback((id: string) => {
    setImages((previous) => {
      const image = previous.find((item) => item.id === id);

      if (!image) {
        return previous;
      }

      URL.revokeObjectURL(image.previewUrl);

      return previous.filter((item) => item.id !== id);
    });
  }, []);

  const setPrimaryImage = useCallback((id: string) => {
    setImages((previous) =>
      previous.map((image) => ({
        ...image,
        isPrimary: image.id === id,
      })),
    );
  }, []);

  const clearPrimaryImage = useCallback(() => {
    setImages((previous) =>
      previous.map((image) => ({
        ...image,
        isPrimary: false,
      })),
    );
  }, []);

  const clearImages = useCallback(() => {
    setImages((previous) => {
      previous.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });

      return [];
    });

    setImageError(null);
    setIsDragging(false);
  }, []);

  return {
    images,
    imageError,
    isDragging,
    remainingSlots,
    handleImageChange,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeImage,
    setPrimaryImage,
    clearPrimaryImage,
    clearImages,
  };
}
