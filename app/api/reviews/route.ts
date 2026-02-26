import { prisma } from "@/lib/prisma";
import { getOrCreateDemoUserId } from "@/lib/demo-user";
import { createReviewSchema } from "@/lib/validations/order";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const userId = await getOrCreateDemoUserId();
    const body = await request.json();

    const validatedData = createReviewSchema.parse(body);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if user has purchased this product
    const hasOrdered = await prisma.orderItem.findFirst({
      where: {
        productId: validatedData.productId,
        order: { userId },
      },
    });

    if (!hasOrdered) {
      return NextResponse.json(
        { error: "You can only review products you have purchased" },
        { status: 403 }
      );
    }

    // Create or update review
    const review = await prisma.review.upsert({
      where: {
        userId_productId: {
          userId,
          productId: validatedData.productId,
        },
      },
      update: {
        rating: validatedData.rating,
        comment: validatedData.comment || null,
      },
      create: {
        userId,
        productId: validatedData.productId,
        rating: validatedData.rating,
        comment: validatedData.comment || null,
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating review:", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
