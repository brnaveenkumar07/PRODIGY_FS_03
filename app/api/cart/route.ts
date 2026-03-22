import { prisma } from "@/lib/prisma";
import { getOrCreateDemoUserId } from "@/lib/demo-user";
import { addToCartSchema } from "@/lib/validations/cart";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const userId = await getOrCreateDemoUserId();

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    return NextResponse.json({
      cart,
      total,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getOrCreateDemoUserId();
    const body = await request.json();

    const validatedData = addToCartSchema.parse(body);

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

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

    // Check stock
    if (product.stock < validatedData.quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      );
    }

    // Add or update cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: validatedData.productId,
        },
      },
      update: {
        quantity: {
          increment: validatedData.quantity,
        },
      },
      create: {
        cartId: cart.id,
        productId: validatedData.productId,
        quantity: validatedData.quantity,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error: unknown) {
    console.error("Error adding to cart:", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}
