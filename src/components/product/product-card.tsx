
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/contexts/wishlist-context';
import { Carousel, CarouselContent, CarouselItem, CarouselIndicator } from '@/components/ui/carousel';
import { useEffect, useState } from 'react';

interface ProductCardProps {
  product: Product;
}

function Countdown({ endDate }: { endDate: any }) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!endDate) return;

        const calculateTimeLeft = () => {
            const difference = new Date(endDate).getTime() - new Date().getTime();
            
            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                
                let timerString = '';
                if(days > 0) timerString += `${days}j `;
                if(hours > 0) timerString += `${hours}h `;
                timerString += `${minutes}m`;

                setTimeLeft(timerString);
            } else {
                setTimeLeft("Offre terminée");
            }
        };

        const timer = setInterval(calculateTimeLeft, 60000); // Mettre à jour toutes les minutes
        calculateTimeLeft();

        return () => clearInterval(timer);
    }, [endDate]);

    if (!timeLeft || timeLeft === "Offre terminée") return null;

    return (
        <div className="flex items-center text-xs text-destructive mt-1">
            <Clock className="mr-1 h-3 w-3" />
            <span>Finit dans {timeLeft}</span>
        </div>
    );
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

  const ratingAverage = product.reviews > 0 ? product.rating : 0;

  return (
    <Card className="group relative flex flex-col h-full overflow-hidden rounded-lg">
        <div className="relative aspect-[3/4] overflow-hidden">
            <Carousel
                opts={{ align: "start", loop: true, }}
                className="w-full h-full"
            >
                <CarouselContent>
                    {product.images.map((img, index) => (
                        <CarouselItem key={index}>
                            <Link href={`/product/${product.id}`} aria-label={product.name}>
                                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                                    <Image
                                        src={img}
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
                <div className="absolute bottom-2 left-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CarouselIndicator />
                </div>
            </Carousel>
            
            {discountPercentage > 0 && (
                 <div className="absolute top-2 left-2 bg-destructive/90 text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md z-10">
                    -{discountPercentage}%
                </div>
            )}
             <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-9 w-9 bg-background/50 backdrop-blur-sm rounded-full text-foreground hover:bg-background/70"
                onClick={handleWishlistClick}
                aria-label="Ajouter aux favoris"
            >
                <Heart className={cn("h-5 w-5", isProductInWishlist ? "fill-red-500 text-red-500" : "text-foreground")} />
            </Button>
        </div>
        
        <div className="p-3 flex-1 flex flex-col">
            <h3 className="font-semibold text-sm leading-tight flex-1">
                 <Link href={`/product/${product.id}`} className="hover:underline">
                    {product.name}
                </Link>
            </h3>
            {ratingAverage > 0 && (
                <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("h-4 w-4", i < Math.round(ratingAverage) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                    ))}
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                </div>
            )}
            <div className="mt-2 flex items-baseline gap-2">
                 <p className={cn("font-bold text-base", product.onSale && "text-destructive")}>
                    {(product.onSale && product.salePrice ? product.salePrice.toLocaleString('fr-FR') : product.price.toLocaleString('fr-FR'))} FCFA
                </p>
                {product.onSale && (
                    <p className="text-xs text-muted-foreground line-through">
                        {product.price.toLocaleString('fr-FR')} FCFA
                    </p>
                )}
            </div>
            
            {product.onSale && product.promotionEndDate && <Countdown endDate={product.promotionEndDate} />}
        </div>
        
        <CardFooter className="p-0 border-t mt-auto">
           <Link href={`/product/${product.id}`} className="w-full">
                <Button variant="ghost" className="w-full h-9 text-sm rounded-t-none">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Voir le produit
                </Button>
            </Link>
        </CardFooter>
    </Card>
  );
}
