
"use client";

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Star, Minus, Plus, Heart, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';

interface ProductQuickViewProps {
  product: Product;
  children: React.ReactNode;
}

export function ProductQuickView({ product, children }: ProductQuickViewProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(product.colors?.[0]?.name || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [selectedThumb, setSelectedThumb] = useState(0);

  const isProductInWishlist = isInWishlist(product.id);
  const allSizes = [...(product.sizes || []), ...(product.shoeSizes || [])];

  const onThumbClick = useCallback((index: number) => {
    if (!mainApi || !thumbApi) return;
    mainApi.scrollTo(index);
  }, [mainApi, thumbApi]);

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return;
    setSelectedThumb(mainApi.selectedScrollSnap());
    thumbApi.scrollTo(mainApi.selectedScrollSnap());
  }, [mainApi, thumbApi]);

  const handleColorSelect = (color: Product['colors'][0]) => {
    setSelectedColor(color.name);
    if (color.imageUrl) {
        const imageIndex = product.images.findIndex(img => img === color.imageUrl);
        if (imageIndex !== -1 && mainApi) {
            mainApi.scrollTo(imageIndex);
        }
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if ((allSizes.length > 0 && !selectedSize) || !selectedColor) {
        toast({
            title: "Sélection requise",
            description: "Veuillez sélectionner une taille et une couleur.",
            variant: "destructive"
        })
        return;
    }
    addToCart(product, selectedSize || 'unique', selectedColor, quantity);
  };
  
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  }

  const handleDialogTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const currentPrice = (product.onSale && product.salePrice) ? product.salePrice : product.price;

  return (
    <Dialog>
      <DialogTrigger asChild onClick={handleDialogTriggerClick}>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div className="p-6 flex flex-col gap-4">
            <Carousel setApi={setMainApi} className="w-full group">
              <CarouselContent>
                {product.images.map((img, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                      <Image src={img} alt={`${product.name} image ${index + 1}`} fill className="object-cover" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
             <Carousel setApi={setThumbApi} opts={{ align: "start", slidesToScroll: 1, dragFree: true, containScroll: 'keepSnaps' }} className="w-full">
                <CarouselContent className="-ml-2">
                    {product.images.map((img, index) => (
                    <CarouselItem key={index} className="pl-2 basis-1/5">
                       <button
                            onClick={() => onThumbClick(index)}
                            className={cn(
                            "relative aspect-square w-full rounded-lg overflow-hidden ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring",
                            selectedThumb === index && "ring-2 ring-primary"
                            )}
                        >
                            <Image src={img} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" />
                        </button>
                    </CarouselItem>
                ))}
                </CarouselContent>
            </Carousel>
          </div>
          {/* Product Details */}
          <div className="p-6 flex flex-col">
             <DialogHeader className="mb-4">
                 <DialogTitle className="text-2xl font-bold font-headline">{product.name}</DialogTitle>
             </DialogHeader>

            <div className="flex items-baseline gap-4">
                <p className={cn("text-2xl font-bold", product.onSale && "text-destructive")}>
                    {currentPrice.toLocaleString('fr-FR')} FCFA
                </p>
                {product.onSale && (
                    <p className="text-lg text-muted-foreground line-through">
                        {product.price.toLocaleString('fr-FR')} FCFA
                    </p>
                )}
            </div>

            <p className="text-muted-foreground mt-2 text-sm">{product.description}</p>
            <Separator className="my-4" />

            <div className="flex-grow space-y-4">
                {/* Color Options */}
                <div>
                    <h3 className="text-sm font-medium">Couleur: <span className="font-bold">{selectedColor}</span></h3>
                    <div className="flex items-center gap-2 mt-2">
                    {product.colors.map(color => (
                        <button
                        key={color.name}
                        onClick={() => handleColorSelect(color)}
                        className={cn(
                            "h-8 w-8 rounded-full border-2 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring",
                            selectedColor === color.name ? "ring-2 ring-primary" : "border-transparent"
                        )}
                        style={{ backgroundColor: color.hex }}
                        aria-label={`Select color ${color.name}`}
                        />
                    ))}
                    </div>
                </div>

                {/* Size Options */}
                {allSizes.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium">Taille:</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                        {allSizes.map(size => (
                            <Button
                            key={size}
                            variant={selectedSize === size ? 'default' : 'outline'}
                            onClick={() => setSelectedSize(size)}
                            className="w-16"
                            >
                            {size}
                            </Button>
                        ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Actions */}
            <div className="mt-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-md">
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                    </div>
                    <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-5 w-5" /> Ajouter au panier
                    </Button>
                    <Button variant="outline" size="icon" aria-label="Ajouter aux favoris" onClick={handleWishlistClick}>
                        <Heart className={cn("h-5 w-5", isProductInWishlist ? "fill-orange-500 text-orange-500" : "")} />
                    </Button>
                </div>
                 <Button variant="link" asChild className="mt-4 w-full">
                    <Link href={`/product/${product.id}`}>Voir la page complète du produit</Link>
                </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
