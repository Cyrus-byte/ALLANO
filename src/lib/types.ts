

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  subcategory?: string;
  rating: number;
  reviews: number;
  sizes: string[];
  shoeSizes?: string[];
  colors: { name: string; hex?: string; imageUrl?: string }[];
  isNew?: boolean;
  onSale?: boolean;
  salePrice?: number;
  promotionEndDate?: any;
  createdAt: any; 
  aiDescription?: string;
  isLocal: boolean;
  isStarSeller: boolean;
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
  address: string; // Now represents "Quartier"
  indication: string; // New field for additional details
  city: string;
  phone: string;
};

export type Order = {
  id: string; // Firestore document ID
  userId: string;
  items: CartItem[]; // Now includes the full product object
  shippingDetails: ShippingDetails;
  totalAmount: number;
  status: 'Payée' | 'Expédiée' | 'Livrée' | 'Annulée';
  createdAt: any; // Firestore timestamp, will be Date object on client
  paymentDetails?: any;
  promoCode?: {
    code: string;
    discount: number;
  };
};

export type Review = {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any; // Firestore timestamp
};

export type Category = {
    id: string;
    name: string;
    createdAt: any;
    attributes?: {
        sizes?: boolean; // For clothes (S, M, L)
        shoeSizes?: boolean; // For shoes (39, 40, 41)
    }
}

export type PromoCode = {
    id: string; // The code itself
    type: 'percentage' | 'fixed';
    value: number;
    expiresAt?: any; // Firestore timestamp
    createdAt: any;
}

export type UserProfile = {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string; // Quartier de résidence
    role: 'customer' | 'admin';
    createdAt: any;
    cart?: any[];
    wishlist?: any[];
};
