import type { FormError, ProductForm } from "@/types/data-type";

export function validateProductFields(form: ProductForm): FormError {
  const errors: FormError = {};

  if (!form.name.trim()) {
    errors.name = "This name is required.";
  }

  if (!form.sku.trim()) {
    errors.sku = "This SKU is required.";
  }

  if (!form.category) {
    errors.category = "This category is required.";
  }

  if (!form.price.trim()) {
    errors.price = "This price is required.";
  }  else if (Number(form.price) < 0) {
    errors.price = "Price cannot be negative.";
  }  else if (Number(form.price) === 0) {
    errors.price = "Price cannot be zero";
  }

  if (!form.stock.trim()) {
    errors.stock = "This stock is required.";
  }else if (Number(form.stock) < 0) {
    errors.stock = "Stock cannot be negative.";
  }else if (Number(form.stock) === 0) {
    errors.stock = "Stock cannot be zero.";
  }


  return errors;
}
