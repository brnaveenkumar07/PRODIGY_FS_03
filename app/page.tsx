import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface FeaturedProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
  stock: number;
}

export default async function Home() {
  let featuredProducts: FeaturedProduct[] = [];

  try {
    const rawFeaturedProducts = await prisma.product.findMany({
      take: 8,
      where: { isArchived: false },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        category: true,
        stock: true,
      },
    });

    // Prisma Decimal is not serializable for Client Components.
    featuredProducts = rawFeaturedProducts.map((product) => ({
      ...product,
      price: Number(product.price),
    }));
  } catch (error) {
    console.error("Failed to fetch featured products:", error);
    // Continue without featured products if database is not available
  }

  const categories = ["Electronics", "Fashion", "Home", "Sports", "Literature"];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-linear-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Welcome to E-Commerce
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover amazing products at unbeatable prices. Shop now and save big!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg">
                Shop Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/products?category=${encodeURIComponent(category.toLowerCase())}`}
              >
                <div className="p-6 bg-muted hover:bg-muted/80 rounded-lg transition-colors cursor-pointer">
                  <h3 className="text-lg font-semibold">{category}</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse {category.toLowerCase()} →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="w-full py-12 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link href="/products">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No products available yet
              </p>
              <Link href="/admin">
                <Button variant="outline">Add Products</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
