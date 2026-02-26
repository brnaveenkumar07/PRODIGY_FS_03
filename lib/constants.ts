// Constants for the e-commerce platform

export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home",
  "Sports",
  "Books",
  "Beauty",
];

export const ORDER_STATUSES = [
  "PENDING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export const USER_ROLES = ["USER", "ADMIN"] as const;

export const PAGINATION_DEFAULTS = {
  PRODUCTS: 12,
  ORDERS: 10,
  REVIEWS: 5,
};

export const PRODUCT_FILTERS = {
  MIN_PRICE: 0,
  MAX_PRICE: 10000,
  SORT_OPTIONS: [
    { label: "Newest", value: "newest" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
  ],
};

export const API_ROUTES = {
  PRODUCTS: "/api/products",
  CART: "/api/cart",
  ORDERS: "/api/orders",
  REVIEWS: "/api/reviews",
};
