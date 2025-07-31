
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/contexts/wishlist-context';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { wishlist, toggleWishlist } = useWishlist();
  const isInWishlist = wishlist.some(item => item.id === product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  }

  return (
    <Card className="overflow-hidden border-0 shadow-none bg-transparent group">
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Link href={`/product/${product.id}`}>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="product image"
            />
          </Link>
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/70 hover:bg-background"
            aria-label="Ajouter aux favoris"
            onClick={handleWishlistClick}
          >
            <Heart className={cn("h-4 w-4", isInWishlist ? "fill-red-500 text-red-500" : "")} />
          </Button>
          {product.isNew && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
              NOUVEAU
            </div>
          )}
           {product.onSale && (
             <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
              PROMO
            </div>
           )}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm truncate w-full">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <p className={cn("font-bold", product.onSale && "text-destructive")}>
            {product.onSale ? product.salePrice?.toLocaleString() : product.price.toLocaleString()} FCFA
          </p>
          {product.onSale && (
            <p className="text-sm text-muted-foreground line-through">
              {product.price.toLocaleString()} FCFA
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>{product.rating}</span>
          <span>({product.reviews})</span>
        </div>
      </CardFooter>
    </Card>
  );
}
