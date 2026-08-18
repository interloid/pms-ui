import { useState, type ChangeEvent } from "react";

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

import type { ProductImage } from "@/types/data-type";
import { toast } from "sonner";

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AddProducts() {
  const [images, setImages] = useState<ProductImage[]>([]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    const remainingSlots = MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      toast.error("Maximum images reached", {
        description: `You can upload a maximum of ${MAX_IMAGES} images.`,
      });

      event.target.value = "";
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);

    const newImages: ProductImage[] = [];

    for (const file of filesToAdd) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error("Invalid image format", {
          description: `${file.name} is not supported. Please use JPG, PNG, or WEBP.`,
        });

        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error("Image is too large", {
          description: `${file.name} is larger than 5 MB.`,
        });

        continue;
      }

      const alreadyExists = images.some(
        (image) =>
          image.file.name === file.name &&
          image.file.size === file.size &&
          image.file.lastModified === file.lastModified,
      );

      if (alreadyExists) {
        toast.error("Duplicate image", {
          description: `${file.name} has already been selected.`,
        });

        continue;
      }

      const previewUrl = URL.createObjectURL(file);

      newImages.push({
        id: crypto.randomUUID(),
        file,
        previewUrl,
        isPrimary: images.length === 0 && newImages.length === 0,
      });
    }

    if (newImages.length > 0) {
      setImages((previousImages) => [...previousImages, ...newImages]);
    }

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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>+ Add Product</Button>
      </SheetTrigger>

      <SheetContent className="gap-8 sm:max-w-xl!">
        <SheetHeader className="border-b">
          <SheetTitle className="font-bold">Add Product</SheetTitle>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 overflow-y-auto px-4">
          <div className="grid gap-3">
            <Label htmlFor="product-name" className="text-xs">
              Product Name
              <span className="text-destructive"> *</span>
            </Label>

            <Input
              id="product-name"
              placeholder="e.g. Meridian Desk Lamp"
              className="h-10 placeholder:text-xs focus-visible:border-primary focus-visible:ring-primary/20"
            />
          </div>

          <div className="grid w-full grid-cols-2 gap-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="product-sku" className="text-xs">
                SKU
                <span className="text-destructive"> *</span>
              </Label>

              <Input
                id="product-sku"
                placeholder="ABC-ITEM-000"
                className="h-10 w-full placeholder:text-xs focus-visible:border-primary focus-visible:ring-primary/20"
              />
            </div>

            <div className="grid w-full gap-2">
              <Label htmlFor="product-category" className="text-xs">
                Category
                <span className="text-destructive"> *</span>
              </Label>

              <Select>
                <SelectTrigger
                  id="product-category"
                  className="h-10 w-full focus-visible:border-primary focus-visible:ring-primary/20"
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="lighting">Lighting</SelectItem>
                  <SelectItem value="apparel">Apparel</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="stationery">Stationery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid w-full grid-cols-3 gap-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="product-price" className="text-xs">
                Price
                <span className="text-destructive"> *</span>
              </Label>

              <Input
                id="product-price"
                type="number"
                placeholder="0.00"
                min={0}
                className="h-10 w-full placeholder:text-xs focus-visible:border-primary focus-visible:ring-primary/20"
              />
            </div>

            <div className="grid w-full gap-2">
              <Label htmlFor="product-stock" className="text-xs">
                Stock
              </Label>

              <Input
                id="product-stock"
                type="number"
                placeholder="0"
                min={0}
                className="h-10 w-full placeholder:text-xs focus-visible:border-primary focus-visible:ring-primary/20"
              />
            </div>

            <div className="grid w-full gap-2">
              <Label htmlFor="product-status" className="text-xs">
                Status
              </Label>

              <Select>
                <SelectTrigger
                  id="product-status"
                  className="h-10 w-full focus-visible:border-primary focus-visible:ring-primary/20"
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid w-full gap-2">
            <Label htmlFor="product-description" className="text-xs">
              Description
            </Label>

            <Textarea
              id="product-description"
              placeholder="Optional"
              className="h-20 min-h-20 w-full resize-none placeholder:text-xs focus-visible:border-primary focus-visible:ring-primary/20"
            />
          </div>

          <div className="grid w-full gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="product-images" className="text-xs">
                Images
              </Label>

              <span className="text-xs text-muted-foreground">
                {images.length} of {MAX_IMAGES}
              </span>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
                  >
                    <img
                      src={image.previewUrl}
                      alt={image.file.name}
                      className="h-full w-full object-cover"
                    />

                    <button
                      type="button"
                      aria-label={`Remove ${image.file.name}`}
                      onClick={() => removeImage(image.id)}
                      className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full border bg-background/90 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                    >
                      x
                    </button>

                    {image.isPrimary ? (
                      <span className="absolute bottom-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                        Primary
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(image.id)}
                        className="absolute bottom-2 left-2 rounded-full border bg-background/90 px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-background"
                      >
                        Set primary
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {images.length < MAX_IMAGES && (
              <label
                htmlFor="product-images"
                className="flex min-h-16 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed px-4 py-4 text-center transition-colors hover:bg-muted/50"
              >
                <span className="text-xs text-muted-foreground">
                  Drop images here, or click to browse
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

        <SheetFooter className="w-full border-t">
          <div className="flex w-full flex-row-reverse justify-start gap-2">
            <Button type="submit">Save product</Button>

            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
