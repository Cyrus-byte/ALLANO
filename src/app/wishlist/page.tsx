
"use client";

import { useWishlist } from '@/contexts/wishlist-context';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">Ma Liste de Souhaits</h1>
      {wishlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {wishlist.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Heart className="mx-auto h-24 w-24 text-muted-foreground" />
          <h2 className="mt-4 text-2xl font-bold">Votre liste de souhaits est vide</h2>
          <p className="mt-2 text-muted-foreground">Cliquez sur le coeur pour ajouter des articles.</p>
           <Button asChild className="mt-6">
            <Link href="/">Parcourir les produits</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
