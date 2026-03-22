import { prisma } from "@/lib/prisma";
import { createProductSchema } from "@/lib/validations/product";
import { normalizeImageUrlInput } from "@/lib/image-utils";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

function getErrorMessage(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: Prisma.ProductWhereInput = { isArchived: false };

    if (category && category !== "all") {
      where.category = {
        equals: category,
        mode: "insensitive",
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
    if (sort === "price-asc") {
      orderBy.push({ price: "asc" });
    } else if (sort === "price-desc") {
      orderBy.push({ price: "desc" });
    } else {
      orderBy.push({ createdAt: "desc" });
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: orderBy.length > 0 ? orderBy : undefined,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.product.count({ where });

    return NextResponse.json({
      data: products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);

    const errorCode = getPrismaErrorCode(error);
    if (errorCode === "P2021" || errorCode === "P2022") {
      return NextResponse.json(
        {
          error: "Database schema out of date",
          message: "Please run: npm run db:push and restart your dev server",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication middleware
    const body = await request.json();
    if (body && typeof body === "object" && "imageUrl" in body) {
      const payload = body as { imageUrl?: string | null };
      payload.imageUrl = normalizeImageUrlInput(payload.imageUrl);
    }

    const validatedData = createProductSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        imageUrl: validatedData.imageUrl || null,
        category: validatedData.category,
        stock: validatedData.stock,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating product:", error);

    const errorCode = getPrismaErrorCode(error);
    const errorMessage = getErrorMessage(error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "Please check your input and try again",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Handle database connection errors
    if (errorCode === "P1002" || errorMessage?.includes("ECONNREFUSED")) {
      return NextResponse.json(
        {
          error: "Database connection failed",
          message: "Please ensure your database is running and DATABASE_URL is configured",
        },
        { status: 503 }
      );
    }

    // Handle table not found errors
    if (errorCode === "P2021") {
      return NextResponse.json(
        {
          error: "Database not initialized",
          message: "Please run: npm run db:push",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create product",
        message: errorMessage || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
