import { useState, type ChangeEvent } from "react";
import { toast } from "sonner";
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
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  statuses,
  type AddProductsProps,
  type FormErrors,
  type ImageError,
  type ProductImage,
} from "@/types/data-type";
import { createProduct } from "@/services/product-service";
import { Spinner } from "@/components/ui/spinner";
import { Eye, X } from "lucide-react";
import { ImagePreviewDialog } from "../image-preview";

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const categories = [
  { value: "Lighting", label: "Lighting" },
  { value: "Apparel", label: "Apparel" },
  { value: "Home", label: "Home" },
  { value: "Electronics", label: "Electronics" },
  { value: "Outdoor", label: "Outdoor" },
  { value: "Stationery", label: "Stationery" },
];

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
  const [imageError, setImageError] = useState<ImageError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const remainingImages = MAX_IMAGES - images.length;
  const [errors, setErrors] = useState<FormErrors>({});
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  function resetForm() {
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
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!name.trim()) {
      newErrors.name = "This name is required.";
    }
    if (!sku.trim()) {
      newErrors.sku = "This sku is required.";
    }
    if (!category) {
      newErrors.category = "Please select a category.";
    }
    if (price.trim() === "") {
      newErrors.price = "This price is required.";
    }
    if (stock.trim() === "") {
      newErrors.stock = "This stock is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("sku", sku.trim());
      formData.append("category_name", category);
      formData.append("price", String(price));
      formData.append("stock", String(stock));
      formData.append("status", status);
      formData.append("description", description.trim());

      images.forEach((image) => {
        formData.append("images", image.file);
      });

      await createProduct(formData);
      toast.success("Product created successfully");
      resetForm();
      setOpen(false);
      onProductCreated?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create product",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    setImageError(null);
    const remainingSlots = MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      setImageError({
        message: `You can upload a maximum of ${MAX_IMAGES} images.`,
      });

      event.target.value = "";
      return;
    }

    let error: ImageError | null = null;

    if (selectedFiles.length > remainingSlots) {
      error = {
        message: `You can only add ${remainingSlots} more image${
          remainingSlots > 1 ? "s" : ""
        }.`,
      };
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    const newImages: ProductImage[] = [];

    for (const file of filesToAdd) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        error = {
          fileName: file.name,
          message: "is not supported. Please use JPG, PNG, or WEBP.",
        };
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        error = {
          fileName: file.name,
          message: "wasn't added",
          details: `${(file.size / 1024 / 1024).toFixed(
            1,
          )} MB exceeds the 5 MB limit.`,
        };
        continue;
      }

      const alreadyExists = images.some(
        (image) =>
          image.file.name === file.name &&
          image.file.size === file.size &&
          image.file.lastModified === file.lastModified,
      );

      if (alreadyExists) {
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
    event.target.value = "";
  };
  const removeImage = (id: string) => {
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
  };
  const setPrimaryImage = (id: string) => {
    setImages((previousImages) =>
      previousImages.map((image) => ({
        ...image,
        isPrimary: image.id === id,
      })),
    );
  };

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

  return (
    <>
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>+ Add Product</Button>
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
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
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

                <FieldError />
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

              {images.length === 0 && (
                <label
                  htmlFor="product-images"
                  className="flex min-h-25 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-hover-text bg-primary-hover px-4 py-4 text-center transition-colors hover:bg-primary-hover/50"
                >
                  <span className="text-xs font-bold text-hover-text">
                    Drop images here, or click to browse
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
                    {MAX_IMAGES} images remaining
                  </span>
                </label>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="relative overflow-hidden rounded-lg border bg-muted"
                    >
                      <img
                        src={image.previewUrl}
                        alt={image.file.name}
                        className="aspect-square w-full object-cover"
                        onClick={() =>
                          setPreviewImage({
                            src: image.previewUrl,
                            alt: image.file.name,
                          })
                        }
                      />
                      {image.isPrimary ? (
                        <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground shadow-sm">
                          Primary
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(image.id)}
                          className="absolute bottom-2 left-2 rounded-md bg-background/90 px-2 py-1 text-[10px] font-medium text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
                        >
                          Set primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewImage({
                            src: image.previewUrl,
                            alt: image.file.name,
                          })
                        }
                        aria-label={`Preview ${image.file.name}`}
                        className="absolute inset-0 m-auto flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity group-hover:opacity-100"
                      >
                        <Eye className="size-4" />
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 z-10 size-4 rounded-full bg-background/90 text-muted-foreground shadow-sm backdrop-blur-sm hover:bg-background hover:text-destructive"
                        onClick={() => removeImage(image.id)}
                        aria-label={`Remove ${image.file.name}`}
                      >
                        <X className="size-2" />
                      </Button>
                    </div>
                  ))}
                </div>
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
              {images.length > 0 && images.length < MAX_IMAGES && (
                <label
                  htmlFor="product-images"
                  className="flex min-h-25 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-hover-text px-4 py-4 text-center transition-colors hover:bg-primary-hover/50"
                >
                  <span className="text-xs font-medium text-hover-text">
                    Drop more images or click to browse
                  </span>

                  <span className="text-[11px] text-muted-foreground">
                    <span className="font-bold">{remainingImages} </span>{" "}
                    {remainingImages === 1 ? "slot" : "slots"} remaining
                    {" · "}
                    JPG, PNG, WEBP
                    {" · "}
                    Max 5 MB per image
                  </span>
                </label>
              )}
              <Input
                id="product-images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
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

            <SheetClose asChild>
              <Button variant="outline" type="button" disabled={isSubmitting}>
                Cancel
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
    <ImagePreviewDialog
  image={previewImage}
  open={Boolean(previewImage)}
  onOpenChange={(open) => {
    if (!open) {
      setPreviewImage(null);
    }
  }}
/>
</>
  );
}
