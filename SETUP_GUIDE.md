# E-Commerce Setup Guide

## 🎯 Quick Start

This guide will help you set up the production-ready e-commerce platform.

## Step 1: Database Setup

### Option A: Local PostgreSQL

1. **Install PostgreSQL** (if not already installed)
   - Windows: Download from https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql`
   - Linux: `sudo apt install postgresql`

2. **Create Database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE ecommerce;
   
   # Create user (optional)
   CREATE USER ecom_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE ecommerce TO ecom_user;
   ```

3. **Update .env.local**
   ```env
   DATABASE_URL="postgresql://ecom_user:your_password@localhost:5432/ecommerce"
   ```

### Option B: Cloud Database (Recommended for Production)

1. **Prisma Postgres** (easiest option)
   ```bash
   # Login/create account
   npx prisma platform login
   
   # Create database in cloud
   npx prisma platform db create
   
   # .env.local will be auto-populated
   ```

2. **Neon.tech**
   - Go to https://neon.tech
   - Create project and copy connection string

3. **Railway.app**
   - Go to https://railway.app
   - Create PostgreSQL volume
   - Copy connection string

## Step 2: Project Setup

### 1. Install Dependencies
```bash
cd e-com
npm install
```

### 2. Initialize Prisma

```bash
# Generate Prisma client
npx prisma generate

# Sync database schema
npm run db:push
```

Or use migrations:
```bash
# Create initial migration
npx prisma migrate dev --name init
```

### 3. Seed Database

```bash
npm run db:seed
```

This will:
- Create sample users
- Add 8 products in different categories
- Create sample orders and reviews

## Step 3: Start Development Server

```bash
npm run dev
```

Application opens at: http://localhost:3000

## 📱 Testing the Application

### Homepage
- Visit http://localhost:3000
- See featured products and category sections

### Browse Products
- Click "Products" or "Shop Now"
- Search, filter by category, sort by price
- View product details

### Shopping
- Add products to cart
- View cart at http://localhost:3000/cart
- Adjust quantities, remove items

### Place Order
- Click "Proceed to Checkout"
- Order created and moved to /orders

### View Orders
- http://localhost:3000/orders
- See order history with status

### Admin Dashboard
- http://localhost:3000/admin
- **Products Tab**: Create, edit, delete products
- **Orders Tab**: Update order status

## 🔑 Sample Credentials

After seeding, you have:

| Email | Role | Password |
|-------|------|----------|
| john@example.com | USER | test123 |
| admin@example.com | ADMIN | test456 |

*(Note: Passwords need to be hashed in production)*

## 🗄 Database Management

### View Database GUI

```bash
# Open Prisma Studio
npx prisma studio
```

Opens at http://localhost:5555 - visual database editor

### Reset Database

```bash
# WARNING: Deletes all data
npm run db:reset
```

This will:
1. Drop all tables
2. Create new tables from schema
3. Run seed script

## 📊 Project Status

| Feature | Status |
|---------|--------|
| Database Schema | ✅ Complete |
| API Routes | ✅ Complete |
| Frontend Pages | ✅ Complete |
| Components | ✅ Complete |
| Product Management | ✅ Complete |
| Cart System | ✅ Complete |
| Order Management | ✅ Complete |
| Admin Dashboard | ✅ Complete |
| Authentication | ⏳ TODO |
| Payment Processing | ⏳ TODO |

## 🚨 Common Issues & Solutions

### Issue: `DATABASE_URL` not set
**Solution**: Copy `.env.local` template and add your database URL

### Issue: Prisma client not generated
**Solution**: Run `npx prisma generate`

### Issue: Cannot connect to database
**Solution**: 
- Verify PostgreSQL is running
- Check connection string in `.env.local`
- Verify database name matches

### Issue: "P2003: Foreign key constraint failed"
**Solution**: Run `npm run db:reset` to refresh database

### Issue: Port 3000 already in use
**Solution**: `npm run dev -- -p 3001`

## 🔌 API Testing

### Using cURL

```bash
# Get products
curl http://localhost:3000/api/products

# Add to cart
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod-id","quantity":1}'
```

### Using Postman/Insomnia

Import the following endpoints:
- `GET /api/products` - List products
- `GET /api/products/[id]` - Get product
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order

## 📚 File Structure Reference

```
app/
├── api/
│   ├── products/route.ts         # GET/POST products
│   ├── products/[id]/route.ts    # GET/PUT/DELETE single
│   ├── cart/route.ts             # GET/POST cart
│   ├── cart/[id]/route.ts        # PUT/DELETE item
│   ├── orders/route.ts           # GET/POST orders
│   ├── orders/[id]/route.ts      # GET/PUT order
│   └── reviews/route.ts          # POST reviews
├── products/
│   ├── page.tsx                  # Products listing
│   └── [id]/page.tsx            # Product detail
├── cart/page.tsx                # Shopping cart
├── orders/
│   ├── page.tsx                 # Order history
│   └── [id]/page.tsx           # Order detail
└── admin/page.tsx              # Admin dashboard

lib/
├── prisma.ts                    # Prisma client
├── utils.ts                     # Utilities
├── constants.ts                 # App constants
└── validations/                 # Zod schemas

components/
├── layout/
│   ├── header.tsx
│   └── footer.tsx
└── product-card.tsx

prisma/
├── schema.prisma               # DB schema
└── seed.ts                     # Sample data
```

## 🎓 Next Steps

1. **Implement Authentication**
   - Set up NextAuth.js or Auth0
   - Add user sessions
   - Protect admin routes

2. **Add Payment Processing**
   - Integrate Stripe
   - Handle payment confirmations
   - Update order status

3. **Improve Admin Dashboard**
   - Add order analytics
   - Product analytics
   - Revenue charts

4. **Optimize Performance**
   - Image optimization with Next.js Image
   - Database indexing
   - Caching strategy

5. **Add Features**
   - Email notifications
   - Wishlist feature
   - Product variants
   - Inventory alerts

## 📞 Support

Check code comments for:
- `TODO:` marks for future enhancements
- `FIXME:` marks for known issues
- Detailed explanations in function comments

## 🎉 You're Ready!

Your e-commerce platform is ready to use. Start with:

```bash
npm run dev
```

Then visit http://localhost:3000 to explore!

