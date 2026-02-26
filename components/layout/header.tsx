"use client";

import Link from "next/link";
import { ShoppingCart, Home, Package, Box } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Package className="w-6 h-6" />
          E-Commerce
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:underline">
            <Home className="w-4 h-4 inline mr-2" />
            Home
          </Link>
          <Link href="/products" className="text-sm font-medium hover:underline">
            <Box className="w-4 h-4 inline mr-2" />
            Products
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/cart">
            <Button variant="outline" size="sm">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
            </Button>
          </Link>
          <Link href="/orders">
            <Button variant="outline" size="sm">
              Orders
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" size="sm">
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
