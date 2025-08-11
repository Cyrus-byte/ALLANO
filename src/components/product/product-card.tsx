"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/contexts/wishlist-context';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const isProductInWishlist = isInWishlist(product.id);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (product.onSale && product.promotionEndDate) {
      const interval = setInterval(() => {
        const now = new Date();
        // The promotionEndDate can be a Firestore Timestamp or a Date object
        const endDate = product.promotionEndDate.toDate ? product.promotionEndDate.toDate() : new Date(product.promotionEndDate);
        const diff = endDate.getTime() - now.getTime();

        if (diff <= 0) {
          setCountdown('Promotion terminée');
          clearInterval(interval);
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        setCountdown(`${days}j ${hours}h ${minutes}m`);

      }, 1000);

      return () => clearInterval(interval);
    }
  }, [product.onSale, product.promotionEndDate]);


  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const color = product.colors[0]?.name;
    const size = product.sizes[0] || product.shoeSizes?.[0] || 'unique';
    if(!color) {
        toast({ title: "Erreur", description: "Impossible d'ajouter ce produit au panier.", variant: "destructive"});
        return;
    }
    addToCart(product, size, color, 1);
  };
  
  const ratingAverage = product.rating || 0;
  const salePercentage = product.onSale && product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;


  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg shadow-sm bg-card transition-transform duration-300 ease-in-out hover:-translate-y-1">
       <Link href={`/product/${product.id}`} className="block">
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
                 <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                    data-ai-hint="product image"
                />
                 {product.onSale && salePercentage > 0 && (
                     <Badge className="absolute top-2 left-2" variant="destructive">-{salePercentage}%</Badge>
                 )}
                 {product.isNew && !product.onSale && (
                    <Badge className="absolute top-2 left-2" variant="secondary">Nouveau</Badge>
                 )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 bg-transparent text-white drop-shadow-md hover:bg-black/20"
                    onClick={handleWishlistClick}
                    aria-label="Ajouter aux favoris"
                >
                    <Heart className={cn("h-5 w-5", isProductInWishlist ? "fill-red-500 text-red-500" : "fill-black/30 text-white")} />
                </Button>
            </div>
      </Link>
      
      <div className="p-2 flex-1 flex flex-col">
         <h3 className="font-medium text-sm leading-tight text-foreground flex-1">
             <Link href={`/product/${product.id}`} className="hover:underline line-clamp-2">
                {product.name}
            </Link>
        </h3>

        <div className="mt-1">
           {ratingAverage > 0 && (
                <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-semibold">{ratingAverage.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({product.reviews} avis)</span>
                </div>
            )}
        </div>
        
        <div className="mt-1">
            <div className="flex items-baseline gap-2">
                 <p className="font-bold text-lg text-destructive">
                    {(product.onSale && product.salePrice ? product.salePrice.toLocaleString('fr-FR') : product.price.toLocaleString('fr-FR'))} FCFA
                </p>
                {product.onSale && (
                    <p className="text-sm text-muted-foreground line-through">
                        {product.price.toLocaleString('fr-FR')} FCFA
                    </p>
                )}
            </div>
        </div>

         {product.onSale && countdown && (
            <div className="mt-1 text-xs text-center text-red-600 font-medium bg-red-100 py-1 rounded-sm">
                {countdown}
            </div>
        )}

      </div>
      <div className="p-2 border-t">
        <Button size="sm" className="w-full" asChild>
            <Link href={`/product/${product.id}`}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Voir les options
            </Link>
        </Button>
      </div>
    </div>
  );
}
