import {
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Spinner } from "@/components/ui/spinner";
import {
  productCategories,
  statuses,
  type AddProductsProps,
  type FormError,
  type ImageError,
  type ProductForm,
  type ProductImage,
} from "@/types/data-type";
import { createProduct } from "@/services/product-service";
import { ProductImagePreview } from "../preview-image/product-image-preview";
import { UnsavedChangesDialog } from "@/components/shad/unsaved-changes-dialog";
import { FieldError } from "@/components/shad/field-error";
import {
  isDuplicateFile,
  MAX_IMAGES,
  validateImage,
} from "./components/product-constants";
import { revokeImageUrls } from "@/lib/utils";
import { getUserFriendlyErrorMessage } from "@/lib/error-messsege";
import { ImageErrorBanner } from "./components/image-error-banner";
import { ImageOverlayControls } from "./components/image-overlay-controls";
import { validateProductFields } from "./components/product-validation";
import { PRODUCT_FORM_FIELDS } from "./components/product-form-fields";

interface ImageDropzoneProps {
  isSubmitting: boolean;
  isAtLimit: boolean;
  isDragging: boolean;
  onDragEnter: (event: DragEvent<HTMLLabelElement>) => void;
  onDragOver: (event: DragEvent<HTMLLabelElement>) => void;
  onDragLeave: (event: DragEvent<HTMLLabelElement>) => void;
  onDrop: (event: DragEvent<HTMLLabelElement>) => void;
  children: ReactNode;
}

function ImageDropzone({
  isSubmitting,
  isAtLimit,
  isDragging,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}: ImageDropzoneProps) {
  const disabled = isSubmitting || isAtLimit;
  return (
    <label
      htmlFor="product-images"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={[
        "flex min-h-25 w-full flex-col items-center justify-center",
        "gap-1 rounded-lg border border-dashed px-4 py-4",
        "text-center transition-colors",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        isDragging
          ? "border-primary bg-primary/10"
          : "border-hover-text hover:bg-primary-hover/50",
      ].join(" ")}
    >
      {children}
    </label>
  );
}

