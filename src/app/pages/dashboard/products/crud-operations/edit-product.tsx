import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { updateProduct } from "@/services/product-service";
import {
  categories,
  statuses,
  type ApiProduct,
  type ApiProductImage,
  type ImageError,
  type ProductCategory,
  type ProductEditProps,
  type ProductForm,
  type ProductImage,
  type ProductStatus,
} from "@/types/data-type";

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getInitialForm(product: ApiProduct): ProductForm {
  return {
    name: product.name,
    sku: product.sku,
    category: product.category_name,
    price: String(product.price),
    stock: String(product.stock),
    status: product.status,
    description: product.description,
  };
}

function revokeImageUrls(images: ProductImage[]) {
  images.forEach((image) => {
    URL.revokeObjectURL(image.previewUrl);
  });
}

function validateImage(file: File): ImageError | null {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      fileName: file.name,
      message: "is not supported. Please use JPG, PNG, or WEBP.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      fileName: file.name,
      message: "wasn't added",
      details: `${(file.size / 1024 / 1024).toFixed(1)} MB exceeds the 5 MB limit.`,
    };
  }

  return null;
}

export function ProductEdit({
  product,
  open,
  onOpenChange,
  onUpdated,
}: ProductEditProps) {
  const [form, setForm] = useState<ProductForm | null>(null);

  const [existingImages, setExistingImages] = useState<ApiProductImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<Set<string>>(
    new Set(),
  );
  const [newImages, setNewImages] = useState<ProductImage[]>([]);

  const [imageError, setImageError] = useState<ImageError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const originalForm = useRef<ProductForm | null>(null);

  useEffect(() => {
    if (!product || !open) return;

    const initialForm = getInitialForm(product);

    setForm(initialForm);
    setExistingImages(product.images ?? []);
    setRemovedImageIds(new Set());
    setNewImages([]);
    setImageError(null);

    originalForm.current = initialForm;
  }, [product, open]);

  const isDirty = useMemo(() => {
    if (!form || !originalForm.current) return false;

    const original = originalForm.current;

    const formChanged =
      form.name !== original.name ||
      form.sku !== original.sku ||
      form.category !== original.category ||
      form.price !== original.price ||
      form.stock !== original.stock ||
      form.status !== original.status ||
      form.description !== original.description;

    const imagesChanged = removedImageIds.size > 0 || newImages.length > 0;

    return formChanged || imagesChanged;
  }, [form, removedImageIds, newImages]);

  function updateField<K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K],
  ) {
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  }

  function discardChanges() {
    if (!product) return;

    revokeImageUrls(newImages);

    const initialForm = getInitialForm(product);

    setForm(initialForm);
    setExistingImages(product.images ?? []);
    setRemovedImageIds(new Set());
    setNewImages([]);
    setImageError(null);

    originalForm.current = initialForm;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!product || !form) return;

    if (
      !form.name.trim() ||
      !form.sku.trim() ||
      !form.category ||
      !form.price
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("sku", form.sku.trim());
      formData.append("category_name", form.category);
      formData.append("price", String(Number(form.price)));
      formData.append("stock", String(Number(form.stock)));
      formData.append("status", form.status);
      formData.append("description", form.description.trim());

      if (removedImageIds.size > 0) {
        formData.append(
          "removed_image_ids",
          JSON.stringify([...removedImageIds]),
        );
      }

      const existingPrimary = existingImages.find((img) => img.is_primary);
      if (existingPrimary) {
        formData.append("primary_image_id", existingPrimary.id);
      }

      newImages.forEach((image, index) => {
        formData.append("images", image.file);
        if (image.isPrimary) {
          formData.append("primary_new_image_index", String(index));
        }
      });

      const updated = await updateProduct(product.id, formData);

      toast.success("Product updated successfully");

      onOpenChange(false);
      onUpdated?.(updated);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update product",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleRemoveExistingImage(id: string) {
    setRemovedImageIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function setExistingImagePrimary(id: string) {
    setExistingImages((images) =>
      images.map((image) => ({
        ...image,
        is_primary: image.id === id,
      })),
    );
  }
  function handleNewImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) return;

    setImageError(null);

    const activeExistingCount = existingImages.filter(
      (image) => !removedImageIds.has(image.id),
    ).length;

    const remainingSlots = MAX_IMAGES - activeExistingCount - newImages.length;

    if (remainingSlots <= 0) {
      setImageError({
        message: `You can upload a maximum of ${MAX_IMAGES} images.`,
      });

      event.target.value = "";
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);

    const addedImages: ProductImage[] = [];
    let error: ImageError | null = null;

    for (const file of filesToAdd) {
      const validationError = validateImage(file);

      if (validationError) {
        error = validationError;
        continue;
      }

      addedImages.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),

        isPrimary:
          existingImages.length === 0 &&
          newImages.length === 0 &&
          addedImages.length === 0,
      });
    }

    if (addedImages.length) {
      setNewImages((prev) => [...prev, ...addedImages]);
    }

    setImageError(error);
    event.target.value = "";
  }

  function removeNewImage(id: string) {
    setNewImages((prev) => {
      const image = prev.find((item) => item.id === id);

      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }

      const remaining = prev.filter((item) => item.id !== id);

      if (image?.isPrimary && remaining.length > 0) {
        remaining[0] = {
          ...remaining[0],
          isPrimary: true,
        };
      }

      return remaining;
    });
  }

  function setNewImagePrimary(id: string) {
    setNewImages((images) =>
      images.map((image) => ({
        ...image,
        isPrimary: image.id === id,
      })),
    );
  }

  const activeExistingImages = existingImages.filter(
    (image) => !removedImageIds.has(image.id),
  );

  const activeImageCount = activeExistingImages.length + newImages.length;

  const remainingSlots = MAX_IMAGES - activeImageCount;

  if (!product || !form) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 p-0 sm:max-w-xl!">
        <SheetHeader className="flex flex-row items-center gap-3 border-b px-5 py-4">
          <div className="min-w-0 flex-1">
            <SheetTitle className="text-[15px] font-semibold">
              {product.name}
            </SheetTitle>
          </div>
        </SheetHeader>
        {isDirty && (
          <div className="flex items-center gap-2.5 border-b bg-accent px-5 py-3">
            <span className="text-[12px] font-medium text-accent-foreground">
              Unsaved changes
            </span>

            <div className="flex-1" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs font-medium"
              onClick={discardChanges}
            >
              Discard
            </Button>

            <span className="inline-flex h-7 items-center rounded-sm bg-primary px-2.5 text-xs font-medium text-primary-foreground">
              Keep editing
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="contents">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
            <div className="grid gap-1.5">
              <Label
                htmlFor="edit-product-name"
                className="text-[12px] font-medium"
              >
                Product name <span className="text-destructive">*</span>
              </Label>

              <Input
                id="edit-product-name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="h-10 text-[13px]"
              />
            </div>

            <div className="grid w-full grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label
                  htmlFor="edit-product-sku"
                  className="text-[12px] font-medium"
                >
                  SKU <span className="text-destructive">*</span>
                </Label>

                <Input
                  id="edit-product-sku"
                  value={form.sku}
                  onChange={(event) => updateField("sku", event.target.value)}
                  className="h-10 font-mono text-[12px]"
                />
              </div>

              <div className="grid gap-1.5">
                <Label
                  htmlFor="edit-product-category"
                  className="text-[12px] font-medium"
                >
                  Category <span className="text-destructive">*</span>
                </Label>

                <Select
                  value={form.category}
                  onValueChange={(value) =>
                    updateField("category", value as ProductCategory)
                  }
                >
                  <SelectTrigger
                    id="edit-product-category"
                    className="h-9 w-full text-[13px]"
                  >
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label
                  htmlFor="edit-product-price"
                  className="text-[12px] font-medium"
                >
                  Price <span className="text-destructive">*</span>
                </Label>

                <Input
                  id="edit-product-price"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  className="h-10 font-mono text-[12px]"
                />
              </div>

              <div className="grid gap-1.5">
                <Label
                  htmlFor="edit-product-stock"
                  className="text-[12px] font-medium"
                >
                  Stock
                </Label>

                <Input
                  id="edit-product-stock"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(event) => updateField("stock", event.target.value)}
                  className="h-10 font-mono text-[12px]"
                />
              </div>

              <div className="grid gap-1.5">
                <Label
                  htmlFor="edit-product-status"
                  className="text-[12px] font-medium"
                >
                  Status
                </Label>

                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    updateField("status", value as ProductStatus)
                  }
                >
                  <SelectTrigger
                    id="edit-product-status"
                    className="h-9 w-full text-[13px]"
                  >
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>

                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-[12px] font-medium">
                Images{" "}
                <span className="font-normal text-muted-foreground">
                  drag to reorder
                </span>
              </Label>

              <div className="grid grid-cols-4 gap-2">
                {activeExistingImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-md border bg-muted"
                  >
                    <img
                      src={image.url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => toggleRemoveExistingImage(image.id)}
                      className="absolute right-1.5 top-1.5 flex size-4.5 items-center justify-center rounded-full border bg-background text-[10px] hover:text-destructive"
                    >
                      ×
                    </button>

                    {image.is_primary ? (
                      <span className="absolute bottom-1.5 left-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                        Primary
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setExistingImagePrimary(image.id)}
                        className="absolute bottom-1.5 left-1.5 rounded-full border bg-background/90 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                      >
                        Set primary
                      </button>
                    )}
                  </div>
                ))}
                {existingImages
                  .filter((image) => removedImageIds.has(image.id))
                  .map((image) => (
                    <div
                      key={`removed-${image.id}`}
                      className="relative flex aspect-square items-center justify-center rounded-md border border-dashed border-destructive bg-destructive/5"
                    >
                      <span className="text-center text-[10px] font-medium text-destructive">
                        Removed on save
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleRemoveExistingImage(image.id)}
                        className="absolute right-1.5 top-1.5 flex size-4.5 items-center justify-center rounded-full border bg-background text-[10px]"
                      >
                        ↩
                      </button>
                    </div>
                  ))}
                {newImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-md border bg-muted"
                  >
                    <img
                      src={image.previewUrl}
                      alt={image.file.name}
                      className="h-full w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeNewImage(image.id)}
                      className="absolute right-1.5 top-1.5 flex size-4.5 items-center justify-center rounded-full border bg-background text-[10px] hover:text-destructive"
                    >
                      ×
                    </button>

                    {image.isPrimary ? (
                      <span className="absolute bottom-1.5 left-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                        Primary
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setNewImagePrimary(image.id)}
                        className="absolute bottom-1.5 left-1.5 rounded-full border bg-background/90 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                      >
                        Set primary
                      </button>
                    )}
                  </div>
                ))}
                {remainingSlots > 0 && (
                  <label
                    htmlFor="edit-product-images"
                    className="flex aspect-square cursor-pointer items-center justify-center rounded-md border border-dashed text-[18px] text-muted-foreground hover:bg-muted"
                  >
                    +
                  </label>
                )}

                <Input
                  id="edit-product-images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleNewImageChange}
                  className="hidden"
                />
              </div>
              {imageError && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2">
                  <p className="text-xs font-semibold text-red-600">
                    {imageError.fileName && (
                      <span className="font-medium">
                        {imageError.fileName}{" "}
                      </span>
                    )}

                    {imageError.message}
                  </p>

                  {imageError.details && (
                    <p className="text-xs text-muted-foreground">
                      {imageError.details}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label
                htmlFor="edit-product-description"
                className="text-[12px] font-medium"
              >
                Description
              </Label>

              <Textarea
                id="edit-product-description"
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className="h-20 resize-none text-[13px] leading-relaxed"
              />
            </div>
          </div>
          <div className="flex h-16 shrink-0 items-center gap-2 border-t px-5">
            <div className="flex-1" />

            <Button
              type="button"
              variant="secondary"
              className="h-9 px-3.5 text-[13px] font-medium"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-4 text-[13px] font-medium"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="size-3.5" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
