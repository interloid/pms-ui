import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductImagePreview } from "../products/preview-image/product-image-preview";
import { UnsavedChangesDialog } from "@/components/shad/unsaved-changes-dialog";
import {
  productCategories,
  statuses,
  type ApiProduct,
  type ApiProductImage,
  type FormError,
  type ImageError,
  type ProductCategory,
  type ProductForm as ProductFormData,
  type ProductFormProps,
  type ProductImage,
  type ProductStatus,
} from "@/types/data-type";

import { createProduct, updateProduct } from "@/services/product-service";

import { revokeImageUrls } from "@/lib/utils";
import { getUserFriendlyErrorMessage } from "@/lib/error-messsege";
import { formatDateTime, getStatusClassName } from "@/lib/converters";

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const FORM_DATA_FIELDS = {
  images: "images",
  removedImageIds: "removed_image_ids",
  primaryImageId: "primary_image_id",
  primaryNewImageIndex: "primary_new_image_index",
} as const;

function getInitialForm(product?: ApiProduct | null): ProductFormData {
  if (!product) {
    return {
      name: "",
      sku: "",
      category: "",
      price: "",
      stock: "0",
      status: "draft",
      description: "",
    };
  }

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

function FieldError({ message }: { message?: string }) {
  return (
    <p
      className="h-4 text-xs leading-4 font-medium text-destructive"
      aria-live="polite"
    >
      {message || "\u00A0"}
    </p>
  );
}

function getStatusLabel(status: ProductStatus) {
  return statuses.find((item) => item.value === status)?.label ?? status;
}

export function ProductForm({
  mode,
  product,
  open,
  onEdit,
  onOpenChange,
  onProductCreated,
  onProductUpdated,
  trigger,
}: ProductFormProps) {
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isAddMode = mode === "add";

  const [form, setForm] = useState<ProductFormData>(() =>
    getInitialForm(product),
  );

  const [errors, setErrors] = useState<FormError>({});

  const [existingImages, setExistingImages] = useState<ApiProductImage[]>(
    product?.images ?? [],
  );

  const [newImages, setNewImages] = useState<ProductImage[]>([]);

  const [removedImageIds, setRemovedImageIds] = useState<Set<string>>(
    new Set(),
  );

  const [imageError, setImageError] = useState<ImageError | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

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
    () => activeExistingImages.find((image) => image.is_primary),
    [activeExistingImages],
  );

  const primaryNewImage = useMemo(
    () => newImages.find((image) => image.isPrimary),
    [newImages],
  );

  const currentPrimaryNewImageIndex = primaryNewImage
    ? newImages.findIndex((image) => image.id === primaryNewImage.id)
    : -1;

  const isDirty = useMemo(() => {
    if (isViewMode) {
      return false;
    }

    const initial = getInitialForm(product);

    const formChanged =
      form.name !== initial.name ||
      form.sku !== initial.sku ||
      form.category !== initial.category ||
      form.price !== initial.price ||
      form.stock !== initial.stock ||
      form.status !== initial.status ||
      form.description !== initial.description;

    const imagesChanged = removedImageIds.size > 0 || newImages.length > 0;

    const originalPrimaryId =
      product?.images?.find((image) => image.is_primary)?.id ?? null;

    const currentPrimaryExistingId = primaryExistingImage?.id ?? null;
    const primaryChanged =
      currentPrimaryExistingId !== originalPrimaryId ||
      currentPrimaryNewImageIndex >= 0;

    return formChanged || imagesChanged || primaryChanged;
  }, [
    form,
    removedImageIds,
    newImages,
    primaryExistingImage,
    currentPrimaryNewImageIndex,
    product,
    isViewMode,
  ]);

  function updateField<K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K],
  ) {
    if (isViewMode) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  }

  function validateForm(): boolean {
    if (isViewMode) {
      return true;
    }

    const nextErrors: FormError = {};

    if (!form.name.trim()) {
      nextErrors.name = "This name is required.";
    }

    if (!form.sku.trim()) {
      nextErrors.sku = "This SKU is required.";
    }

    if (!form.category) {
      nextErrors.category = "This category is required.";
    }

    if (!form.price.trim()) {
      nextErrors.price = "This price is required.";
    } else if (!Number.isFinite(Number(form.price))) {
      nextErrors.price = "Please enter a valid price.";
    } else if (Number(form.price) < 0) {
      nextErrors.price = "Price cannot be negative.";
    }

    if (!form.stock.trim()) {
      nextErrors.stock = "This stock is required.";
    } else if (!Number.isFinite(Number(form.stock))) {
      nextErrors.stock = "Please enter a valid stock.";
    } else if (Number(form.stock) < 0) {
      nextErrors.stock = "Stock cannot be negative.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function isDuplicateFile(file: File) {
    return [...newImages].some(
      (image) =>
        image.file.name === file.name &&
        image.file.size === file.size &&
        image.file.lastModified === file.lastModified,
    );
  }

  function processFiles(fileList: FileList | File[]) {
    if (isViewMode) {
      return;
    }

    const files = Array.from(fileList);

    if (files.length === 0) {
      return;}

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

      if (isDuplicateFile(file)) {
        firstError ??= {
          fileName: file.name,
          message: "has already been selected.",
        };

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

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    processFiles(event.target.files ?? []);

    event.target.value = "";
  }

  function handleDragEnter(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isViewMode || isSubmitting || remainingSlots <= 0) {
      return;
    }

    setIsDragging(true);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isViewMode || isSubmitting || remainingSlots <= 0) {
      return;
    }

    event.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    if (isViewMode || isSubmitting || remainingSlots <= 0) {
      return;
    }

    processFiles(event.dataTransfer.files);
  }

  function setExistingImagePrimary(id: string) {
    if (isViewMode) {
      return;
    }

    const exists = activeExistingImages.some((image) => image.id === id);

    if (!exists) {
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
    if (isViewMode) {
      return;
    }

    const exists = newImages.some((image) => image.id === id);

    if (!exists) {
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
    if (isViewMode) {
      return;
    }

    const image = existingImages.find((item) => item.id === id);

    if (!image) {
      return;
    }

    const nextRemovedIds = new Set(removedImageIds);

    const isRemoving = !nextRemovedIds.has(id);

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

  function removeNewImage(id: string) {
    if (isViewMode) {
      return;
    }

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
      }
    }

    setNewImages(remainingImages);
  }

  function resetForm() {
    revokeImageUrls(newImages);

    const initialForm = getInitialForm(product);

    setForm(initialForm);
    setErrors({});
    setExistingImages(product?.images ?? []);
    setNewImages([]);
    setRemovedImageIds(new Set());
    setImageError(null);
    setIsDragging(false);
  }

  function handleSheetChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }

    if (isViewMode) {
      onOpenChange(nextOpen);
      return;
    }

    if (nextOpen) {
      onOpenChange(true);
      return;
    }

    if (!isDirty) {
      resetForm();
      onOpenChange(false);
      return;
    }

    setShowDiscardDialog(true);
  }

  function handleDiscardAndClose() {
    resetForm();
    setShowDiscardDialog(false);
    onOpenChange(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isViewMode) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (isEditMode && !product) {
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

      if (isAddMode) {
        newImages.forEach((image) => {
          formData.append(FORM_DATA_FIELDS.images, image.file);
        });

        const createdProduct = await createProduct(formData);
        toast.success("Product created successfully");

        resetForm();
        onOpenChange(false);

        onProductCreated?.(createdProduct);

        return;
      }

      if (isEditMode && product) {
        if (removedImageIds.size > 0) {
          formData.append(
            FORM_DATA_FIELDS.removedImageIds,
            JSON.stringify(Array.from(removedImageIds)),
          );
        }

        newImages.forEach((image) => {
          formData.append(FORM_DATA_FIELDS.images, image.file);
        });

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

        const updatedProduct = await updateProduct(product.id, formData);

        toast.success("Product updated successfully");

        revokeImageUrls(newImages);
        setNewImages([]);

        onOpenChange(false);

        onProductUpdated?.(updatedProduct);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";

      if (message.includes("sku")) {
        setErrors((previous) => ({
          ...previous,
          sku: "This SKU already exists.",
        }));

        return;
      }

      toast.error(
        getUserFriendlyErrorMessage(
          error,
          isAddMode
            ? "Unable to create the product."
            : "Unable to update the product due to Image Duplication",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const primaryViewImage =
    product?.images?.find((image) => image.is_primary) ?? product?.images?.[0];

  const sheetTrigger =
    isAddMode && trigger ? (
      <SheetTrigger asChild>{trigger}</SheetTrigger>
    ) : null;

  return (
    <>
      <Sheet open={open} onOpenChange={handleSheetChange}>
        {sheetTrigger}
        <SheetContent
          className="gap-0 p-0 sm:max-w-xl! animate-none!"
        >
          <SheetHeader className="border-b px-5 py-4">
            <SheetTitle className="text-[15px] font-semibold">
              {isAddMode ? "Add Product" : (product?.name ?? "Product")}
            </SheetTitle>
            {isViewMode && product && (
              <p className="font-mono text-xs text-muted-foreground">
                {product.sku}
              </p>
            )}
          </SheetHeader>
          {isViewMode && product ? (
            <>
              <div className="flex-1 overflow-y-auto p-5">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <div className="aspect-16/10 overflow-hidden rounded-lg border bg-muted">
                      {primaryViewImage?.url ? (
                        <ProductImagePreview
                          src={primaryViewImage.url}
                          alt={product.name}
                          className="h-full w-full"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            No image available
                          </span>
                        </div>
                      )}
                    </div>
                    {product.images?.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {product.images.map((image) => (
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

                            {image.is_primary && (
                              <span className="absolute bottom-1 left-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                                Primary
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-3 text-[13px]">
                    <span className="text-muted-foreground">SKU</span>
                    <span className="font-mono text-xs">{product.sku}</span>

                    <span className="text-muted-foreground">Category</span>
                    <span>{product.category_name}</span>

                    <span className="text-muted-foreground">Price</span>
                    <span className="font-mono text-xs">
                      ${Number(product.price).toFixed(2)}
                    </span>

                    <span className="text-muted-foreground">Stock</span>
                    <span className="font-mono text-xs">{product.stock}</span>

                    <span className="text-muted-foreground">Status</span>
                    <span
                      className={`w-fit rounded-md border px-2 py-1 text-xs ${getStatusClassName(
                        product.status,
                      )}`}
                    >
                      {getStatusLabel(product.status)}
                    </span>
                    <span className="text-muted-foreground">Description</span>
                    <span className="leading-relaxed">
                      {product.description || "No description available."}
                    </span>
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-muted-foreground">
                      {formatDateTime(product.created_at || "—")}
                    </span>

                    <span className="text-muted-foreground">Updated</span>
                    <span className="text-muted-foreground">
                      {formatDateTime(product.updated_at || "—")}
                    </span>
                  </div>
                </div>
              </div>
              <SheetFooter className="border-t px-5 py-3">
                <div className="flex w-full flex-row justify-end gap-2">
                  <Button
                    onClick={() => {
                      onOpenChange(false);
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      if (product) {
                        onEdit?.(product);
                      }
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </SheetFooter>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="contents" noValidate>
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
                <div className="grid gap-1.5">
                  <Label htmlFor={`${mode}-product-name`} className="text-xs">
                    Product Name <span className="text-destructive">*</span>
                  </Label>

                  <Input
                    id={`${mode}-product-name`}
                    placeholder="e.g. Meridian Desk Lamp"
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    aria-invalid={Boolean(errors.name)}
                    className={
                      errors.name
                        ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                        : "focus-visible:border-primary"
                    }
                  />
                  <FieldError message={errors.name} />
                </div>
                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor={`${mode}-product-sku`} className="text-xs">
                      SKU <span className="text-destructive">*</span>
                    </Label>

                    <Input
                      id={`${mode}-product-sku`}
                      placeholder="ABC-ITEM-000"
                      value={form.sku}
                      onChange={(event) =>
                        updateField("sku", event.target.value)
                      }
                      aria-invalid={Boolean(errors.sku)}
                    />

                    <FieldError message={errors.sku} />
                  </div>

                  <div className="grid gap-1.5">
                    <Label
                      htmlFor={`${mode}-product-category`}
                      className="text-xs"
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
                        id={`${mode}-product-category`}
                        className="h-10 w-full"
                      >
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>

                      <SelectContent
                        position="popper"
                        side="bottom"
                        align="start"
                        avoidCollisions={false}
                      >
                        {productCategories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
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
                      htmlFor={`${mode}-product-price`}
                      className="text-xs"
                    >
                      Price <span className="text-destructive">*</span>
                    </Label>

                    <Input
                      id={`${mode}-product-price`}
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        updateField("price", event.target.value)
                      }
                    />
                    <FieldError message={errors.price} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor={`${mode}-product-stock`}
                      className="text-xs"
                    >
                      Stock
                    </Label>
                    <Input
                      id={`${mode}-product-stock`}
                      type="number"
                      min={0}
                      step="1"
                      value={form.stock}
                      onChange={(event) =>
                        updateField("stock", event.target.value)
                      }
                    />
                    <FieldError message={errors.stock} />
                  </div>

                  <div className="grid gap-1.5">
                    <Label
                      htmlFor={`${mode}-product-status`}
                      className="text-xs"
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
                        id={`${mode}-product-status`}
                        className="h-10 w-full"
                      >
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
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
                <div className="grid gap-1.5">
                  <Label
                    htmlFor={`${mode}-product-description`}
                    className="text-xs"
                  >
                    Description
                  </Label>

                  <Textarea
                    id={`${mode}-product-description`}
                    placeholder="Optional"
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    className="min-h-24 resize-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs gap-0">
                    Images
                    {isEditMode && (
                      <span className="ml-1 font-medium  text-cancel-button-background">
                        ( jpeg, png, webp files were only allowed )
                      </span>
                    )}
                  </Label>
                  {isAddMode && (
                    <>
                      {newImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
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
                                className="absolute right-1 top-1 z-20 flex size-5 items-center justify-center rounded-full border bg-background/90 shadow-sm hover:text-destructive"
                                aria-label={`Remove ${image.file.name}`}
                              >
                                <X className="size-3" />
                              </button>

                              {image.isPrimary ? (
                                <span className="absolute bottom-1 left-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                                  Primary
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setNewImagePrimary(image.id)}
                                  className="absolute bottom-1 left-1 rounded-full border bg-background/90 px-2 py-0.5 text-[10px]"
                                >
                                  Set primary
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <label
                        htmlFor={`${mode}-product-images`}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-5 py-7 text-center transition-colors ${
                          isDragging
                            ? "border-primary bg-accent"
                            : "border-border bg-background hover:border-primary hover:bg-accent/50"
                        } ${
                          isSubmitting || remainingSlots <= 0
                            ? "pointer-events-none cursor-not-allowed opacity-50"
                            : ""
                        }`}
                      >
                        <span className="text-[13px] font-medium">
                          {isDragging
                            ? "Drop images here"
                            : "Drop images here, or click to browse"}
                        </span>
                        <span className="text-xs font-normal text-foreground">
                          JPG, PNG or WEBP · up to 5 MB each · max 6 images
                        </span>
                      </label>
                      <Input
                        id={`${mode}-product-images`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImageChange}
                        disabled={isSubmitting || remainingSlots <= 0}
                        className="hidden"
                      />
                    </>
                  )}
                  {isEditMode && (
                    <>
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
                              alt={product?.name ?? "Product image"}
                              className="h-full w-full"
                            />
                            {image.is_primary && (
                              <span className="absolute bottom-1 left-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                                Primary
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                toggleRemoveExistingImage(image.id)
                              }
                              className="absolute right-1 top-1 z-20 flex size-5 items-center justify-center rounded-full border bg-background/90 shadow-sm hover:text-destructive"
                              aria-label={`Remove ${image.id}`}
                            >
                              <X className="size-3" />
                            </button>
                            {!image.is_primary && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExistingImagePrimary(image.id)
                                }
                                className="absolute bottom-1 left-1 rounded-full border bg-background/90 px-2 py-0.5 text-[10px]"
                              >
                                Set primary
                              </button>
                            )}
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
                              className="absolute right-1 top-1 z-20 flex size-5 items-center justify-center rounded-full border bg-background/90 shadow-sm hover:text-destructive"
                              aria-label={`Remove ${image.file.name}`}
                            >
                              <X className="size-3" />
                            </button>

                            {image.isPrimary ? (
                              <span className="absolute bottom-1 left-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                                Primary
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setNewImagePrimary(image.id)}
                                className="absolute bottom-1 left-1 rounded-full border bg-background/90 px-2 py-0.5 text-[10px]"
                              >
                                Set primary
                              </button>
                            )}
                          </div>
                        ))}
                        {removedExistingImages.map((image) => (
                          <div
                            key={`removed-${image.id}`}
                            className="relative flex aspect-square items-center justify-center rounded-md border border-dashed border-destructive bg-destructive/5 p-2 text-center"
                          >
                            <span className="text-[10px] font-medium text-destructive">
                              Removed on save
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                toggleRemoveExistingImage(image.id)
                              }
                              className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full border bg-background/90 shadow-sm"
                              aria-label="Restore image"
                            >
                              <RotateCcw className="size-3" />
                            </button>
                          </div>
                        ))}
                        {remainingSlots > 0 && (
                          <label
                            htmlFor={`${mode}-product-images`}
                            className={`flex aspect-square cursor-pointer items-center justify-center rounded-md border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:bg-accent ${
                              isSubmitting
                                ? "pointer-events-none cursor-not-allowed opacity-50"
                                : ""
                            }`}
                            aria-label="Add images"
                          >
                            <span className="text-2xl font-light leading-none">
                              +
                            </span>
                          </label>
                        )}
                      </div>
                      <Input
                        id={`${mode}-product-images`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImageChange}
                        disabled={isSubmitting || remainingSlots <= 0}
                        className="hidden"
                      />
                    </>
                  )}
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
              </div>
              <SheetFooter className="h-16 shrink-0 border-t px-5">
                <div className="flex w-full flex-row-reverse gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Spinner />
                        Saving...
                      </>
                    ) : isAddMode ? (
                      "Save product"
                    ) : (
                      "Save changes"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => handleSheetChange(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>

      {!isViewMode && (
        <UnsavedChangesDialog
          open={showDiscardDialog}
          onOpenChange={setShowDiscardDialog}
          onKeepEditing={() => setShowDiscardDialog(false)}
          onDiscard={handleDiscardAndClose}
        />
      )}
    </>
  );
}
