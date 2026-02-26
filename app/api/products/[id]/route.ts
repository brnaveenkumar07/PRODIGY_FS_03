import { prisma } from "@/lib/prisma";
import { updateProductSchema } from "@/lib/validations/product";
import { normalizeImageUrlInput } from "@/lib/image-utils";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

function getPrismaErrorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }

  return undefined;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!product || product.isArchived) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add admin authentication check
    const { id } = await params;
    const body = await request.json();
    if (body && typeof body === "object" && "imageUrl" in body) {
      const payload = body as { imageUrl?: string | null };
      payload.imageUrl = normalizeImageUrlInput(payload.imageUrl);
    }

    const validatedData = updateProductSchema.parse(body);

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description && {
          description: validatedData.description,
        }),
        ...(validatedData.price && { price: validatedData.price }),
        ...(validatedData.imageUrl !== undefined && {
          imageUrl: validatedData.imageUrl || null,
        }),
        ...(validatedData.category && { category: validatedData.category }),
        ...(validatedData.stock !== undefined && { stock: validatedData.stock }),
      },
    });

    return NextResponse.json(product);
  } catch (error: unknown) {
    console.error("Error updating product:", error);
    const errorCode = getPrismaErrorCode(error);

    if (errorCode === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add admin authentication check
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        isArchived: true,
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.isArchived) {
      return NextResponse.json({
        message: "Product deleted successfully",
        archived: true,
      });
    }

    const hasOrderHistory = product._count.orderItems > 0;

    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({
        where: { productId: id },
      });

      await tx.review.deleteMany({
        where: { productId: id },
      });

      if (hasOrderHistory) {
        await tx.product.update({
          where: { id },
          data: {
            isArchived: true,
            stock: 0,
          },
        });
        return;
      }

      await tx.product.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      message: hasOrderHistory
        ? "Product archived successfully"
        : "Product deleted successfully",
      archived: hasOrderHistory,
    });
  } catch (error: unknown) {
    console.error("Error deleting product:", error);
    const errorCode = getPrismaErrorCode(error);

    if (errorCode === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
