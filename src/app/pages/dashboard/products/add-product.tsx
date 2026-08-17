import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
import { Textarea } from "@/components/ui/textarea";


export function AddProducts() {

  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button> + Add Product</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl! gap-8">
        <SheetHeader className="border-b">
          <SheetTitle>Add Product</SheetTitle>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4 ">
          <div className="grid gap-3">
            <Label htmlFor="product-name" className="text-xs">
              Product Name
            </Label>
            <Input id="product-name" placeholder="e.g. Meridian Desk Lamp" className="h-10 focus-visible:border-primary focus-visible:primary-3 focus-visible:ring-primary/20 placeholder:text-xs" />
          </div>
          <div className="grid w-full grid-cols-2 gap-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="product-sku" className="text-xs">
                SKU
              </Label>
              <Input
                id="product-sku"
                placeholder="ABC-ITEM-000"
                className="w-full h-10 focus-visible:border-primary focus-visible:primary-3 focus-visible:ring-primary/20 placeholder:text-xs"
              />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="product-categories" className="text-xs">
                Categories
              </Label>
              <Select > 
                <SelectTrigger id="product-categories" className="w-full h-10 focus-visible:border-primary focus-visible:primary-3 focus-visible:ring-primary/20 placeholder:text-xs">
                  <SelectValue placeholder="Select…"  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Lighting">Lighting</SelectItem>
                  <SelectItem value="Apparel">Apparel</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Outdoor">Outdoor</SelectItem>
                  <SelectItem value="Stationery">Stationery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid w-full grid-cols-3 gap-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="product-price" className="text-xs">
                Price
              </Label>
              <Input
                id="product-price"
                type="number"
                placeholder="0.00"
                min={0}
               className="w-full h-10 focus-visible:border-primary focus-visible:primary-3 focus-visible:ring-primary/20 placeholder:text-xs"
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
                className="w-full h-10 focus-visible:border-primary focus-visible:primary-3 focus-visible:ring-primary/20 placeholder:text-xs"
              />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="product-status" className="text-xs">
                Status
              </Label>
              <Select>
                <SelectTrigger id="product-status" className="w-full h-10 focus-visible:border-primary focus-visible:primary-3 focus-visible:ring-primary/20 placeholder:text-xs">
                  <SelectValue placeholder="select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" className="hover:bg-">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>i
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
              className="min-h-20 h-20 resize-none w-full focus-visible:border-primary focus-visible:primary-3 focus-visible:ring-primary/20 placeholder:text-xs"
            />
          </div>
          <div className="grid w-full gap-2">
            <Label htmlFor="product-images" className="text-xs">
              Images
            </Label>

            <label
              htmlFor="product-images"
              className="flex min-h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-primary bg-primary/5 px-4 py-6 text-center transition-colors hover:bg-primary/10"
            >
              <span className="text-xs font-bold text-hover-text">
                Drop images here, or click to browse
              </span>

              <span className="mt-2 text-xs text-muted-foreground">
                JPG, PNG or WEBP · up to 5 MB each · max 6 images
              </span>
            </label>

            <Input
              id="product-images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
            />
          </div>
        </div>
        <SheetFooter className="w-full border-t">
          <div className="w-full flex gap-2 justify-start flex-row-reverse">
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
