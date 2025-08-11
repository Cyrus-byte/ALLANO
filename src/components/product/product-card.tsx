
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/contexts/wishlist-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  };
  
  const ratingAverage = product.rating || 0;
  const salePercentage = product.onSale && product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  const showBadge = product.isNew || salePercentage > 0;


  return (
    <Link 
      href={`/product/${product.id}`} 
      className="group relative flex flex-col bg-card text-card-foreground rounded-lg shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 animate-fade-in-slide-up"
      style={{ animationFillMode: 'backwards' }}
    >
        <div className="relative overflow-hidden rounded-t-lg">
            {/* Image Container */}
            <div className="aspect-[4/5] overflow-hidden">
                 <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                    data-ai-hint="product image"
                />
            </div>

            {/* Badges */}
            {showBadge && (
                 <Badge className="absolute top-2 left-2 z-10" variant={product.onSale ? "destructive" : "secondary"}>
                    {product.onSale ? `-${salePercentage}%` : "Nouveau"}
                 </Badge>
            )}

            {/* Wishlist Button */}
            <Button
                size="icon"
                className="absolute top-2 right-2 h-9 w-9 z-10 rounded-full flex items-center justify-center bg-background/60 backdrop-blur-sm text-foreground hover:bg-background/80 transition-colors"
                onClick={handleWishlistClick}
                aria-label="Ajouter aux favoris"
            >
                <Heart className={cn("h-5 w-5", isProductInWishlist ? "fill-red-500 text-red-500" : "text-foreground")} />
            </Button>

            {/* Floating Cart Button */}
            <Button size="icon" className="absolute -bottom-4 right-4 h-10 w-10 z-20 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
                <ShoppingCart className="h-5 w-5"/>
            </Button>
        </div>
      
      {/* Content Below Image */}
      <div className="flex flex-col flex-grow p-3 space-y-2 rounded-b-lg">
         <h3 className="font-semibold text-sm leading-tight text-foreground line-clamp-2 flex-grow">
            {product.name}
        </h3>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
           {ratingAverage > 0 && (
                <>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-foreground">{ratingAverage.toFixed(1)}</span>
                    <span>({product.reviews})</span>
                    <span className="text-gray-300">|</span>
                </>
            )}
            <span>{Math.floor(Math.random() * 500) + 20} vendus</span>
        </div>
        
        <div className="flex items-baseline gap-2">
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
