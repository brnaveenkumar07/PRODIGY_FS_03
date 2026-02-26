"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { canUseNextImage, getRenderableImageSrc } from "@/lib/image-utils";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: { toString(): string };
  imageUrl: string | null;
  category: string | null;
  stock: number;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const imageSrc = getRenderableImageSrc(product.imageUrl);
  const useNextImage = canUseNextImage(imageSrc);

  const handleAddToCart = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0 || adding) return;

    try {
      setAdding(true);
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Failed to add to cart");
      }

      toast.success("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="relative w-full h-48 bg-gradient-to-br from-slate-50 to-slate-100 border-b">
          {imageSrc ? (
            useNextImage ? (
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <img
                src={imageSrc}
                alt={product.name}
                className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-2 text-base">{product.name}</CardTitle>
          {product.category && (
            <Badge variant="secondary" className="w-fit text-xs">
              {product.category}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.stock > 0 ? (
              <Badge variant="outline" className="text-xs">
                {product.stock} in stock
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                Out of stock
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={product.stock === 0 || adding}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {adding ? "Adding..." : "Add to Cart"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
