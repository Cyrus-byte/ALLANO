
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/contexts/wishlist-context';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselIndicator } from '@/components/ui/carousel';
import { useEffect, useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isProductInWishlist = isInWishlist(product.id);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (product.onSale && product.promotionEndDate) {
      const intervalId = setInterval(() => {
        const now = new Date();
        const endDate = product.promotionEndDate.toDate ? product.promotionEndDate.toDate() : new Date(product.promotionEndDate);
        const diff = endDate.getTime() - now.getTime();

        if (diff <= 0) {
          setCountdown('Promotion terminée');
          clearInterval(intervalId);
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setCountdown(`${days}j ${hours}h ${minutes}m ${seconds}s`);

      }, 1000); 

      return () => clearInterval(intervalId);
    }
  }, [product.onSale, product.promotionEndDate]);


  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };
  
  const ratingAverage = product.rating || 0;
  const salePercentage = product.onSale && product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;


  return (
    <Link href={`/product/${product.id}`} className="group relative flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-[4/5] overflow-hidden">
            <Carousel
              opts={{
                loop: true,
              }}
              className="w-full h-full"
            >
              <CarouselContent>
                {product.images.map((imgSrc, index) => (
                  <CarouselItem key={index}>
                    <div className="relative w-full h-full aspect-[4/5]">
                        <Image
                            src={imgSrc}
                            alt={`${product.name} image ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                            data-ai-hint="product image"
                        />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="absolute bottom-2 left-0 right-0">
                  <CarouselIndicator />
              </div>
            </Carousel>

             {product.onSale && salePercentage > 0 && (
                 <Badge className="absolute top-2 left-2 z-10" variant="destructive">-{salePercentage}%</Badge>
             )}
             {product.isNew && !product.onSale && (
                <Badge className="absolute top-2 left-2 z-10" variant="secondary">Nouveau</Badge>
             )}
            <button
                className="absolute top-2 right-2 h-9 w-9 z-10 rounded-full flex items-center justify-center bg-background/60 backdrop-blur-sm text-foreground hover:bg-background transition-colors"
                onClick={handleWishlistClick}
                aria-label="Ajouter aux favoris"
            >
                <Heart className={cn("h-5 w-5", isProductInWishlist ? "fill-red-500 text-red-500" : "text-foreground")} />
            </button>
        </div>
      
      <div className="p-2 flex flex-col flex-grow">
         <h3 className="font-medium text-sm leading-tight text-foreground mb-1 flex-grow">
            <span className="hover:underline line-clamp-2">
                {product.name}
            </span>
        </h3>

        <div className="mt-auto space-y-1">
           {ratingAverage > 0 && (
                <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-semibold">{ratingAverage.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({product.reviews} avis)</span>
                </div>
            )}
        
            <div className="flex flex-col">
                <p className={cn("font-bold", product.onSale && "text-destructive")}>
                    {(product.onSale && product.salePrice ? product.salePrice.toLocaleString('fr-FR') : product.price.toLocaleString('fr-FR'))} FCFA
                </p>
                {product.onSale && (
                    <p className="text-sm text-muted-foreground line-through">
                        {product.price.toLocaleString('fr-FR')} FCFA
                    </p>
                )}
            </div>

            {product.onSale && countdown && (
                <div className="text-xs text-center text-red-600 font-medium bg-red-100 py-1 rounded-sm">
                    {countdown}
                </div>
            )}
        </div>

      </div>
    </Link>
  );
}
