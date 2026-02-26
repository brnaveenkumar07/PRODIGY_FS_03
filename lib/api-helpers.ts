import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function createErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation error", details: error.flatten() },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }

  console.error("Unknown error:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

export function createSuccessResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

// Helper for checking resource ownership
export async function verifyResourceOwnership(
  resourceUserId: string,
  currentUserId: string
): Promise<boolean> {
  // TODO: Implement proper user authentication
  // For now, accept if IDs match
  return resourceUserId === currentUserId;
}

// Helper for checking admin role
export async function verifyAdminRole(userId: string): Promise<boolean> {
  // TODO: Implement proper role verification
  // This should query the database for user role
  return false;
}
