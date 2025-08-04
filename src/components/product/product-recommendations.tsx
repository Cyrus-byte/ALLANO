
"use client";

import { useState, useEffect } from 'react';
import { ProductCard } from './product-card';
import { PRODUCTS } from '@/lib/data';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Wand2 } from 'lucide-react';
import { getProductRecommendations } from '@/ai/flows/product-recommendation';
import { useAuth } from '@/contexts/auth-context';

export function ProductRecommendations() {
  const { user, loading: authLoading } = useAuth();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Dans une future version, l'historique de navigation et les achats passés
        // pourraient être récupérés depuis la base de données.
        const result = await getProductRecommendations({
          userId: user.uid,
          browsingHistory: ['Robe d\'été florale', 'Sandales en cuir'],
          pastPurchases: ['T-shirt en coton bio'],
        });
        
        // Le flux renvoie des noms de produits. Nous trouvons les objets produits complets.
        const recommendedProducts = PRODUCTS.filter(p => result.recommendations.includes(p.name));
        setRecommendations(recommendedProducts);
      } catch (error) {
        console.error("Erreur lors de la récupération des recommandations:", error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    }
    
    if(!authLoading) {
        fetchRecommendations();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    // Affiche un squelette de chargement uniquement si un utilisateur est potentiellement connecté
    return !authLoading && !user ? null : (
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

  if (!user || recommendations.length === 0) {
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
