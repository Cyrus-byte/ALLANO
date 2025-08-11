
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

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const isProductInWishlist = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // For simplicity, we add the first available color/size. 
    // A real implementation would open a quick view modal.
    const color = product.colors[0]?.name;
    const size = product.sizes[0] || product.shoeSizes?.[0] || 'unique';
    if(!color) {
        toast({ title: "Erreur", description: "Impossible d'ajouter ce produit au panier.", variant: "destructive"});
        return;
    }
    addToCart(product, size, color, 1);
  };
  
  const ratingAverage = product.reviews > 0 ? product.rating : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg shadow-sm bg-card transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/product/${product.id}`} aria-label={product.name}>
        <div className="relative aspect-[3/4] overflow-hidden">
            <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                data-ai-hint="product image"
            />
            {product.isNew && (
                <Badge className="absolute top-2 left-2" variant="secondary">Nouveau</Badge>
            )}
            <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-2 right-2 h-10 w-10 bg-background/70 backdrop-blur-sm rounded-full text-foreground hover:bg-background"
                onClick={handleCartClick}
                aria-label="Ajouter au panier"
            >
                <ShoppingCart className="h-5 w-5" />
            </Button>
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
      
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-medium text-sm leading-tight text-foreground line-clamp-2 flex-1">
             <Link href={`/product/${product.id}`} className="hover:underline">
                {product.name}
            </Link>
        </h3>
        <div className="mt-2">
            <div className="flex items-baseline gap-2">
                 <p className="font-bold text-lg text-orange-500">
                    {(product.onSale && product.salePrice ? product.salePrice.toLocaleString('fr-FR') : product.price.toLocaleString('fr-FR'))} FCFA
                </p>
                {product.onSale && (
                    <p className="text-sm text-muted-foreground line-through">
                        {product.price.toLocaleString('fr-FR')} FCFA
                    </p>
                )}
            </div>
             {ratingAverage > 0 && (
                <div className="flex items-center gap-1.5 mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-semibold">{ratingAverage.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({product.reviews} avis)</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
