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
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const FORM_DATA_FIELDS = {
  images: "images",
  removedImageIds: "removed_image_ids",
  primaryImageId: "primary_image_id",
  primaryNewImageIndex: "primary_new_image_index",
} as const;

type FormErrors = Partial<Record<keyof ProductForm, string>>;

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
  if (
    !ALLOWED_FILE_TYPES.includes(
      file.type as (typeof ALLOWED_FILE_TYPES)[number],
    )
  ) {
    return {
      fileName: file.name,
      message: "is not supported. Please use JPG, PNG, or WEBP.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      fileName: file.name,
      message: "wasn't added",
      details: `${(file.size / 1024 / 1024).toFixed(
        1,
      )} MB exceeds the 5 MB limit.`,
    };
  }

  return null;
}

function getPrimaryExistingImage(
  images: ApiProductImage[],
  removedIds: Set<string>,
): ApiProductImage | undefined {
  return images.find((image) => !removedIds.has(image.id) && image.is_primary);
}

function getPrimaryNewImage(images: ProductImage[]): ProductImage | undefined {
  return images.find((image) => image.isPrimary);
}

export function ProductEdit({
  product,
  open,
  onOpenChange,
  onUpdated,
}: ProductEditProps) {
  const [form, setForm] = useState<ProductForm | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [existingImages, setExistingImages] = useState<ApiProductImage[]>([]);
  const [newImages, setNewImages] = useState<ProductImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<Set<string>>(
    new Set(),
  );
  const [imageError, setImageError] = useState<ImageError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const originalForm = useRef<ProductForm | null>(null);
  const originalPrimaryImageId = useRef<string | null>(null);

  useEffect(() => {
    if (!product || !open) {
      return;
    }

    const initialForm = getInitialForm(product);
    const images = product.images ?? [];
    const primaryImage = images.find((image) => image.is_primary);

    setForm(initialForm);
    setErrors({});
    setExistingImages(images);
    setRemovedImageIds(new Set());
    setNewImages([]);
    setImageError(null);
    originalForm.current = initialForm;
    originalPrimaryImageId.current = primaryImage?.id ?? null;
  }, [product, open]);

  const activeExistingImages = useMemo(
    () => existingImages.filter((image) => !removedImageIds.has(image.id)),
    [existingImages, removedImageIds],
  );
  const removedExistingImages = useMemo(
    () => existingImages.filter((image) => removedImageIds.has(image.id)),
    [existingImages, removedImageIds],
  );

  const activeImageCount = activeExistingImages.length + newImages.length;
  const remainingSlots = Math.max(MAX_IMAGES - activeImageCount, 0);
  const primaryExistingImage = useMemo(
    () => getPrimaryExistingImage(existingImages, removedImageIds),
    [existingImages, removedImageIds],
  );
  const primaryNewImage = useMemo(
    () => getPrimaryNewImage(newImages),
    [newImages],
  );

  const currentPrimaryImageId = primaryExistingImage?.id ?? null;
  const currentPrimaryNewImageIndex = primaryNewImage
    ? newImages.findIndex((image) => image.id === primaryNewImage.id)
    : -1;
  const isDirty = useMemo(() => {
    if (!form || !originalForm.current) {
      return false;
    }
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
    const primaryImageChanged =
      currentPrimaryImageId !== originalPrimaryImageId.current ||
      currentPrimaryNewImageIndex >= 0;
    return formChanged || imagesChanged || primaryImageChanged;
  }, [
    form,
    removedImageIds,
    newImages,
    currentPrimaryImageId,
    currentPrimaryNewImageIndex,
  ]);

  function updateField<K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K],
  ) {
    setForm((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        [field]: value,
      };
    });

    setErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      return {
        ...previous,
        [field]: undefined,
      };
    });
  }

  function validateForm(): boolean {
    if (!form) {
      return false;
    }

    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "This Name is required.";
    }
    if (!form.sku.trim()) {
      newErrors.sku = "This SKU is required.";
    }
    if (!form.category) {
      newErrors.category = "This category is required.";
    }

    if (!form.price.trim()) {
      newErrors.price = "This price is required.";
    } else if (!Number.isFinite(Number(form.price))) {
      newErrors.price = "Please enter a valid price.";
    } else if (Number(form.price) < 0) {
      newErrors.price = "Price cannot be negative.";
    }
    if (!form.stock.trim()) {
      newErrors.stock = "This stock is required.";
    } else if (!Number.isFinite(Number(form.stock))) {
      newErrors.stock = "Please enter a valid stock.";
    } else if (Number(form.stock) < 0) {
      newErrors.stock = "Stock cannot be negative.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function discardChanges() {
    if (!product) {
      return;
    }

    revokeImageUrls(newImages);

    const initialForm = getInitialForm(product);
    const images = product.images ?? [];
    const primaryImage = images.find((image) => image.is_primary);

    setForm(initialForm);
    setErrors({});
    setExistingImages(images);
    setRemovedImageIds(new Set());
    setNewImages([]);
    setImageError(null);

    originalForm.current = initialForm;
    originalPrimaryImageId.current = primaryImage?.id ?? null;
  }

  function setExistingImagePrimary(id: string) {
    const imageExists = activeExistingImages.some((image) => image.id === id);

    if (!imageExists) {
      return;
    }

    setExistingImages((images) =>
      images.map((image) => ({
        ...image,
        is_primary: image.id === id,
      })),
    );

    setNewImages((images) =>
      images.map((image) => ({
        ...image,
        isPrimary: false,
      })),
    );
  }
  function setNewImagePrimary(id: string) {
    const imageExists = newImages.some((image) => image.id === id);

    if (!imageExists) {
      return;
    }

    setExistingImages((images) =>
      images.map((image) => ({
        ...image,
        is_primary: false,
      })),
    );

    setNewImages((images) =>
      images.map((image) => ({
        ...image,
        isPrimary: image.id === id,
      })),
    );
  }

  function toggleRemoveExistingImage(id: string) {
    const image = existingImages.find((item) => item.id === id);

    if (!image) {
      return;
    }

    const isRemoving = !removedImageIds.has(id);

    setRemovedImageIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });

    if (isRemoving && image.is_primary) {
      const fallbackExisting = existingImages.find(
        (item) => item.id !== id && !removedImageIds.has(item.id),
      );

      if (fallbackExisting) {
        setExistingImagePrimary(fallbackExisting.id);
        return;
      }

      const fallbackNew = newImages[0];

      if (fallbackNew) {
        setNewImagePrimary(fallbackNew.id);
      }
    }
  }

  function handleNewImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    setImageError(null);

    if (remainingSlots <= 0) {
      setImageError({
        message: `You can upload a maximum of ${MAX_IMAGES} images.`,
      });

      event.target.value = "";
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    const addedImages: ProductImage[] = [];
    let firstError: ImageError | null = null;

    for (const file of filesToProcess) {
      const validationError = validateImage(file);

      if (validationError) {
        firstError ??= validationError;
        continue;
      }

      const shouldBecomePrimary =
        activeExistingImages.length === 0 &&
        newImages.length === 0 &&
        addedImages.length === 0;

      addedImages.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        isPrimary: shouldBecomePrimary,
      });
    }

    if (addedImages.length > 0) {
      setNewImages((previous) => [...previous, ...addedImages]);
    }

    setImageError(firstError);
    event.target.value = "";
  }

  function removeNewImage(id: string) {
    const image = newImages.find((item) => item.id === id);

    if (!image) {
      return;
    }

    URL.revokeObjectURL(image.previewUrl);

    const remainingImages = newImages.filter((item) => item.id !== id);

    if (image.isPrimary) {
      if (remainingImages.length > 0) {
        const nextPrimaryId = remainingImages[0].id;

        setExistingImages((images) =>
          images.map((item) => ({
            ...item,
            is_primary: false,
          })),
        );

        setNewImages(
          remainingImages.map((item) => ({
            ...item,
            isPrimary: item.id === nextPrimaryId,
          })),
        );

        return;
      }

      const fallbackExisting = activeExistingImages[0];

      if (fallbackExisting) {
        setExistingImagePrimary(fallbackExisting.id);
      }
    }

    setNewImages(remainingImages);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!product || !form) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const name = form.name.trim();
    const sku = form.sku.trim();
    const description = form.description.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (activeImageCount > MAX_IMAGES) {
      toast.error(`You can have a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("sku", sku);
      formData.append("category_name", form.category);
      formData.append("price", String(price));
      formData.append("stock", String(stock));
      formData.append("status", form.status);
      formData.append("description", description);

      if (removedImageIds.size > 0) {
        formData.append(
          FORM_DATA_FIELDS.removedImageIds,
          JSON.stringify(Array.from(removedImageIds)),
        );
      }

      for (const image of newImages) {
        formData.append(FORM_DATA_FIELDS.images, image.file);
      }

      if (primaryExistingImage) {
        formData.append(
          FORM_DATA_FIELDS.primaryImageId,
          primaryExistingImage.id,
        );
      }

      if (currentPrimaryNewImageIndex >= 0) {
        formData.append(
          FORM_DATA_FIELDS.primaryNewImageIndex,
          String(currentPrimaryNewImageIndex),
        );
      }

      const updated = await updateProduct(product.id, formData);

      toast.success("Product updated successfully");

      onOpenChange(false);
      onUpdated?.(updated);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update product";

      if (message.toLowerCase().includes("sku")) {
        setErrors((previous) => ({
          ...previous,
          sku: "This SKU already exists.",
        }));

        return;
      }

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (open) {
      return;
    }

    revokeImageUrls(newImages);
  }, [open]);

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
                Product Name <span className="text-destructive">*</span>
              </Label>

              <Input
                id="edit-product-name"
                placeholder="e.g. Meridian Desk Lamp"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                aria-invalid={Boolean(errors.name)}
                className={`h-10 placeholder:text-xs focus-visible:ring-primary/20 ${
                  errors.name
                    ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                    : "focus-visible:border-primary"
                }`}
              />

              {errors.name && (
                <span className="text-[11px] font-normal text-destructive">
                  {errors.name}
                </span>
              )}
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
                  aria-invalid={Boolean(errors.sku)}
                  className={`h-10 font-mono placeholder:text-xs focus-visible:ring-primary/20 ${
                    errors.sku
                      ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                      : "focus-visible:border-primary"
                  }`}
                />

                {errors.sku && (
                  <span className="text-[11px] font-normal text-destructive">
                    {errors.sku}
                  </span>
                )}
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
                    aria-invalid={Boolean(errors.category)}
                    className={`h-9 w-full focus-visible:ring-primary/20 ${
                      errors.category
                        ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                        : "focus-visible:border-primary"
                    }`}
                  >
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>

                  <SelectContent
                    position="popper"
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    avoidCollisions={false}
                  >
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.category && (
                  <span className="text-[11px] font-normal text-destructive">
                    {errors.category}
                  </span>
                )}
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
                  step="0.01"
                  value={form.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  aria-invalid={Boolean(errors.price)}
                  className={`h-10 font-mono focus-visible:ring-primary/20 ${
                    errors.price
                      ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                      : "focus-visible:border-primary"
                  }`}
                />

                {errors.price && (
                  <span className="text-[11px] font-normal text-destructive">
                    {errors.price}
                  </span>
                )}
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
                  step="1"
                  value={form.stock}
                  onChange={(event) => updateField("stock", event.target.value)}
                  aria-invalid={Boolean(errors.stock)}
                  className={`h-10 font-mono focus-visible:ring-primary/20 ${
                    errors.stock
                      ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                      : "focus-visible:border-primary"
                  }`}
                />

                {errors.stock && (
                  <span className="text-[11px] font-normal text-destructive">
                    {errors.stock}
                  </span>
                )}
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
                    className="h-9 w-full"
                  >
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>

                  <SelectContent
                    position="popper"
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    avoidCollisions={false}
                  >
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
              <div className="flex items-center justify-between">
                <Label className="text-[12px] font-medium">Images</Label>

                <span className="text-[11px] text-muted-foreground">
                  {activeImageCount}/{MAX_IMAGES}
                </span>
              </div>

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

                {removedExistingImages.map((image) => (
                  <div
                    key={`removed-${image.id}`}
                    className="relative flex aspect-square items-center justify-center rounded-md border border-dashed border-destructive bg-destructive/5"
                  >
                    <span className="px-2 text-center text-[10px] font-medium text-destructive">
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
                className="h-20 resize-none leading-relaxed focus-visible:ring-primary/20 focus-visible:border-primary"
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
              disabled={isSubmitting}
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
