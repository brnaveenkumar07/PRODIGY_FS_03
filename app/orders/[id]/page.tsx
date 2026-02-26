"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useParams } from "next/navigation";

type OrderStatus = "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface Product {
  id: string;
  name: string;
  price: { toString(): string };
}

interface OrderItem {
  id: string;
  quantity: number;
  price: { toString(): string };
  product: Product;
}

interface Order {
  id: string;
  createdAt: Date | string;
  totalAmount: { toString(): string };
  status: OrderStatus;
  items: OrderItem[];
}

interface OrderWithItems extends Order {
  items: OrderItem[];
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) throw new Error("Failed to fetch order");
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="w-full py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-1/4 mb-8" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">Order not found</p>
          <Link href="/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4">
        <Link href="/orders" className="text-sm text-muted-foreground hover:underline mb-4">
          ← Back to Orders
        </Link>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Order #{order.id.slice(0, 8)}</h1>
            <Badge className={statusColors[order.status]}>
              {order.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Ordered on {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{order.status}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {order.status === "PENDING"
                  ? "Your order is being prepared"
                  : order.status === "SHIPPED"
                  ? "Your order is on the way"
                  : order.status === "DELIVERED"
                  ? "Your order has been delivered"
                  : "Your order has been cancelled"}
              </p>
            </CardContent>
          </Card>

          {/* Order Total */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${Number(order.totalAmount).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          {/* Order Date */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {formatDate(order.createdAt)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Order {order.id.slice(0, 8)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-4 border-b last:border-b-0"
                >
                  <div>
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${Number(item.price).toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
