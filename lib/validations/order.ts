import { z } from "zod";
import { OrderStatus } from "@prisma/client";

export const createOrderSchema = z.object({
  cartId: z.string().min(1, "Cart ID is required"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([OrderStatus.PENDING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED]),
});

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.coerce.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
