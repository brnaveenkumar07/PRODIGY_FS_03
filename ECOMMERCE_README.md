# E-Commerce Platform

A production-ready e-commerce website built with Next.js 16, TypeScript, Prisma ORM, and PostgreSQL.

## 🚀 Features

- **Product Management**: Browse, search, and filter products
- **Shopping Cart**: Add/remove items, manage quantities
- **Order Management**: Create orders, track status
- **Admin Dashboard**: Manage products and orders
- **Review System**: Customer reviews and ratings
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Type Safety**: Full TypeScript support
- **Server Components**: Optimized performance with Next.js App Router
- **Zod Validation**: Type-safe request validation

## 🛠 Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **shadcn/ui Components**
- **Tailwind CSS**
- **Zod** (Validation)
- **Sonner** (Toast Notifications)

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd e-com
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"

# JWT (optional, for future auth implementation)
NEXTAUTH_SECRET="your-secret-key-here"
```

### 3. Setup Database

```bash
# Add Prisma schema to your database
npm run db:push

# Seed database with sample data
npm run db:seed
```

Or use Prisma migrations:

```bash
# Create and apply migrations
npx prisma migrate dev --name initial
```

### 4. Start Development Server

```bash
npm run dev
```

Application will be available at `http://localhost:3000`

## 📁 Project Structure

```
app/
├── api/                      # API Route Handlers
│   ├── products/            # Product endpoints
│   ├── cart/               # Cart endpoints
│   ├── orders/             # Order endpoints
│   └── reviews/            # Review endpoints
├── products/                # Product pages
│   ├── page.tsx            # Listing page
│   └── [id]/               # Detail page
├── cart/                    # Shopping cart
├── orders/                  # Order history
├── admin/                   # Admin dashboard
├── layout.tsx              # Root layout
└── page.tsx               # Home page
components/
├── layout/                 # Header, Footer
├── ui/                     # shadcn components
└── product-card.tsx       # Reusable card
lib/
├── prisma.ts              # Prisma client singleton
├── utils.ts               # Utility functions
└── validations/           # Zod schemas
prisma/
├── schema.prisma          # Database schema
└── seed.ts               # Seed script
```

## 🗄 Database Schema

### Users
- id, name, email, password, role, timestamps

### Products
- id, name, description, price, imageUrl, category, stock, timestamps

### Cart & CartItems
- Cart: id, userId, timestamps
- CartItem: id, cartId, productId, quantity, timestamps

### Orders & OrderItems
- Order: id, userId, totalAmount, status, timestamps
- OrderItem: id, orderId, productId, quantity, price, timestamps

### Reviews
- id, userId, productId, rating (1-5), comment, timestamps

## 📡 API Endpoints

### Products
- `GET /api/products` - List products (with filtering, sorting, pagination)
- `GET /api/products/[id]` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/[id]` - Update product (admin)
- `DELETE /api/products/[id]` - Delete product (admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/[id]` - Update cart item
- `DELETE /api/cart/[id]` - Remove from cart

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/[id]` - Get order details
- `POST /api/orders` - Create order from cart
- `PUT /api/orders/[id]` - Update order status (admin)

### Reviews
- `POST /api/reviews` - Create/update review

## 🎨 Frontend Pages

- `/` - Homepage with featured products
- `/products` - Product listing with search/filter
- `/products/[id]` - Product detail page
- `/cart` - Shopping cart
- `/orders` - Order history
- `/admin` - Admin dashboard

## 💻 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start           # Start production server

# Database
npm run db:push     # Sync schema without migrations
npm run db:seed     # Run seed script
npm run db:reset    # Reset database

# Linting
npm run lint        # Run ESLint
```

## 🔐 Authentication Notes

Currently, the app uses a placeholder user ID (`user-123`). In production, implement:

- Session-based auth (next-auth)
- JWT tokens
- Middleware for route protection
- Admin role verification

**TODO markers** are placed in the code for authentication implementation.

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Setup

For production, ensure:

1. Database URL uses production PostgreSQL
2. `NEXTAUTH_SECRET` is set securely
3. Enable CORS if API accessed from different domain
4. Set `NODE_ENV=production`

### Database Management

```bash
# Create new migration
npx prisma migrate dev --name feature_name

# Deploy migration
npx prisma migrate deploy
```

## 📝 Sample Data

Run the seed script to populate with sample products and users:

```bash
npm run db:seed
```

**Sample Credentials:**
- User: john@example.com
- Admin: admin@example.com

## 🎯 TODO / Future Enhancements

- [ ] Authentication & Authorization
- [ ] Payment processing (Stripe)
- [ ] Email notifications
- [ ] Wishlist feature
- [ ] Advanced filters
- [ ] Product variants
- [ ] Inventory management
- [ ] Dashboard analytics
- [ ] Multi-language support
- [ ] Image optimization

## 📧 Support

For issues or questions, check the code comments for TODO markers and implementation notes.

## 📄 License

MIT License

