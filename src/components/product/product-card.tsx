
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/contexts/wishlist-context';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useEffect, useState } from 'react';

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
  
  const discountPercentage = product.onSale && product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col h-full">
        <Link href={`/product/${product.id}`} aria-label={product.name}>
            <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
                 <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="product image"
                />

                {discountPercentage > 0 && (
                     <div className="absolute top-2 left-2 bg-destructive/90 text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md z-10">
                        -{discountPercentage}%
                    </div>
                )}
                 
                 <div className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        size="icon"
                        className="h-9 w-9 rounded-full bg-background/80 text-foreground hover:bg-background shadow-md"
                        aria-label="Ajouter au panier"
                    >
                        <ShoppingCart className="h-4 w-4" />
                    </Button>
                 </div>
            </div>
        </Link>
        
        <div className="flex-1 flex flex-col pt-2">
            <p className="font-bold text-lg">
                {(product.onSale && product.salePrice ? product.salePrice.toLocaleString('fr-FR') : product.price.toLocaleString('fr-FR'))} FCFA
            </p>
            {product.onSale && (
                <p className="text-sm text-muted-foreground line-through -mt-1">
                    {product.price.toLocaleString('fr-FR')} FCFA
                </p>
            )}
             <p className="text-sm text-muted-foreground truncate mt-1">{product.name}</p>
        </div>
    </div>
  );
}
