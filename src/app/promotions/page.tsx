
"use client";

import { useState, useEffect, useCallback } from 'react';
import { ProductCard } from '@/components/product/product-card';
import { ProductFilters } from '@/components/product/product-filters';
import { getProducts } from '@/lib/product-service';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function PromotionsPage() {
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const fetchedProducts = await getProducts({ onSale: true });
        setInitialProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch sale products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  
  const handleFilterChange = useCallback((newFilteredProducts: Product[]) => {
    setFilteredProducts(newFilteredProducts);
  }, []);


  if (loading) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <Skeleton className="h-12 w-1/3 mb-8" />
            <div className="grid md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <Skeleton className="h-96 w-full" />
                </div>
                <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i}>
                            <Skeleton className="aspect-[3/4] w-full" />
                            <Skeleton className="h-5 w-3/4 mt-4" />
                            <Skeleton className="h-5 w-1/2 mt-2" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid md:grid-cols-4 gap-8">
            <aside className="md:col-span-1">
                <ProductFilters products={initialProducts} onFilterChange={handleFilterChange} />
            </aside>
            <main className="md:col-span-3">
                 <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">Promotions</h1>
                 <p className="text-muted-foreground mb-8">
                    {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} en promotion
                 </p>
                {filteredProducts.length > 0 ? (
                    <div className="sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                    <h2 className="text-2xl font-bold">Aucune promotion pour le moment</h2>
                    <p className="mt-2 text-muted-foreground">Revenez bientôt pour découvrir nos offres !</p>
                    </div>
                )}
            </main>
        </div>
    </div>
  );
}
