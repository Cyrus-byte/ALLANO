
"use client";

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product/product-card';
import { getProducts } from '@/lib/product-service';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function PromotionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const fetchedProducts = await getProducts({ onSale: true });
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch sale products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const onSaleProducts = products;

  if (loading) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <Skeleton className="h-12 w-1/3 mb-8" />
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                        <Skeleton className="aspect-[3/4] w-full" />
                        <Skeleton className="h-5 w-3/4 mt-4" />
                        <Skeleton className="h-5 w-1/2 mt-2" />
                    </div>
                ))}
            </div>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">Promotions</h1>
      {onSaleProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {onSaleProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">Aucune promotion pour le moment</h2>
          <p className="mt-2 text-muted-foreground">Revenez bientôt pour découvrir nos offres !</p>
        </div>
      )}
    </div>
  );
}
