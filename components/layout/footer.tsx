"use client";

import Link from "next/link";

const productCategoryLinks = [
  { label: "Electronics", value: "electronics" },
  { label: "Fashion", value: "fashion" },
  { label: "Home", value: "home" },
  { label: "Sports", value: "sports" },
  { label: "Literature", value: "literature" },
];

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">About</h3>
            <p className="text-sm text-muted-foreground">
              Modern e-commerce platform built with Next.js 16 and Tailwind CSS.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Products</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products" className="hover:underline">
                  All Products
                </Link>
              </li>
              {productCategoryLinks.map((category) => (
                <li key={category.value}>
                  <Link
                    href={`/products?category=${encodeURIComponent(category.value)}`}
                    className="hover:underline"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Customer</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/orders" className="hover:underline">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:underline">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:underline">Contact Us</a></li>
              <li><a href="#" className="hover:underline">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 E-Commerce. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
