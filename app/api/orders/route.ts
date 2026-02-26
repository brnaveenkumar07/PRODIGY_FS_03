import { prisma } from "@/lib/prisma";
import { getOrCreateDemoUserId } from "@/lib/demo-user";
import { createOrderSchema } from "@/lib/validations/order";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const userId = await getOrCreateDemoUserId();
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.order.count({ where: { userId } });

    return NextResponse.json({
      data: orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getOrCreateDemoUserId();
    const body = await request.json();

    const validatedData = createOrderSchema.parse(body);

    // Get cart and verify it belongs to the user
    const cart = await prisma.cart.findUnique({
      where: { id: validatedData.cartId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    if (cart.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (cart.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Calculate total
    let totalAmount = 0;
    const orderItems: Array<{
      productId: string;
      quantity: number;
      price: (typeof cart.items)[number]["product"]["price"];
    }> = [];

    for (const item of cart.items) {
      const itemTotal = Number(item.product.price) * item.quantity;
      totalAmount += itemTotal;
      orderItems.push({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      });
    }

    // Create order with items in a transaction
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        status: "PENDING",
        items: {
          createMany: {
            data: orderItems,
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating order:", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
