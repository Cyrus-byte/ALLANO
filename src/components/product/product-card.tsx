
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/contexts/wishlist-context';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isProductInWishlist = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  }

  return (
    <Card className="overflow-hidden border-0 shadow-none bg-transparent group">
        <Link href={`/product/${product.id}`} aria-label={product.name}>
            <CardContent className="p-0">
                <div className="relative aspect-[3/4] overflow-hidden rounded-md">
                    <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="product image"
                    />
                    
                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/70 hover:bg-background"
                        aria-label="Ajouter aux favoris"
                        onClick={handleWishlistClick}
                    >
                        <Heart className={cn("h-4 w-4", isProductInWishlist ? "fill-red-500 text-red-500" : "")} />
                    </Button>

                    {product.isNew && !product.onSale && (
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
        </Link>
        <CardFooter className="flex-col items-start p-2 pt-3">
            <h3 className="font-semibold text-sm truncate w-full">{product.name}</h3>
            <div className="flex justify-between items-center w-full mt-1">
                <div className="flex flex-col items-start">
                    <p className={cn("font-bold", product.onSale && "text-destructive")}>
                        {(product.onSale && product.salePrice ? product.salePrice.toLocaleString('fr-FR') : product.price.toLocaleString('fr-FR'))} FCFA
                    </p>
                    {product.onSale && (
                        <p className="text-sm text-muted-foreground line-through">
                        {product.price.toLocaleString('fr-FR')} FCFA
                        </p>
                    )}
                </div>
                 <Button asChild size="icon" className="h-9 w-9 shrink-0" aria-label="Ajouter au panier">
                    <Link href={`/product/${product.id}`}>
                        <ShoppingCart className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
      </CardFooter>
    </Card>
  );
}
