import { z } from "zod";

const imagePathRegex =
  /^\/[a-zA-Z0-9/_-]+\.(png|jpe?g|webp|svg)$/i;

const imageSourceSchema = z.union([
  z.string().url("Invalid image URL"),
  z
    .string()
    .regex(
      imagePathRegex,
      "Invalid image path. Use /product-images/your-image.jpg"
    ),
]);

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  imageUrl: imageSourceSchema.optional().or(z.literal("")),
  category: z.string().optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.coerce.number().positive().optional(),
  imageUrl: imageSourceSchema.optional().or(z.literal("")),
  category: z.string().optional(),
  stock: z.coerce.number().int().min(0).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
