import { useState } from "react";
import { X } from "lucide-react";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { createProduct } from "@/services/product-service";
import {
  productCategories,
  statuses,
  type AddProductsProps,
  type FormError,
  type ProductCategory,
  type ProductForm,
  type ProductStatus,
} from "@/types/data-type";
import { getUserFriendlyErrorMessage } from "@/lib/error-messsege";
import { ProductImagePreview } from "../preview-image/product-image-preview";
import { UnsavedChangesDialog } from "@/components/shad/unsaved-changes-dialog";
import { FieldError } from "@/components/shad/field-error";
import { ImageErrorBanner } from "./components/image-error-banner";
import { validateProductFields } from "./components/product-validation";
import { PRODUCT_FORM_FIELDS } from "./components/product-form-fields";
import { MAX_IMAGES } from "./components/product-constants";
import { useProductImages } from "@/hooks/use-product-images";

const blankForm: ProductForm = {
  name: "",
  sku: "",
  category: "",
  price: "",
  stock: "",
  status: "active",
  description: "",
};

export default function AddProducts({ onProductCreated }: AddProductsProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(blankForm);
  const [errors, setErrors] = useState<FormError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const maxNewImages = MAX_IMAGES;
  const {
    images: newImages,
    imageError,
    isDragging,
    handleImageChange: handleNewImageChange,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeImage,
    setPrimaryImage,
    clearImages,
  } = useProductImages({
    maxImages: maxNewImages,
    isSubmitting,
    shouldAutoSetPrimary: () => true,
  });

  const totalImageCount = newImages.length;
  const remainingSlots = Math.max(MAX_IMAGES - totalImageCount, 0);

  const primaryNewImage = newImages.find((image) => image.isPrimary);

  const isDirty =
    form.name !== blankForm.name ||
    form.sku !== blankForm.sku ||
    form.category !== blankForm.category ||
    form.price !== blankForm.price ||
    form.stock !== blankForm.stock ||
    form.status !== blankForm.status ||
    form.description !== blankForm.description ||
    newImages.length > 0;

  function updateField<K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

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

  function validateForm() {
    const validationErrors = validateProductFields(form);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }

  function discardChanges() {
    clearImages();

    setForm(blankForm);
    setErrors({});
    setShowDiscardDialog(false);
  }

  function handleSheetOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setOpen(true);
      return;
    }

    if (!isDirty) {
      clearImages();
      setForm(blankForm);
      setErrors({});
      setOpen(false);
      return;
    }

    setShowDiscardDialog(true);
  }

  function handleKeepEditing() {
    setShowDiscardDialog(false);
  }

  function handleDiscardAndClose() {
    discardChanges();
    setOpen(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (totalImageCount > MAX_IMAGES) {
      toast.error(`You can have a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append(PRODUCT_FORM_FIELDS.NAME, form.name.trim());
      formData.append(PRODUCT_FORM_FIELDS.SKU, form.sku.trim());
      formData.append(PRODUCT_FORM_FIELDS.CATEGORY, form.category);
      formData.append(PRODUCT_FORM_FIELDS.PRICE, String(Number(form.price)));
      formData.append(PRODUCT_FORM_FIELDS.STOCK, String(Number(form.stock)));
      formData.append(PRODUCT_FORM_FIELDS.STATUS, form.status);
      formData.append(PRODUCT_FORM_FIELDS.DESCRIPTION, form.description.trim());
      formData.append(
        PRODUCT_FORM_FIELDS.REMOVED_IMAGE_IDS,
        JSON.stringify([]),
      );

      for (const image of newImages) {
        formData.append(PRODUCT_FORM_FIELDS.IMAGES, image.file);
      }

      if (primaryNewImage) {
        formData.append(
          PRODUCT_FORM_FIELDS.PRIMARY_IMAGE_ID,
          primaryNewImage.id,
        );
      }

      await createProduct(formData);

      toast.success("Product created successfully");

      clearImages();
      setForm(blankForm);
      setErrors({});
      setOpen(false);
      onProductCreated?.();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetTrigger asChild>
          <Button
            type="button"
            className="cursor-pointer whitespace-nowrap px-2.5 sm:px-4"
          >
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="gap-0 p-0 sm:max-w-xl!">
          <SheetHeader className="flex flex-row items-center gap-3 border-b px-5 py-4">
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-[15px] font-semibold">
                Add Product
              </SheetTitle>
            </div>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="contents" noValidate>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
              <div className="grid gap-1.5">
                <Label
                  htmlFor="add-product-name"
                  className="text-[12px] font-medium"
                >
                  Product Name <span className="text-destructive">*</span>
                </Label>

                <Input
                  id="add-product-name"
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
                    htmlFor="add-product-sku"
                    className="text-[12px] font-medium"
                  >
                    SKU <span className="text-destructive">*</span>
                  </Label>

                  <Input
                    id="add-product-sku"
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
                    htmlFor="add-product-category"
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
                      id="add-product-category"
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
                    htmlFor="add-product-price"
                    className="text-[12px] font-medium"
                  >
                    Price <span className="text-destructive">*</span>
                  </Label>

                  <Input
                    id="add-product-price"
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
                    htmlFor="add-product-stock"
                    className="text-[12px] font-medium"
                  >
                    Stock
                  </Label>

                  <Input
                    id="add-product-stock"
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
                    htmlFor="add-product-status"
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
                      id="add-product-status"
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
                    {totalImageCount}/{MAX_IMAGES}
                  </span>
                </div>

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
                        onClick={() => removeImage(image.id)}
                        aria-label={`Remove ${image.file.name}`}
                        className="absolute right-1.5 top-1.5 z-20 flex size-4 items-center justify-center rounded-full border bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-background hover:text-destructive"
                      >
                        <X className="size-2" />
                      </button>

                      {image.isPrimary ? (
                        <span className="absolute bottom-1.5 left-1.5 z-20 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground shadow-sm">
                          Primary
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(image.id)}
                          className="absolute bottom-1.5 left-1.5 z-20 rounded-full border bg-background/90 px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-background hover:text-foreground"
                        >
                          Set primary
                        </button>
                      )}
                    </div>
                  ))}

                  {remainingSlots > 0 && (
                    <label
                      htmlFor="add-product-images"
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
                    id="add-product-images"
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
                  htmlFor="add-product-description"
                  className="text-[12px] font-medium"
                >
                  Description
                </Label>

                <Textarea
                  id="add-product-description"
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
                  "Create product"
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
