"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { canUseNextImage, getRenderableImageSrc } from "@/lib/image-utils";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: { toString(): string };
  imageUrl: string | null;
  category: string | null;
  stock: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  user: { name: string | null };
}

interface ProductWithReviews extends Product {
  reviews: Review[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductWithReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) throw new Error("Failed to fetch product");
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAdding(true);
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || "Failed to add to cart");
      }

      toast.success("Added to cart!");
      setQuantity(1);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-96" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-20" />
              <Skeleton className="h-12 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">Product not found</p>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = product.reviews.length > 0
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : 0;
  const imageSrc = getRenderableImageSrc(product.imageUrl);
  const useNextImage = canUseNextImage(imageSrc);

  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4">
        <Link href="/products" className="text-sm text-muted-foreground hover:underline mb-4">
          ← Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="relative h-96 bg-gradient-to-br from-slate-50 to-slate-100 border rounded-lg overflow-hidden">
            {imageSrc ? (
              useNextImage ? (
                <Image
                  src={imageSrc}
                  alt={product.name}
                  fill
                  className="object-contain p-6 md:p-8"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <img
                  src={imageSrc}
                  alt={product.name}
                  className="w-full h-full object-contain p-6 md:p-8"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image Available
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
              {product.category && (
                <Badge className="mb-4">{product.category}</Badge>
              )}
            </div>

            <div>
              <p className="text-4xl font-bold mb-2">
                ${Number(product.price).toFixed(2)}
              </p>
              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <Badge variant="outline">In Stock</Badge>
                    <span className="text-sm text-muted-foreground">
                      {product.stock} available
                    </span>
                  </>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            {/* Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity === 1}
                >
                  −
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || adding}
                className="flex-1"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {adding ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews.length > 0 && (
          <div className="mt-12 border-t pt-12">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(Number(averageRating))
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{averageRating}</span>
                <span className="text-muted-foreground">
                  ({product.reviews.length} reviews)
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              {product.reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {review.user.name || "Anonymous"}
                      </CardTitle>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  {review.comment && (
                    <CardContent>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
