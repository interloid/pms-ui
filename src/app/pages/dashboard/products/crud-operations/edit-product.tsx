import { useState, useEffect, useRef, useCallback } from "react";
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
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { updateProduct } from "@/services/product-service";
import { Spinner } from "@/components/ui/spinner";
import type { ApiProduct, ApiProductImage, ProductEditProps, ProductImage } from "@/types/data-type";

const categories = [
  { value: "Lighting", label: "Lighting" },
  { value: "Apparel", label: "Apparel" },
  { value: "Home", label: "Home" },
  { value: "Electronics", label: "Electronics" },
  { value: "Outdoor", label: "Outdoor" },
  { value: "Stationery", label: "Stationery" },
];
const statuses = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "out of stock", label: "Out of Stock" },
  { value: "archived", label: "Archived" },
];

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function snapshot(p: ApiProduct) {
  return {
    name: p.name,
    sku: p.sku,
    category_name: p.category_name,
    price: String(p.price),
    stock: String(p.stock),
    status: p.status,
    description: p.description,
  };
}

export function ProductEdit({ product, open, onOpenChange, onUpdated }: ProductEditProps) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [status, setStatus] = useState("draft");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [existingImages, setExistingImages] = useState<ApiProductImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<Set<string>>(new Set());
  const [newImages, setNewImages] = useState<ProductImage[]>([]);
  const [imageError, setImageError] = useState<{ fileName?: string; message: string; details?: string } | null>(null);

  const originalRef = useRef<ReturnType<typeof snapshot> | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const checkDirty = useCallback(
    (n: string, s: string, c: string, pr: string, st: string, su: string, d: string, rm: Set<string>, ni: ProductImage[]) => {
      if (!originalRef.current) return false;
      const o = originalRef.current;
      const fieldsChanged =
        n !== o.name ||
        s !== o.sku ||
        c !== o.category_name ||
        pr !== o.price ||
        st !== o.status ||
        su !== o.stock ||
        d !== o.description;
      return fieldsChanged || rm.size > 0 || ni.length > 0;
    },
    [],
  );

  useEffect(() => {
    if (product && open) {
      setName(product.name);
      setSku(product.sku);
      setCategory(product.category_name);
      setPrice(String(product.price));
      setStock(String(product.stock));
      setStatus(product.status);
      setDescription(product.description);
      setExistingImages(product.images ?? []);
      setRemovedImageIds(new Set());
      setNewImages([]);
      setImageError(null);
      setIsDirty(false);
      originalRef.current = snapshot(product);
    }
  }, [product, open]);

  function markDirty(nextOverrides?: { removed?: Set<string>; added?: ProductImage[] }) {
    const rm = nextOverrides?.removed ?? removedImageIds;
    const ni = nextOverrides?.added ?? newImages;
    setIsDirty(checkDirty(name, sku, category, price, status, stock, description, rm, ni));
  }

  function discardChanges() {
    if (!product) return;
    setName(product.name);
    setSku(product.sku);
    setCategory(product.category_name);
    setPrice(String(product.price));
    setStock(String(product.stock));
    setStatus(product.status);
    setDescription(product.description);
    setExistingImages(product.images ?? []);
    setRemovedImageIds(new Set());
    newImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setNewImages([]);
    setImageError(null);
    setIsDirty(false);
    originalRef.current = snapshot(product);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;

    if (!name.trim() || !sku.trim() || !category || !price) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const updated = await updateProduct(product.id, {
        name: name.trim(),
        sku: sku.trim(),
        category_name: category,
        price: Number(price),
        stock: Number(stock),
        status,
        description: description.trim(),
        updated_at: new Date().toISOString(),
      });

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
      markDirty({ removed: next });
      return next;
    });
  }

  const handleNewImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) return;

    setImageError(null);
    const remainingSlots = MAX_IMAGES - existingImages.filter((img) => !removedImageIds.has(img.id)).length - newImages.length;

    if (remainingSlots <= 0) {
      setImageError({ message: `You can upload a maximum of ${MAX_IMAGES} images.` });
      event.target.value = "";
      return;
    }

    let error: typeof imageError = null;
    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    const added: ProductImage[] = [];

    for (const file of filesToAdd) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        error = { fileName: file.name, message: "is not supported. Please use JPG, PNG, or WEBP." };
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        error = {
          fileName: file.name,
          message: "wasn't added",
          details: `${(file.size / 1024 / 1024).toFixed(1)} MB exceeds the 5 MB limit.`,
        };
        continue;
      }

      added.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        isPrimary: existingImages.length === 0 && newImages.length === 0 && added.length === 0,
      });
    }

    if (added.length > 0) {
      const next = [...newImages, ...added];
      setNewImages(next);
      markDirty({ added: next });
    }
    setImageError(error);
    event.target.value = "";
  };

  function removeNewImage(id: string) {
    setNewImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);

      const remaining = prev.filter((i) => i.id !== id);
      if (img?.isPrimary && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isPrimary: true };
      }
      markDirty({ added: remaining });
      return remaining;
    });
  }

  function setNewImagePrimary(id: string) {
    setNewImages((prev) => {
      const next = prev.map((img) => ({ ...img, isPrimary: img.id === id }));
      markDirty({ added: next });
      return next;
    });
  }

  function setExistingImagePrimary(id: string) {
    setExistingImages((prev) => {
      const next = prev.map((img) => ({ ...img, is_primary: img.id === id }));
      return next;
    });
    markDirty();
  }

  const activeExisting = existingImages.filter((img) => !removedImageIds.has(img.id));
  const activeCount = activeExisting.length + newImages.length;
  const remainingSlots = MAX_IMAGES - activeCount;

  if (!product) return null;

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
            <span className="text-[12px] font-medium text-accent-foreground">Unsaved changes</span>
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
              <Label htmlFor="edit-product-name" className="text-[12px] font-medium">
                Product name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-product-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setIsDirty(checkDirty(e.target.value, sku, category, price, status, stock, description, removedImageIds, newImages));
                }}
                className="h-10 text-[13px] placeholder:text-xs focus-visible:border-primary focus-visible:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-product-sku" className="text-[12px] font-medium">
                  SKU <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-product-sku"
                  value={sku}
                  onChange={(e) => {
                    setSku(e.target.value);
                    setIsDirty(checkDirty(name, e.target.value, category, price, status, stock, description, removedImageIds, newImages));
                  }}
                  className="h-10 font-mono text-[12px] placeholder:text-xs focus-visible:border-primary focus-visible:ring-primary/20"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="edit-product-category" className="text-[12px] font-medium">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={category}
                  onValueChange={(v) => {
                    setCategory(v);
                    setIsDirty(checkDirty(name, sku, v, price, status, stock, description, removedImageIds, newImages));
                  }}
                >
                  <SelectTrigger id="edit-product-category" className="h-9 text-[13px]">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-product-price" className="text-[12px] font-medium">
                  Price <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-product-price"
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setIsDirty(checkDirty(name, sku, category, e.target.value, status, stock, description, removedImageIds, newImages));
                  }}
                  className="h-10 font-mono text-[12px] placeholder:text-xs focus-visible:border-primary focus-visible:ring-primary/20"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="edit-product-stock" className="text-[12px] font-medium">
                  Stock
                </Label>
                <Input
                  id="edit-product-stock"
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => {
                    setStock(e.target.value);
                    setIsDirty(checkDirty(name, sku, category, price, status, e.target.value, description, removedImageIds, newImages));
                  }}
                  className="h-10 font-mono text-[12px] placeholder:text-xs focus-visible:border-primary focus-visible:ring-primary/20"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="edit-product-status" className="text-[12px] font-medium">
                  Status
                </Label>
                <Select
                  value={status}
                  onValueChange={(v) => {
                    setStatus(v);
                    setIsDirty(checkDirty(name, sku, category, price, v, stock, description, removedImageIds, newImages));
                  }}
                >
                  <SelectTrigger id="edit-product-status" className="h-9 text-[13px]">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-[12px] font-medium">
                Images <span className="font-normal text-muted-foreground">drag to reorder</span>
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {activeExisting.map((image) => (
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
                      className="absolute right-1.5 top-1.5 flex size-4.5 items-center justify-center rounded-full border border-border bg-background text-[10px] text-muted-foreground hover:text-destructive"
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
                        className="absolute bottom-1.5 left-1.5 rounded-full border border-border bg-background/90 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-background"
                      >
                        Set primary
                      </button>
                    )}
                  </div>
                ))}

                {removedImageIds.size > 0 &&
                  existingImages
                    .filter((img) => removedImageIds.has(img.id))
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
                          className="absolute right-1.5 top-1.5 flex size-4.5 items-center justify-center rounded-full border border-border bg-background text-[10px] text-muted-foreground hover:text-foreground"
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
                      className="absolute right-1.5 top-1.5 flex size-4.5 items-center justify-center rounded-full border border-border bg-background text-[10px] text-muted-foreground hover:text-destructive"
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
                        className="absolute bottom-1.5 left-1.5 rounded-full border border-border bg-background/90 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-background"
                      >
                        Set primary
                      </button>
                    )}
                  </div>
                ))}
                {remainingSlots > 0 && (
                  <label
                    htmlFor="edit-product-images"
                    className="flex aspect-square cursor-pointer items-center justify-center rounded-md border border-dashed border-border text-[18px] text-muted-foreground hover:bg-muted"
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
                      <span className="font-medium">{imageError.fileName} </span>
                    )}
                    {imageError.message}
                  </p>
                  {imageError.details && (
                    <p className="text-xs text-muted-foreground">{imageError.details}</p>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-product-description" className="text-[12px] font-medium">
                Description
              </Label>
              <Textarea
                id="edit-product-description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setIsDirty(checkDirty(name, sku, category, price, status, stock, e.target.value, removedImageIds, newImages));
                }}
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
