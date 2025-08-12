
"use client";

import { useState, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { getProducts } from '@/lib/product-service';
import { ProductCard } from './product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

interface SimilarProductsProps {
  product: Product;
}

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


export function SimilarProducts({ product }: SimilarProductsProps) {
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      setLoading(true);
      try {
        const allProducts = await getProducts();
        const filtered = allProducts
          .filter(p => p.category === product.category && p.id !== product.id)
          .slice(0, 4); // Limit to 4 similar products for a clean look
        setSimilarProducts(filtered);
      } catch (error) {
        console.error("Failed to fetch similar products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [product.category, product.id]);

  if (loading) {
    return (
        <section className="py-12 md:py-16">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline mb-8">Vous pourriez aussi aimer</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                        <Skeleton className="aspect-[3/4] w-full" />
                        <Skeleton className="h-5 w-3/4 mt-4" />
                        <Skeleton className="h-5 w-1/2 mt-2" />
                    </div>
                ))}
            </div>
      </section>
    )
  }

  if (similarProducts.length === 0) {
    return null; // Don't show the section if there are no similar products
  }

  return (
    <section className="py-12 md:py-16">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Vous pourriez aussi aimer</h2>
             <Button variant="link" asChild className="text-primary">
              <Link href={`/category/${slugify(product.category)}`}>
                Voir toute la catégorie <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {similarProducts.map(p => (
                <ProductCard key={p.id} product={p} />
            ))}
        </div>
    </section>
  );
}
