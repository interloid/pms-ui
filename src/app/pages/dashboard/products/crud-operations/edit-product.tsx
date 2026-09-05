import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { RotateCcw, X } from "lucide-react";
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
  productCategories,
  statuses,
  type ApiProduct,
  type ApiProductImage,
  type FormError,
  type ImageError,
  type ProductCategory,
  type ProductEditProps,
  type ProductForm,
  type ProductImage,
  type ProductStatus,
} from "@/types/data-type";
import { revokeImageUrls } from "@/lib/utils";
import { getUserFriendlyErrorMessage } from "@/lib/error-messsege";
import { ProductImagePreview } from "../preview-image/product-image-preview";
import { UnsavedChangesDialog } from "@/components/shad/unsaved-changes-dialog";
import { FieldError } from "@/components/shad/field-error";
import { MAX_IMAGES, validateImage } from "./components/product-constants";
import { getPrimaryImage } from "@/lib/product-utils";
import { ImageErrorBanner } from "./components/image-error-banner";
import { ImageOverlayControls } from "./components/image-overlay-controls";
import { validateProductFields } from "./components/product-validation";
import { PRODUCT_FORM_FIELDS } from "./components/product-form-fields";

function getInitialForm(product: ApiProduct): ProductForm {
  return {
    name: product.name ?? "",
    sku: product.sku ?? "",
    category: product.category_name ?? "",
    price: String(product.price ?? ""),
    stock: String(product.stock ?? ""),
    status: product.status,
    description: product.description ?? "",
  };
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

export default function ProductEdit({
  product,
  open,
  onOpenChange,
  onUpdated,
}: ProductEditProps) {
  const [form, setForm] = useState<ProductForm>(() => getInitialForm(product));
  const [errors, setErrors] = useState<FormError>({});
  const [existingImages, setExistingImages] = useState<ApiProductImage[]>(
    () => product?.images ?? [],
  );
  const [newImages, setNewImages] = useState<ProductImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<Set<string>>(
    new Set(),
  );
  const [imageError, setImageError] = useState<ImageError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [originalForm, setOriginalForm] = useState<ProductForm | null>(
    product ? getInitialForm(product) : null,
  );
  const [originalPrimaryImageId, setOriginalPrimaryImageId] = useState<
    string | null
  >(product ? (getPrimaryImage(product)?.id ?? null) : null);

  const newImagesRef = useRef<ProductImage[]>([]);

  useEffect(() => {
    newImagesRef.current = newImages;
  }, [newImages]);

  useEffect(() => {
    return () => {
      revokeImageUrls(newImagesRef.current);
    };
  }, []);

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
    if (!form || !originalForm) {
      return false;
    }

    const original = originalForm;
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
      currentPrimaryImageId !== originalPrimaryImageId ||
      currentPrimaryNewImageIndex >= 0;

    return formChanged || imagesChanged || primaryImageChanged;
  }, [
    form,
    originalForm,
    originalPrimaryImageId,
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

  const validateForm = () => {
    if (!form) {
      return false;
    }
    const errors = validateProductFields(form);

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  function discardChanges() {
    if (!product) {
      return;
    }

    revokeImageUrls(newImages);

    const initialForm = getInitialForm(product);
    const images = product.images ?? [];
    const primaryImage = getPrimaryImage(product);

    setForm(initialForm);
    setErrors({});
    setExistingImages(images);
    setRemovedImageIds(new Set());
    setNewImages([]);
    setImageError(null);
    setIsDragging(false);

    setOriginalForm(initialForm);
    setOriginalPrimaryImageId(primaryImage?.id ?? null);
  }

  function handleSheetOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }

    if (!isDirty) {
      revokeImageUrls(newImages);
      setNewImages([]);
      onOpenChange(false);
      return;
    }

    setShowDiscardDialog(true);
  }

  function handleKeepEditing() {
    setShowDiscardDialog(false);
  }

  function handleDiscardAndClose() {
    discardChanges();
    setShowDiscardDialog(false);
    onOpenChange(false);
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

    const nextRemovedIds = new Set(removedImageIds);

    if (isRemoving) {
      nextRemovedIds.add(id);
    } else {
      nextRemovedIds.delete(id);
    }

    setRemovedImageIds(nextRemovedIds);

    if (isRemoving && image.is_primary) {
      const fallbackExisting = existingImages.find(
        (item) => item.id !== id && !nextRemovedIds.has(item.id),
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

  function processFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);

    if (files.length === 0) {
      return;
    }

    setImageError(null);

    if (remainingSlots <= 0) {
      setImageError({
        message: `You can upload a maximum of ${MAX_IMAGES} images.`,
      });
      return;
    }

    let firstError: ImageError | null = null;

    if (files.length > remainingSlots) {
      firstError = {
        message: `You can only add ${remainingSlots} more image${
          remainingSlots === 1 ? "" : "s"
        }.`,
      };
    }

    const filesToProcess = files.slice(0, remainingSlots);

    const addedImages: ProductImage[] = [];

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
  }

  function handleNewImageChange(event: ChangeEvent<HTMLInputElement>) {
    processFiles(event.target.files ?? []);
    event.target.value = "";
  }

  function handleDragEnter(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isSubmitting || remainingSlots <= 0) {
      return;
    }

    setIsDragging(true);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isSubmitting || remainingSlots <= 0) {
      return;
    }

    event.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (event.currentTarget.contains(event.relatedTarget as Node)) {
      return;
    }

    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    if (isSubmitting) {
      return;
    }

    if (remainingSlots <= 0) {
      setImageError({
        message: `Maximum ${MAX_IMAGES} images allowed.`,
      });
      return;
    }

    processFiles(event.dataTransfer.files);
  }

  function removeNewImage(id: string) {
    const image = newImages.find((item) => item.id === id);

    if (!image) {
      return;
    }

    URL.revokeObjectURL(image.previewUrl);

    const remainingImages = newImages.filter((item) => item.id !== id);

    if (image.isPrimary) {
      const fallbackNew = remainingImages[0];

      if (fallbackNew) {
        setExistingImages((images) =>
          images.map((item) => ({
            ...item,
            is_primary: false,
          })),
        );

        setNewImages(
          remainingImages.map((item) => ({
            ...item,
            isPrimary: item.id === fallbackNew.id,
          })),
        );

        return;
      }

      const fallbackExisting = activeExistingImages[0];

      if (fallbackExisting) {
        setExistingImagePrimary(fallbackExisting.id);
        setNewImages(remainingImages);
        return;
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

      formData.append(PRODUCT_FORM_FIELDS.NAME, name);
      formData.append(PRODUCT_FORM_FIELDS.SKU, sku);
      formData.append(PRODUCT_FORM_FIELDS.CATEGORY, form.category);
      formData.append(PRODUCT_FORM_FIELDS.PRICE, String(price));
      formData.append(PRODUCT_FORM_FIELDS.STOCK, String(stock));
      formData.append(PRODUCT_FORM_FIELDS.STATUS, form.status);
      formData.append(PRODUCT_FORM_FIELDS.DESCRIPTION, description);

      formData.append(
        PRODUCT_FORM_FIELDS.REMOVED_IMAGE_IDS,
        JSON.stringify([...removedImageIds]),
      );

      const primaryNewImage = getPrimaryNewImage(newImages);

      const orderedNewImages = primaryNewImage
        ? [
            primaryNewImage,
            ...newImages.filter((image) => image.id !== primaryNewImage.id),
          ]
        : newImages;

      for (const image of orderedNewImages) {
        formData.append(PRODUCT_FORM_FIELDS.IMAGES, image.file);
      }

      if (primaryExistingImage) {
        formData.append(
          PRODUCT_FORM_FIELDS.PRIMARY_IMAGE_ID,
          primaryExistingImage.id,
        );
      }

      const updated = await updateProduct(product.id, formData);
      toast.success("Product updated successfully");
      revokeImageUrls(newImages);
      setNewImages([]);

      onOpenChange(false);
      onUpdated?.(updated);
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!product || !form) {
    return null;
  }

  return (
    <>
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="gap-0 p-0 sm:max-w-xl!">
          <SheetHeader className="flex flex-row items-center gap-3 border-b px-5 py-4">
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-[15px] font-semibold">
                {product.name}
              </SheetTitle>
            </div>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="contents" noValidate>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
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

                <FieldError message={errors.name} />
              </div>

              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
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

                  <FieldError message={errors.sku} />
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
                      {productCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FieldError message={errors.category} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                    onChange={(event) =>
                      updateField("price", event.target.value)
                    }
                    aria-invalid={Boolean(errors.price)}
                    className={`h-10 font-mono focus-visible:ring-primary/20 ${
                      errors.price
                        ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                        : "focus-visible:border-primary"
                    }`}
                  />

                  <FieldError message={errors.price} />
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
                    onChange={(event) =>
                      updateField("stock", event.target.value)
                    }
                    aria-invalid={Boolean(errors.stock)}
                    className={`h-10 font-mono focus-visible:ring-primary/20 ${
                      errors.stock
                        ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                        : ""
                    }`}
                  />

                  <FieldError message={errors.stock} />
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

                  <FieldError />
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label className="gap-1 text-[12px] font-medium">
                    Images
                    <span className="text-[11px] font-bold">
                      (Only JPG, PNG, and WEBP image formats are allowed.)
                    </span>
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    {activeImageCount}/{MAX_IMAGES}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {activeExistingImages.map((image) => (
                    <div
                      key={image.id}
                      className={`relative aspect-square overflow-hidden rounded-md border ${
                        image.is_primary
                          ? "border-2 border-primary"
                          : "border-border"
                      }`}
                    >
                      <ProductImagePreview
                        src={image.url}
                        alt={`${product.name} image`}
                        className="h-full w-full"
                      />

                      <button
                        type="button"
                        onClick={() => toggleRemoveExistingImage(image.id)}
                        aria-label={`Remove ${product.name} image`}
                        className="absolute right-1.5 top-1.5 z-20 flex size-4 items-center justify-center rounded-full border bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-background hover:text-destructive"
                      >
                        <X className="size-2" />
                      </button>

                      <ImageOverlayControls
                        isPrimary={image.is_primary}
                        onSetPrimary={() => setExistingImagePrimary(image.id)}
                      />
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
                        aria-label="Restore image"
                        className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                      >
                        <RotateCcw className="size-3" />
                      </button>
                    </div>
                  ))}
                  {newImages.map((image) => (
                    <div
                      key={image.id}
                      className={`relative aspect-square overflow-hidden rounded-md border ${
                        image.isPrimary
                          ? "border-2 border-primary"
                          : "border-border"
                      }`}
                    >
                      <ProductImagePreview
                        src={image.previewUrl}
                        alt={image.file.name}
                        className="h-full w-full"
                      />

                      <button
                        type="button"
                        onClick={() => removeNewImage(image.id)}
                        aria-label={`Remove ${image.file.name}`}
                        className="absolute right-1.5 top-1.5 z-20 flex size-4 items-center justify-center rounded-full border bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-background hover:text-destructive"
                      >
                        <X className="size-2" />
                      </button>

                      {image.isPrimary ? (
                        <span className="absolute bottom-1.5! left-1.5! z-20 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground shadow-sm">
                          Primary
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setNewImagePrimary(image.id)}
                          className="absolute bottom-1.5! left-1.5! z-20 rounded-full border bg-background/90 px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-background hover:text-foreground"
                        >
                          Set primary
                        </button>
                      )}
                    </div>
                  ))}
                  {remainingSlots > 0 && (
                    <label
                      htmlFor="edit-product-images"
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border border-dashed transition-colors ${
                        isDragging
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      } ${
                        isSubmitting ? "pointer-events-none opacity-60" : ""
                      }`}
                    >
                      <span className="text-2xl font-light leading-none">
                        +
                      </span>

                      <span className="mt-1 px-2 text-center text-[10px] font-medium">
                        {isDragging ? "Drop images here" : "Add images"}
                      </span>

                      <span className="mt-0.5 px-2 text-center text-[9px] text-muted-foreground">
                        {remainingSlots}{" "}
                        {remainingSlots === 1 ? "slot" : "slots"} left
                      </span>
                    </label>
                  )}
                  <Input
                    id="edit-product-images"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleNewImageChange}
                    disabled={isSubmitting || remainingSlots <= 0}
                    className="hidden"
                  />
                </div>
                {imageError && <ImageErrorBanner error={imageError} />}
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
                  className="h-20 resize-none leading-relaxed focus-visible:border-primary focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex h-16 shrink-0 items-center gap-2 border-t px-5">
              <div className="flex-1" />
              <Button
                type="button"
                variant="secondary"
                className="h-9 px-3.5 text-[13px] font-medium"
                onClick={() => handleSheetOpenChange(false)}
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
      <UnsavedChangesDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        onKeepEditing={handleKeepEditing}
        onDiscard={handleDiscardAndClose}
      />
    </>
  );
}
