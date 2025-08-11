
"use client";

import { useState, useEffect } from 'react';
import { ProductCard } from './product-card';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Wand2 } from 'lucide-react';
import { getProductRecommendations } from '@/ai/flows/product-recommendation';
import { useAuth } from '@/contexts/auth-context';
import { getProducts } from '@/lib/product-service';

export function ProductRecommendations() {
  const { user, loading: authLoading } = useAuth();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const result = await getProductRecommendations({
          userId: user.uid,
          browsingHistory: ['Robe d\'été florale', 'Sandales en cuir'],
          pastPurchases: ['Chemise en lin'],
        });
        
        const allProducts = await getProducts();
        const recommendedProducts = allProducts.filter(p => result.recommendations.includes(p.name));
        setRecommendations(recommendedProducts);
      } catch (err: any) {
        if (err.message?.includes('429')) {
          // Quota exceeded, fail silently.
        } else {
          console.error("Erreur lors de la récupération des recommandations:", err);
        }
        setError("Impossible de charger les recommandations pour le moment.");
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    }
    
    if(!authLoading) {
        fetchRecommendations();
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <section className="py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline mb-8 flex items-center gap-2">
            <Wand2 className="text-primary" /> Pour vous
        </h2>
        <div className="sm:columns-2 md:columns-3 lg:columns-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="break-inside-avoid mb-4">
                    <Skeleton className="aspect-[3/4] w-full" />
                    <Skeleton className="h-5 w-3/4 mt-4" />
                    <Skeleton className="h-5 w-1/2 mt-2" />
                </div>
            ))}
        </div>
      </section>
    );
  }

  if (!user || loading || error || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline mb-8 flex items-center gap-2">
        <Wand2 className="text-primary" /> Pour vous
      </h2>
      <div className="sm:columns-2 md:columns-3 lg:columns-4 gap-4">
        {recommendations.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
