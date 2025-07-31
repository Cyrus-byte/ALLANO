"use client";

import { useState, useEffect } from 'react';
import { runFlow } from '@genkit-ai/next/client';
import { getProductRecommendations } from '@/ai/flows/product-recommendation';
import { ProductCard } from './product-card';
import { PRODUCTS } from '@/lib/data';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Wand2 } from 'lucide-react';

export function ProductRecommendations() {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        // In a real app, user data would come from session/context
        const result = await runFlow(getProductRecommendations, {
          userId: 'user-123',
          browsingHistory: ['Robe d\'été florale', 'Sandales en cuir'],
          pastPurchases: ['T-shirt en coton bio'],
        });
        
        // The flow returns product names or IDs. We find the full product objects.
        const recommendedProducts = PRODUCTS.filter(p => result.recommendations.includes(p.name));
        setRecommendations(recommendedProducts);
      } catch (error) {
        console.error("Erreur lors de la récupération des recommandations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <section className="py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline mb-8 flex items-center gap-2">
            <Wand2 className="text-primary" /> Pour vous
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                    <Skeleton className="aspect-[3/4] w-full" />
                    <Skeleton className="h-5 w-3/4 mt-4" />
                    <Skeleton className="h-5 w-1/2 mt-2" />
                </div>
            ))}
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline mb-8 flex items-center gap-2">
        <Wand2 className="text-primary" /> Pour vous
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
        {recommendations.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
