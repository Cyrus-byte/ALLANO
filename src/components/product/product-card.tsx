
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/contexts/wishlist-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isProductInWishlist = isInWishlist(product.id);
  const [timeLeft, setTimeLeft] = useState<{
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
  }>({});
  
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };
  
    useEffect(() => {
    if (!product.onSale || !product.promotionEndDate) {
      return;
    }

    const endDate = new Date(product.promotionEndDate);
    const interval = setInterval(() => {
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({});
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [product.onSale, product.promotionEndDate]);


  const ratingAverage = product.rating || 0;
  const salePercentage = product.onSale && product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  const showBadge = product.isNew || salePercentage > 0;


  return (
    <Link 
      href={`/product/${product.id}`} 
      className="group relative flex flex-col bg-card text-card-foreground rounded-lg shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 animate-fade-in-slide-up overflow-hidden"
      style={{ animationFillMode: 'backwards' }}
    >
        <div className="relative aspect-[4/5] w-full overflow-hidden">
            <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                data-ai-hint="product image"
            />

            {showBadge && (
                 <Badge className="absolute top-2 left-2 z-10" variant={product.onSale ? "destructive" : "secondary"}>
                    {product.onSale ? `-${salePercentage}%` : "Nouveau"}
                 </Badge>
            )}

            <Button
                size="icon"
                className="absolute top-2 right-2 h-9 w-9 z-10 rounded-full flex items-center justify-center bg-background/60 backdrop-blur-sm text-foreground hover:bg-background/80 transition-colors"
                onClick={handleWishlistClick}
                aria-label="Ajouter aux favoris"
            >
                <Heart className={cn("h-5 w-5", isProductInWishlist ? "fill-red-500 text-red-500" : "text-foreground")} />
            </Button>
        </div>
      
      <div className="flex flex-col p-3 space-y-2">
         <h3 className="font-semibold text-sm leading-tight text-foreground line-clamp-2 min-h-[40px]">
            {product.name}
        </h3>

        <div className="min-h-[20px]">
            {product.onSale && timeLeft.days !== undefined ? (
                 <div className="text-xs text-destructive font-medium tabular-nums">
                    Fin promo: {String(timeLeft.days).padStart(2, '0')}j {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m
                </div>
            ) : null}

            {ratingAverage > 0 ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn("h-4 w-4", ratingAverage > i ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                        ))}
                    </div>
                    {product.reviews > 0 && <span className="font-semibold text-foreground">({product.reviews})</span>}
                </div>
            ) : (product.onSale && timeLeft.days !== undefined) ? null : (<div className="h-5" />)
            }
        </div>
        
        <div className="mt-auto pt-1">
             <p className="font-bold text-lg text-orange-vif">
                {(product.onSale && product.salePrice ? product.salePrice.toLocaleString('fr-FR') : product.price.toLocaleString('fr-FR'))} FCFA
            </p>
            {product.onSale && (
                <p className="text-sm text-muted-foreground line-through">
                    {product.price.toLocaleString('fr-FR')} FCFA
                </p>
            )}
        </div>
      </div>
    </Link>
  );
}
