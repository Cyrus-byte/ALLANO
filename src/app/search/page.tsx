
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product/product-card';
import { getProducts } from '@/lib/product-service';
import type { Product } from '@/lib/types';
import { SearchX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterProducts = async () => {
      setLoading(true);
      try {
        const allProducts = await getProducts();
        if (query) {
            const lowerCaseQuery = query.toLowerCase();
            const results = allProducts.filter(product =>
                product.name.toLowerCase().includes(lowerCaseQuery) ||
                product.description.toLowerCase().includes(lowerCaseQuery) ||
                product.category.toLowerCase().includes(lowerCaseQuery)
            );
            setFilteredProducts(results);
        } else {
            setFilteredProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch products for search:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAndFilterProducts();
  }, [query]);

  if (loading) {
    return (
        <div>
            <Skeleton className="h-10 w-1/3 mb-2" />
            <Skeleton className="h-5 w-1/4 mb-8" />
            <div className="sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="break-inside-avoid mb-4">
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
    <div>
        <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">
            Résultats de recherche
        </h1>
        <p className="text-muted-foreground mb-8">
            {filteredProducts.length} résultat{filteredProducts.length > 1 ? 's' : ''} pour "{query}"
        </p>

        {filteredProducts.length > 0 ? (
            <div className="sm:columns-2 md:columns-3 lg:columns-4 gap-4">
            {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
            </div>
        ) : (
            <div className="text-center py-16">
            <SearchX className="mx-auto h-24 w-24 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-bold">Aucun résultat trouvé</h2>
            <p className="mt-2 text-muted-foreground">
                Nous n'avons trouvé aucun produit correspondant à votre recherche.
            </p>
            </div>
        )}
    </div>
  );
}

export default function SearchPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <Suspense fallback={<div>Chargement...</div>}>
                <SearchResults />
            </Suspense>
        </div>
    )
}
