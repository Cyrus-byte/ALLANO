
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

const CountdownTimer = ({ expiryDate }: { expiryDate: Date }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(expiryDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        jours: Math.floor(difference / (1000 * 60 * 60 * 24)),
        heures: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents: string[] = [];
  Object.entries(timeLeft).forEach(([interval, value]) => {
    if (value > 0) {
        timerComponents.push(`${value}${interval.charAt(0)}`);
    }
  });

  if (timerComponents.length === 0) {
    return <span className="text-xs text-destructive">Promotion terminée</span>;
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-destructive">
      <Clock className="h-3 w-3" />
      <span>Finit dans : {timerComponents.join(' ')}</span>
    </div>
  );
};


export function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isProductInWishlist = isInWishlist(product.id);
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return
    }
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])


   const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  }
  
  const discountPercentage = product.onSale && product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <Card className="overflow-hidden border-0 shadow-none bg-transparent group flex flex-col h-full">
      <CardContent className="p-0">
        <Carousel setApi={setApi} className="relative">
          <CarouselContent>
            {product.images.map((image, index) => (
              <CarouselItem key={index}>
                <Link href={`/product/${product.id}`} aria-label={product.name}>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-md">
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint="product image"
                    />
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute top-2 right-2 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/70 hover:bg-background"
              aria-label="Ajouter aux favoris"
              onClick={handleWishlistClick}
            >
              <Heart className={cn("h-4 w-4", isProductInWishlist ? "fill-orange-500 text-orange-500" : "")} />
            </Button>
          </div>
          {product.isNew && !product.onSale && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full z-10">
              NOUVEAU
            </div>
          )}
          {product.onSale && (
            <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full z-10">
              -{discountPercentage}%
            </div>
          )}
           <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                {product.images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => api?.scrollTo(index)}
                        className={cn('h-1.5 w-1.5 rounded-full bg-white/50 transition-all', current === index ? 'w-4 bg-white' : 'hover:bg-white/75')}
                    />
                ))}
            </div>
        </Carousel>
      </CardContent>
      <CardFooter className="flex-col items-start p-2 pt-3 flex-grow">
        <h3 className="font-semibold text-sm truncate w-full">{product.name}</h3>
        
        {product.reviews > 0 && (
            <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("h-4 w-4", i < product.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                ))}
                 <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
            </div>
        )}

        <div className="flex items-baseline gap-2 mt-2">
            <p className={cn("font-bold", product.onSale && "text-destructive")}>
            {(product.onSale && product.salePrice ? product.salePrice.toLocaleString('fr-FR') : product.price.toLocaleString('fr-FR'))} FCFA
            </p>
            {product.onSale && (
            <p className="text-sm text-muted-foreground line-through">
                {product.price.toLocaleString('fr-FR')} FCFA
            </p>
            )}
        </div>
        
        {product.onSale && product.promotionEndDate && 
            <div className="mt-2">
                <CountdownTimer expiryDate={new Date(product.promotionEndDate)} />
            </div>
        }
        
        <div className="mt-auto pt-2 w-full">
            <Button asChild size="sm" variant="outline" className="w-full">
                <Link href={`/product/${product.id}`}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Voir le produit
                </Link>
            </Button>
        </div>

      </CardFooter>
    </Card>
  );
}