export function AddProducts({ onProductCreated }: AddProductsProps) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [status, setStatus] = useState("draft");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ProductImage[]>([]);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState<ImageError | null>(null);
  const [errors, setErrors] = useState<FormError>({});
  const [isDragging, setIsDragging] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const remainingImages = MAX_IMAGES - images.length;

  const isDirty =
    name.trim() !== "" ||
    sku.trim() !== "" ||
    category !== "" ||
    price.trim() !== "" ||
    stock !== "0" ||
    status !== "draft" ||
    description.trim() !== "" ||
    images.length > 0;

  function resetForm() {
    revokeImageUrls(images);

    setName("");
    setSku("");
    setCategory("");
    setPrice("");
    setStock("0");
    setStatus("draft");
    setDescription("");
    setImages([]);
    setImageError(null);
    setErrors({});
    setIsDragging(false);
  }

  function handleSheetChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }

    if (nextOpen) {
      setOpen(true);
      return;
    }

    if (!isDirty) {
      resetForm();
      setOpen(false);
      return;
    }

    setShowDiscardDialog(true);
  }

  function handleKeepEditing() {
    setShowDiscardDialog(false);
  }

  function handleDiscardAndClose() {
    resetForm();
    setShowDiscardDialog(false);
    setOpen(false);
  }

  const validateForm = () => {
    const errors = validateProductFields({
      name,
      sku,
      category: category as ProductForm["category"],
      price,
      stock,
      status: status as ProductForm["status"],
      description,
    });

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append(PRODUCT_FORM_FIELDS.NAME, name);
      formData.append(PRODUCT_FORM_FIELDS.SKU, sku);
      formData.append(PRODUCT_FORM_FIELDS.CATEGORY, category);
      formData.append(PRODUCT_FORM_FIELDS.PRICE, price);
      formData.append(PRODUCT_FORM_FIELDS.STOCK, stock);
      formData.append(PRODUCT_FORM_FIELDS.STATUS, status);
      formData.append(PRODUCT_FORM_FIELDS.DESCRIPTION, description.trim());

      images.forEach((image) => {
        formData.append(PRODUCT_FORM_FIELDS.IMAGES, image.file);
      });

      await createProduct(formData);

      toast.success("Product created successfully");

      resetForm();
      setOpen(false);

      onProductCreated?.();
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code?: string }).code === "SKU_TAKEN"
      ) {
        setErrors((prev) => ({
          ...prev,
          sku: "This SKU already exists.",
        }));
        return;
      }

      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function processFiles(fileList: FileList | File[]) {
    const selectedFiles = Array.from(fileList);

    if (selectedFiles.length === 0) {
      return;
    }

    setImageError(null);

    if (images.length >= MAX_IMAGES) {
      setImageError({
        message: `You can upload a maximum of ${MAX_IMAGES} images.`,
      });

      return;
    }

    const remainingSlots = MAX_IMAGES - images.length;

    let error: ImageError | null = null;

    if (selectedFiles.length > remainingSlots) {
      error = {
        message: `You can only add ${remainingSlots} more image${
          remainingSlots === 1 ? "" : "s"
        }.`,
      };
    }

    const filesToProcess = selectedFiles.slice(0, remainingSlots);
    const newImages: ProductImage[] = [];

    for (const file of filesToProcess) {
      const imageError = validateImage(file);

      if (imageError) {
        setImageError(imageError);
        return;
      }

      if (isDuplicateFile(file, [...images, ...newImages])) {
        error = {
          fileName: file.name,
          message: "has already been selected.",
        };

        continue;
      }

      newImages.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        isPrimary: images.length === 0 && newImages.length === 0,
      });
    }

    if (newImages.length > 0) {
      setImages((previousImages) => [...previousImages, ...newImages]);
    }

    setImageError(error);
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    processFiles(event.target.files ?? []);
    event.target.value = "";
  }

  function handleDragEnter(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isSubmitting || images.length >= MAX_IMAGES) {
      return;
    }

    setIsDragging(true);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isSubmitting || images.length >= MAX_IMAGES) {
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

    if (isSubmitting || images.length >= MAX_IMAGES) {
      return;
    }

    processFiles(event.dataTransfer.files);
  }

  function removeImage(id: string) {
    setImages((previousImages) => {
      const imageToRemove = previousImages.find((image) => image.id === id);

      if (!imageToRemove) {
        return previousImages;
      }

      URL.revokeObjectURL(imageToRemove.previewUrl);

      const remainingImages = previousImages.filter((image) => image.id !== id);

      if (imageToRemove.isPrimary && remainingImages.length > 0) {
        remainingImages[0] = {
          ...remainingImages[0],
          isPrimary: true,
        };
      }

      return remainingImages;
    });
  }

  function setPrimaryImage(id: string) {
    setImages((previousImages) =>
      previousImages.map((image) => ({
        ...image,
        isPrimary: image.id === id,
      })),
    );
  }

  return (
    <>
      <Sheet open={open} onOpenChange={handleSheetChange}>
        <SheetTrigger asChild>
          <Button
            type="button"
            className="cursor-pointer whitespace-nowrap px-2.5 sm:px-4"
          >
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </SheetTrigger>

        <SheetContent className="gap-8 sm:max-w-xl!">
          <SheetHeader className="border-b">
            <SheetTitle className="font-bold">Add Product</SheetTitle>
          </SheetHeader>

          <form
            id="add-product-form"
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
            noValidate
          >
            <div className="grid flex-1 auto-rows-min gap-4 overflow-y-auto px-4">
              <div className="grid gap-3">
                <Label htmlFor="product-name" className="text-xs">
                  Product Name
                  <span className="text-destructive"> *</span>
                </Label>

                <Input
                  id="product-name"
                  placeholder="e.g. Meridian Desk Lamp"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);

                    if (errors.name) {
                      setErrors((previous) => ({
                        ...previous,
                        name: undefined,
                      }));
                    }
                  }}
                  aria-invalid={Boolean(errors.name)}
                  className={`h-10 w-full placeholder:text-xs focus-visible:ring-primary/20 ${
                    errors.name
                      ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                      : "focus-visible:border-primary"
                  }`}
                />

                <FieldError message={errors.name} />
              </div>

              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid w-full gap-2">
                  <Label htmlFor="product-sku" className="text-xs">
                    SKU
                    <span className="text-destructive"> *</span>
                  </Label>

                  <Input
                    id="product-sku"
                    placeholder="ABC-ITEM-000"
                    value={sku}
                    onChange={(event) => {
                      setSku(event.target.value);

                      if (errors.sku) {
                        setErrors((previous) => ({
                          ...previous,
                          sku: undefined,
                        }));
                      }
                    }}
                    aria-invalid={Boolean(errors.sku)}
                    className={`h-10 w-full placeholder:text-xs focus-visible:ring-primary/20 ${
                      errors.sku
                        ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                        : "focus-visible:border-primary"
                    }`}
                  />

                  <FieldError message={errors.sku} />
                </div>

                <div className="grid w-full gap-2">
                  <Label htmlFor="product-category" className="text-xs">
                    Category
                    <span className="text-destructive"> *</span>
                  </Label>

                  <Select
                    value={category}
                    onValueChange={(value) => {
                      setCategory(value);

                      if (errors.category) {
                        setErrors((previous) => ({
                          ...previous,
                          category: undefined,
                        }));
                      }
                    }}
                  >
                    <SelectTrigger
                      id="product-category"
                      aria-invalid={Boolean(errors.category)}
                      className={`h-10 w-full focus-visible:ring-primary/20 ${
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
                      {productCategories.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FieldError message={errors.category} />
                </div>
              </div>

              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="grid w-full gap-2">
                  <Label htmlFor="product-price" className="text-xs">
                    Price
                    <span className="text-destructive"> *</span>
                  </Label>

                  <Input
                    id="product-price"
                    type="number"
                    value={price}
                    onChange={(event) => {
                      setPrice(event.target.value);

                      if (errors.price) {
                        setErrors((previous) => ({
                          ...previous,
                          price: undefined,
                        }));
                      }
                    }}
                    placeholder="0.00"
                    min={0}
                    step="0.01"
                    aria-invalid={Boolean(errors.price)}
                    className={`h-10 w-full placeholder:text-xs focus-visible:ring-primary/20 ${
                      errors.price
                        ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                        : "focus-visible:border-primary"
                    }`}
                  />

                  <FieldError message={errors.price} />
                </div>

                <div className="grid w-full gap-2">
                  <Label htmlFor="product-stock" className="text-xs">
                    Stock
                  </Label>

                  <Input
                    id="product-stock"
                    type="number"
                    value={stock}
                    onChange={(event) => setStock(event.target.value)}
                    placeholder="0"
                    min={0}
                    className="h-10 w-full placeholder:text-xs focus-visible:border-primary focus-visible:ring-primary/20"
                  />

                  <FieldError message={errors.stock} />
                </div>

                <div className="grid w-full gap-2">
                  <Label htmlFor="product-status" className="text-xs">
                    Status
                  </Label>

                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger
                      id="product-status"
                      className="h-10 w-full focus-visible:border-primary focus-visible:ring-primary/20"
                    >
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>

                    <SelectContent
                      position="popper"
                      side="bottom"
                      align="start"
                      sideOffset={4}
                      avoidCollisions={false}
                      className="w-36"
                    >
                      {statuses.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FieldError />
                </div>
              </div>
              <div className="grid w-full gap-2">
                <Label htmlFor="product-description" className="text-xs">
                  Description
                </Label>
                <Textarea
                  id="product-description"
                  placeholder="Optional"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="h-25 min-h-25 w-full resize-none placeholder:text-xs focus-visible:border-primary focus-visible:ring-primary/20"
                />
              </div>

              <div className="grid w-full gap-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="product-images" className="text-xs">
                    Images
                  </Label>

                  <span className="text-xs text-muted-foreground">
                    {images.length} of {MAX_IMAGES}
                  </span>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="group relative overflow-hidden rounded-lg border bg-muted"
                      >
                        <ProductImagePreview
                          src={image.previewUrl}
                          alt={image.file.name}
                          className="aspect-square cursor-pointer transition-transform duration-200 group-hover:scale-[1.02]"
                        />

                        <ImageOverlayControls
                          isPrimary={image.isPrimary}
                          onSetPrimary={() => setPrimaryImage(image.id)}
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 z-10 size-5 rounded-full bg-background/90 text-muted-foreground shadow-sm backdrop-blur-sm hover:bg-background hover:text-destructive"
                          onClick={() => removeImage(image.id)}
                          aria-label={`Remove ${image.file.name}`}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length < MAX_IMAGES && (
                  <ImageDropzone
                    isSubmitting={isSubmitting}
                    isAtLimit={images.length >= MAX_IMAGES}
                    isDragging={isDragging}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <span
                      className={`text-xs font-medium ${
                        isDragging ? "text-primary" : "text-hover-text"
                      }`}
                    >
                      {isDragging
                        ? "Drop images here"
                        : images.length === 0
                          ? "Drop images here, or click to browse"
                          : "Drop more images or click to browse"}
                    </span>

                    <span className="text-[11px] text-muted-foreground">
                      Accepted formats:{" "}
                      <span className="font-medium text-foreground">
                        JPG, PNG, WEBP
                      </span>
                      {" · "}
                      Max size:{" "}
                      <span className="font-medium text-foreground">
                        5 MB per image
                      </span>
                      {" · "}
                      <span className="font-bold">{remainingImages}</span>{" "}
                      {remainingImages === 1 ? "slot" : "slots"} remaining
                    </span>
                  </ImageDropzone>
                )}

                {imageError && <ImageErrorBanner error={imageError} />}
                <Input
                  id="product-images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  disabled={isSubmitting || images.length >= MAX_IMAGES}
                  className="hidden"
                />
              </div>
            </div>
          </form>

          <SheetFooter className="w-full border-t">
            <div className="flex w-full flex-row-reverse justify-start gap-2">
              <Button
                type="submit"
                form="add-product-form"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Saving...
                  </>
                ) : (
                  "Save product"
                )}
              </Button>

              <Button
                variant="outline"
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSheetChange(false)}
              >
                Cancel
              </Button>
            </div>
          </SheetFooter>
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
