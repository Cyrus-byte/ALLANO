
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, Award, MapPin, AlarmClock } from 'lucide-react';
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
    <div className="group relative bg-card text-card-foreground shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg odd:-translate-y-2 mb-2 break-inside-avoid rounded-lg overflow-hidden">
      <Link href={`/product/${product.id}`} className="block">
        <div className="flex flex-col h-full">
            <div className="relative w-full overflow-hidden">
                <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={500}
                    height={625}
                    className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105 w-full h-auto"
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
        
            <div className="flex flex-col p-2">
                <h3 className="font-semibold text-sm leading-tight text-foreground line-clamp-2">
                    {product.name}
                </h3>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {product.isStarSeller && (
                        <Badge variant="outline" className="text-amber-600 border-amber-600 px-1.5 py-0 text-xs">
                           <Award className="mr-1 h-3 w-3" />
                           Star Seller
                        </Badge>
                    )}
                     {product.isLocal && (
                        <Badge variant="outline" className="text-green-600 border-green-600 px-1.5 py-0 text-xs">
                            <MapPin className="mr-1 h-3 w-3" />
                           Local
                        </Badge>
                    )}
                </div>
                {product.onSale && product.promotionEndDate && timeLeft.days !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-destructive font-medium tabular-nums">
                        <AlarmClock className="h-3 w-3"/>
                        <span>{String(timeLeft.days).padStart(2, '0')}j {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s</span>
                    </div>
                )}
                {product.reviews > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("h-4 w-4", ratingAverage > i ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                            ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({product.reviews})</span>
                    </div>
                )}
                <div className="leading-tight">
                    <p className={cn("font-bold text-base", product.onSale && "text-destructive")}>
                        {(product.onSale && product.salePrice ? product.salePrice.toLocaleString('fr-FR') : product.price.toLocaleString('fr-FR'))} FCFA
                    </p>
                    {product.onSale && (
                        <p className="text-xs text-muted-foreground line-through">
                            {product.price.toLocaleString('fr-FR')} FCFA
                        </p>
                    )}
                </div>
            </div>
        </div>
      </Link>
    </div>
  );
}
