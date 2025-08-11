
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import { ProductCard } from '@/components/product/product-card';
import { ProductFilters } from '@/components/product/product-filters';
import { getProducts } from '@/lib/product-service';
import type { Product } from '@/lib/types';
import { SearchX, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';


const slugify = (text: string) =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const fetchedProducts = await getProducts();
        
        const allCategories = [...new Set(fetchedProducts.map(p => p.category))];
        const foundCategoryName = allCategories.find(cat => slugify(cat) === slug);

        if (foundCategoryName) {
          setCategoryName(foundCategoryName);
          const categoryProducts = fetchedProducts.filter(p => p.category === foundCategoryName);
          setInitialProducts(categoryProducts);
          setFilteredProducts(categoryProducts);
        } else {
          setCategoryName(null);
          setInitialProducts([]);
          setFilteredProducts([]);
        }

      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
        fetchProducts();
    }
  }, [slug]);

  const handleFilterChange = useCallback((newFilteredProducts: Product[]) => {
    setFilteredProducts(newFilteredProducts);
  }, []);


  if (loading) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <Skeleton className="h-8 w-48 mb-8" />
            <Skeleton className="h-10 w-1/3 mb-2" />
            <Skeleton className="h-5 w-1/4 mb-8" />
             <div className="grid md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <Skeleton className="h-96 w-full" />
                </div>
                <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                    {Array.from({ length: 6 }).map((_, i) => (
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

  if (!categoryName) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <Button asChild variant="ghost" className="pl-0">
          <Link href="/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Toutes les catégories
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <ProductFilters products={initialProducts} onFilterChange={handleFilterChange} />
        </aside>
        
        <main className="md:col-span-3">
            <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">
                {categoryName}
            </h1>
            <p className="text-muted-foreground mb-8">
                {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
            </p>

            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
                </div>
            ) : (
                <div className="text-center py-16">
                <SearchX className="mx-auto h-24 w-24 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-bold">Aucun produit trouvé</h2>
                <p className="mt-2 text-muted-foreground">
                    Essayez d'ajuster vos filtres pour trouver ce que vous cherchez.
                </p>
                </div>
            )}
        </main>
      </div>
    </div>
  );
}
