import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users...");
  const user1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      password: "hashed_password_1", // In production, hash this
      role: "USER",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: "hashed_password_2", // In production, hash this
      role: "ADMIN",
    },
  });

  console.log("Creating products...");
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 129.99,
        category: "Electronics",
        stock: 50,
        imageUrl: "/product-images/wireless-headphones.svg",
      },
    }),
    prisma.product.create({
      data: {
        name: "USB-C Cable",
        description: "Fast charging USB-C cable with data transfer",
        price: 19.99,
        category: "Electronics",
        stock: 200,
        imageUrl: "/product-images/usb-c-cable.svg",
      },
    }),
    prisma.product.create({
      data: {
        name: "Wireless Mouse",
        description: "Ergonomic wireless mouse with precision tracking",
        price: 39.99,
        category: "Electronics",
        stock: 100,
        imageUrl: "/product-images/wireless-mouse.svg",
      },
    }),
    prisma.product.create({
      data: {
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with mechanical switches",
        price: 149.99,
        category: "Electronics",
        stock: 75,
        imageUrl: "/product-images/mechanical-keyboard.svg",
      },
    }),
    prisma.product.create({
      data: {
        name: "4K Monitor",
        description: "27-inch 4K UltraHD monitor with HDR support",
        price: 449.99,
        category: "Electronics",
        stock: 30,
        imageUrl: "/product-images/monitor-4k.svg",
      },
    }),
    prisma.product.create({
      data: {
        name: "Cotton T-Shirt",
        description: "Premium cotton t-shirt available in multiple colors",
        price: 29.99,
        category: "Fashion",
        stock: 150,
        imageUrl: "/product-images/cotton-tshirt.svg",
      },
    }),
    prisma.product.create({
      data: {
        name: "Running Shoes",
        description: "Professional running shoes with cushioning technology",
        price: 129.99,
        category: "Fashion",
        stock: 80,
        imageUrl: "/product-images/running-shoes.svg",
      },
    }),
    prisma.product.create({
      data: {
        name: "Desk Lamp",
        description: "LED desk lamp with adjustable brightness",
        price: 59.99,
        category: "Home",
        stock: 60,
        imageUrl: "/product-images/desk-lamp.svg",
      },
    }),
  ]);

  console.log("Creating cart...");
  const cart = await prisma.cart.create({
    data: {
      userId: user1.id,
      items: {
        createMany: {
          data: [
            {
              productId: products[0].id,
              quantity: 1,
            },
            {
              productId: products[1].id,
              quantity: 2,
            },
          ],
        },
      },
    },
  });

  console.log("Creating orders...");
  const order1 = await prisma.order.create({
    data: {
      userId: user1.id,
      totalAmount: Number(products[0].price) + Number(products[1].price) * 2,
      status: "PENDING",
      items: {
        createMany: {
          data: [
            {
              productId: products[0].id,
              quantity: 1,
              price: products[0].price,
            },
            {
              productId: products[2].id,
              quantity: 1,
              price: products[2].price,
            },
          ],
        },
      },
    },
  });

  console.log("Creating reviews...");
  await Promise.all([
    prisma.review.create({
      data: {
        userId: user1.id,
        productId: products[0].id,
        rating: 5,
        comment: "Excellent quality! Highly recommended.",
      },
    }),
    prisma.review.create({
      data: {
        userId: user1.id,
        productId: products[2].id,
        rating: 4,
        comment: "Good product, great price",
      },
    }),
  ]);

  console.log("✅ Database seeded successfully!");
  console.log("\nSample credentials:");
  console.log("User: john@example.com");
  console.log("Admin: admin@example.com");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
