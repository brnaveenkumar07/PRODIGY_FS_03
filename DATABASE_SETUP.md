# E-Commerce Database Setup Guide

Your e-commerce application is now built and ready! Follow these steps to set up your PostgreSQL database and start adding products.

## Quick Setup (Choose One Option)

### Option 1: Free Cloud PostgreSQL (Recommended - Easiest)

#### Using Neon (Free Tier)
1. Visit https://neon.tech and sign up for free
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:password@host.neon.tech/dbname`)
4. Open `.env.local` in your project and update:
   ```
   DATABASE_URL="paste_your_connection_string_here"
   ```
5. Run these commands:
   ```bash
   npm run db:push      # Creates tables
   npm run db:seed      # Adds sample products (optional)
   npm run dev          # Start development server
   ```

#### Using Railway (Alternative)
1. Visit https://railway.app
2. Create a new project → Add PostgreSQL
3. Copy the DATABASE_URL from the PostgreSQL service
4. Update `.env.local` with the connection string
5. Follow the commands above (db:push, db:seed, dev)

### Option 2: Local PostgreSQL

#### Windows Installation
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings (remember the password you set for `postgres` user)
3. Create a new database:
   ```bash
   # Using psql (PostgreSQL command line)
   psql -U postgres
   CREATE DATABASE ecommerce;
   \q
   ```
4. Update `.env.local`:
   ```
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/ecommerce"
   ```
5. Run setup commands:
   ```bash
   npm run db:push      # Creates tables
   npm run db:seed      # Adds sample products (optional)
   npm run dev          # Start development server
   ```

#### Mac Installation (Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
createdb ecommerce
```

Then update `.env.local` and continue with db:push and db:seed.

### Option 3: Docker

If you have Docker installed:

```bash
docker run --name ecommerce-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ecommerce \
  -p 5432:5432 \
  -d postgres:15
```

Then update `.env.local`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/ecommerce"
```

## Setup Commands

Once your database is configured and `.env.local` is updated:

### 1. Create Database Schema
```bash
npm run db:push
```
This creates all the necessary tables (products, users, orders, cart, reviews).

### 2. (Optional) Add Sample Data
```bash
npm run db:seed
```
This populates your database with:
- Sample products (electronics, fashion items, home goods, sports equipment)
- Sample users
- Example orders and reviews

### 3. Start Development Server
```bash
npm run dev
```
Visit http://localhost:3000 to see your store!

## Testing the Admin Panel

1. Go to http://localhost:3000/admin
2. You should now see the "Product Management" section (previously showing database error)
3. Click "Add Product" to add new items
4. Fill in the form with:
   - **Name**: Product name (required)
   - **Description**: Detailed product info (optional)
   - **Price**: Selling price (required)
   - **Stock**: Number of units (required)
   - **Image URL**: Direct link to product image (optional)
   - **Category**: Electronics, Fashion, Home, Sports, etc. (optional)

## Verifying Your Setup

After running `npm run db:push`, you can verify the database is set up correctly:

### Using Neon Dashboard
- Log in to Neon console
- Click your project → Browse data
- You should see tables: users, products, cart, orders, reviews, etc.

### Using Local PostgreSQL
```bash
psql -U postgres -d ecommerce
\dt  # Lists all tables
```

## Troubleshooting

### "Database not initialized" Error
**Solution**: Run `npm run db:push` to create the schema

### "ECONNREFUSED" or Connection Failed
**Solution**: 
- Check DATABASE_URL in `.env.local` is correct
- Verify PostgreSQL is running
- Test connection: `psql <connection_string_here>`

### "Permission denied" Error
**Solution**: Ensure your PostgreSQL user has permissions to create tables
```bash
# For local PostgreSQL
psql -U postgres -d ecommerce -c "GRANT ALL PRIVILEGES ON DATABASE ecommerce TO postgres;"
```

### Products Created but Not Showing
**Solution**: Clear your browser cache and reload, or try incognito window

## Available Admin Features

Once database is set up, you can:

✅ **Products Tab**
- Add new products with name, description, price, image, category, stock
- Edit existing products
- Delete products
- View all products in a table

✅ **Orders Tab**
- View customer orders
- Update order status (PENDING → SHIPPED → DELIVERED or CANCELLED)
- See order items and total amounts

## Next Steps

1. **Set up authentication** (currently using placeholder user)
2. **Add payment processing** (Stripe integration)
3. **Customize product categories**
4. **Add email notifications**
5. **Set up CDN for product images**

## Environment Variables Reference

Your `.env.local` should contain:

```env
# Database connection (required for add/edit/delete operations)
DATABASE_URL="postgresql://user:password@host:port/dbname"

# JWT Secret (for future authentication integration)
NEXTAUTH_SECRET="your-secret-key-here"
```

## Production Deployment

When ready to deploy:

1. Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, Heroku Postgres, etc.)
2. Set `DATABASE_URL` environment variable in your hosting platform
3. Deploy with `npm run build && npm start`
4. Remember to run `npm run db:push` once on production

---

**Got stuck?** Check the error message in the Admin Dashboard - it provides specific setup instructions!
