
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand?: string;
  rating: number;
  reviews: number;
  sizes: string[];
  colors: { name: string; hex: string }[];
  isNew?: boolean;
  onSale?: boolean;
  salePrice?: number;
};

export type CartItem = {
  id: string; // combination of product.id, size, and color
  product: Product;
  size: string;
  color: string;
  quantity: number;
};
