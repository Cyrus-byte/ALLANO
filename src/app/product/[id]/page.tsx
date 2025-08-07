
"use client";

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { getProductById } from '@/lib/product-service';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Star, Minus, Plus, Heart, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductPage() {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const params = useParams();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const fetchedProduct = await getProductById(params.id as string);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          setMainImage(fetchedProduct.images[0] || '');
          if (fetchedProduct.colors && fetchedProduct.colors.length > 0) {
            setSelectedColor(fetchedProduct.colors[0].name);
            // If the first color has an associated image, set it as the main image
            if (fetchedProduct.colors[0].imageUrl) {
              setMainImage(fetchedProduct.colors[0].imageUrl);
            }
          }
        } else {
            notFound();
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };
    if(params.id) {
        fetchProduct();
    }
  }, [params.id]);


  if (loading || !product) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
                <div className="flex flex-col-reverse md:flex-row gap-4">
                    <div className="flex md:flex-col gap-2 justify-center">
                        <Skeleton className="w-16 h-20 rounded-lg" />
                        <Skeleton className="w-16 h-20 rounded-lg" />
                        <Skeleton className="w-16 h-20 rounded-lg" />
                    </div>
                    <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                </div>
                <div>
                    <Skeleton className="h-10 w-3/4 mb-4" />
                    <Skeleton className="h-6 w-1/4 mb-4" />
                    <Skeleton className="h-8 w-1/3 mb-4" />
                    <Skeleton className="h-20 w-full mb-6" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    );
  }

  const isProductInWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (selectedSize && selectedColor) {
      addToCart(product, selectedSize, selectedColor, quantity);
    } else {
        toast({
            title: "Sélection requise",
            description: "Veuillez sélectionner une taille et une couleur.",
            variant: "destructive"
        })
    }
  };
  
  const handleColorSelect = (color: Product['colors'][0]) => {
    setSelectedColor(color.name);
    if (color.imageUrl) {
        setMainImage(color.imageUrl);
    }
  }

  const currentPrice = (product.onSale && product.salePrice) ? product.salePrice : product.price;


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Image Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-2 justify-center">
            {product.images.map((img, index) => (
              <button
                key={index}
                className={cn(
                  "relative w-16 h-20 rounded-lg overflow-hidden ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring",
                  mainImage === img && "ring-2 ring-primary"
                )}
                onClick={() => setMainImage(img)}
              >
                <Image src={img} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
             {product.onSale && (
                <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1.5 rounded-full z-10">
                    PROMO
                </div>
             )}
            <Image src={mainImage} alt={product.name} fill className="object-cover" />
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline">{product.name}</h1>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={cn("h-5 w-5", i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
              ))}
            </div>
            <span className="text-muted-foreground text-sm">{product.reviews} avis</span>
          </div>
          
          <div className="flex items-baseline gap-4 mt-4">
            <p className={cn("text-3xl font-bold", product.onSale && "text-destructive")}>
                {currentPrice.toLocaleString('fr-FR')} FCFA
            </p>
            {product.onSale && (
                <p className="text-xl text-muted-foreground line-through">
                    {product.price.toLocaleString('fr-FR')} FCFA
                </p>
            )}
           </div>

          <p className="text-muted-foreground mt-4">{product.description}</p>
          <Separator className="my-6" />

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
          <div className="mt-6">
            <h3 className="text-sm font-medium">Taille:</h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {product.sizes.map(size => (
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

          {/* Actions */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={!selectedSize || !selectedColor}>
              <ShoppingCart className="mr-2 h-5 w-5" /> Ajouter au panier
            </Button>
            <Button variant="outline" size="icon" aria-label="Ajouter aux favoris" onClick={() => toggleWishlist(product)}>
              <Heart className={cn("h-5 w-5", isProductInWishlist ? "fill-red-500 text-red-500" : "")} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
