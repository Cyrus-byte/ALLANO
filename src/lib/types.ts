
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
  productId: string;
  size: string;
  color: string;
  quantity: number;
  product?: Product; // This will be populated client-side
};

export type WishlistItem = {
    productId: string;
}

export type ShippingDetails = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  phone: string;
};

export type Order = {
  id: string; // CinetPay transaction_id
  userId: string;
  items: Omit<CartItem, 'product'>[];
  shippingDetails: ShippingDetails;
  totalAmount: number;
  status: 'Payée' | 'Expédiée' | 'Livrée' | 'Annulée';
  createdAt: any; // Firestore timestamp
  paymentDetails?: any;
};
