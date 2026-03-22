import { prisma } from "@/lib/prisma";
import { getOrCreateDemoUserId } from "@/lib/demo-user";
import { updateCartItemSchema } from "@/lib/validations/cart";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = await getOrCreateDemoUserId();

    const validatedData = updateCartItemSchema.parse(body);

    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true, product: true },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    if (cartItem.cart.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check stock
    if (cartItem.product.stock < validatedData.quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: {
        quantity: validatedData.quantity,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error: unknown) {
    console.error("Error updating cart item:", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getOrCreateDemoUserId();

    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    if (cartItem.cart.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Cart item deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting cart item:", error);
    const errorCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code?: unknown }).code === "string"
        ? (error as { code: string }).code
        : undefined;

    if (errorCode === "P2025") {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete cart item" },
      { status: 500 }
    );
  }
}
