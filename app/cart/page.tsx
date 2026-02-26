"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { canUseNextImage, getRenderableImageSrc } from "@/lib/image-utils";

interface Product {
  id: string;
  name: string;
  price: string | number;
  imageUrl: string | null;
  stock: number;
}

interface CartItem {
  id: string;
  quantity: number;
  product: Product;
}

interface CartItemWithProduct extends CartItem {
  product: Product;
}

interface Cart {
  id: string;
  items: CartItemWithProduct[];
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Failed to fetch cart");
      }
      const data = await response.json();
      setCart(data.cart);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      setUpdating(itemId);
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) throw new Error("Failed to update quantity");
      await fetchCart();
      toast.success("Quantity updated");
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdating(itemId);
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove item");
      await fetchCart();
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    } finally {
      setUpdating(null);
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;

    try {
      setCreating(true);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId: cart.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to create order");
      }

      const order = await response.json();
      toast.success("Order created successfully!");
      setCart({ ...cart, items: [] });
      setTotal(0);

      // Redirect to orders page
      setTimeout(() => {
        window.location.href = "/orders";
      }, 1500);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create order");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : cart && cart.items.length > 0 ? (
              <div className="space-y-4">
                {cart.items.map((item) => {
                  const imageSrc = getRenderableImageSrc(item.product.imageUrl);
                  const useNextImage = canUseNextImage(imageSrc);

                  return (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <div className="relative w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 border rounded-lg flex-shrink-0">
                          {imageSrc ? (
                            useNextImage ? (
                              <Image
                                src={imageSrc}
                                alt={item.product.name}
                                fill
                                className="object-contain p-2 rounded-lg"
                                sizes="96px"
                              />
                            ) : (
                              <img
                                src={imageSrc}
                                alt={item.product.name}
                                className="w-full h-full object-contain p-2 rounded-lg"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                              />
                            )
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              No Image
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.product.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            ${Number(item.product.price).toFixed(2)} per item
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={updating === item.id || item.quantity === 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={updating === item.id || item.quantity >= item.product.stock}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Price & Remove */}
                        <div className="flex flex-col items-end justify-between">
                          <p className="font-semibold">
                            ${(Number(item.product.price) * item.quantity).toFixed(2)}
                          </p>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={updating === item.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">Your cart is empty</p>
                  <Link href="/products">
                    <Button>Continue Shopping</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <>
                    <Skeleton className="h-4" />
                    <Skeleton className="h-4" />
                    <Skeleton className="h-8" />
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleCheckout}
                      disabled={!cart || cart.items.length === 0 || creating}
                    >
                      {creating ? "Creating Order..." : "Proceed to Checkout"}
                    </Button>
                    <Link href="/products" className="block">
                      <Button variant="outline" className="w-full">
                        Continue Shopping
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
