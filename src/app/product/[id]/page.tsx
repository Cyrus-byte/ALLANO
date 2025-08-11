
"use client";

import { useState, useEffect, useCallback } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { getProductById } from '@/lib/product-service';
import type { Product, Review } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Star, Minus, Plus, Heart, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getReviewsByProductId, addReview } from '@/lib/review-service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';


function ProductReviews({ 
    productId, 
    onReviewsLoaded 
}: { 
    productId: string,
    onReviewsLoaded: (reviews: Review[]) => void
}) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const fetchedReviews = await getReviewsByProductId(productId);
                setReviews(fetchedReviews);
                onReviewsLoaded(fetchedReviews);
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [productId, onReviewsLoaded]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ title: "Connexion requise", description: "Vous devez être connecté pour laisser un avis.", variant: "destructive" });
            return;
        }
        if (newRating === 0 || !newComment) {
            toast({ title: "Champs requis", description: "Veuillez donner une note et un commentaire.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            const newReview = await addReview(productId, user.uid, user.displayName || 'Anonyme', newRating, newComment);
            const updatedReviews = [newReview, ...reviews];
            setReviews(updatedReviews);
            onReviewsLoaded(updatedReviews);
            setNewComment('');
            setNewRating(0);
            toast({ title: "Avis ajouté", description: "Merci pour votre contribution !" });
        } catch (error) {
            console.error(error);
            toast({ title: "Erreur", description: "Impossible d'ajouter l'avis.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Avis des clients</h2>
            {user && (
                 <form onSubmit={handleReviewSubmit} className="mb-8 p-6 border rounded-lg">
                    <h3 className="font-semibold mb-4">Laissez votre avis</h3>
                    <div className="mb-4">
                        <Label>Note</Label>
                        <div className="flex items-center gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={cn("h-6 w-6 cursor-pointer", newRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')}
                                    onClick={() => setNewRating(star)}
                                />
                            ))}
                        </div>
                    </div>
                     <div className="mb-4">
                        <Label htmlFor="comment">Commentaire</Label>
                        <Textarea id="comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} required className="mt-2" />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Publication...' : 'Publier mon avis'}
                    </Button>
                </form>
            )}

            <div className="space-y-6">
                {loading ? (
                    <p>Chargement des avis...</p>
                ) : reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.id} className="flex gap-4">
                            <Avatar>
                                <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold">{review.userName}</p>
                                    <span className="text-sm text-muted-foreground">{format(new Date(review.createdAt), 'd MMMM yyyy', { locale: fr })}</span>
                                </div>
                                <div className="flex items-center gap-1 my-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={cn("h-4 w-4", i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                                    ))}
                                </div>
                                <p className="text-muted-foreground">{review.comment}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground">Aucun avis pour ce produit pour le moment.</p>
                )}
            </div>
        </div>
    );
}


export default function ProductPage() {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const params = useParams();
  const { toast } = useToast();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [mainApi, setMainApi] = useState<CarouselApi>()
  const [thumbApi, setThumbApi] = useState<CarouselApi>()
  const [selectedThumb, setSelectedThumb] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const fetchedProduct = await getProductById(productId);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          if (fetchedProduct.colors && fetchedProduct.colors.length > 0) {
            setSelectedColor(fetchedProduct.colors[0].name);
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
    if(productId) {
        fetchProduct();
    }
  }, [productId]);

  const onThumbClick = useCallback((index: number) => {
    if (!mainApi || !thumbApi) return
    mainApi.scrollTo(index)
  }, [mainApi, thumbApi])

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return
    setSelectedThumb(mainApi.selectedScrollSnap())
    thumbApi.scrollTo(mainApi.selectedScrollSnap())
  }, [mainApi, thumbApi, setSelectedThumb])

  useEffect(() => {
    if (!mainApi) return
    onSelect()
    mainApi.on('select', onSelect)
    mainApi.on('reInit', onSelect)
  }, [mainApi, onSelect])
  
  const ratingAverage = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;
  const reviewCount = reviews.length;


  if (loading || !product) {
    return (
        <div className="container mx-auto px-2 py-8 md:py-12">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
                 <div className="flex flex-col gap-4">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <div className="grid grid-cols-5 gap-2">
                        <Skeleton className="w-full aspect-square rounded-lg" />
                        <Skeleton className="w-full aspect-square rounded-lg" />
                        <Skeleton className="w-full aspect-square rounded-lg" />
                    </div>
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
    const hasSizes = (product.sizes && product.sizes.length > 0) || (product.shoeSizes && product.shoeSizes.length > 0);
    if ((hasSizes && !selectedSize) || !selectedColor) {
        toast({
            title: "Sélection requise",
            description: "Veuillez sélectionner une taille et une couleur.",
            variant: "destructive"
        })
        return;
    }
    addToCart(product, selectedSize || 'unique', selectedColor, quantity);
  };
  
  const handleColorSelect = (color: Product['colors'][0]) => {
    setSelectedColor(color.name);
    if (color.imageUrl) {
        const imageIndex = product.images.findIndex(img => img === color.imageUrl);
        if (imageIndex !== -1) {
            onThumbClick(imageIndex);
        }
    }
  }
  
  const allSizes = [...(product.sizes || []), ...(product.shoeSizes || [])];

  const currentPrice = (product.onSale && product.salePrice) ? product.salePrice : product.price;


  return (
    <div className="container mx-auto px-2 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
            <Carousel setApi={setMainApi} className="w-full group">
                <CarouselContent>
                {product.images.map((img, index) => (
                    <CarouselItem key={index}>
                         <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                             {product.onSale && (
                                <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1.5 rounded-full z-10">
                                    PROMO
                                </div>
                             )}
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
                    <CarouselItem key={index} className="pl-2 basis-1/4 sm:basis-1/5 md:basis-1/6">
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
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline">{product.name}</h1>
          <div className="flex items-center gap-4 mt-2 mb-4">
             {reviewCount > 0 ? (
                <>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("h-5 w-5", i < Math.round(ratingAverage) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                    ))}
                  </div>
                  <a href="#reviews" className="text-sm text-muted-foreground hover:underline">{reviewCount} avis</a>
                </>
              ) : (
                 <span className="text-sm text-muted-foreground">Aucun avis pour le moment</span>
              )}
          </div>
          
          <div className="flex items-baseline gap-2 mt-2">
            <p className={cn("text-xl font-bold", product.onSale && "text-destructive")}>
                {currentPrice.toLocaleString('fr-FR')} FCFA
            </p>
            {product.onSale && (
                <p className="text-md text-muted-foreground line-through">
                    {product.price.toLocaleString('fr-FR')} FCFA
                </p>
            )}
           </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            {/* Color Options */}
            <div>
              <Label className="text-sm font-medium">Couleur: <span className="font-bold">{selectedColor}</span></Label>
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
                  <Label className="text-sm font-medium">Taille:</Label>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                  {allSizes.map(size => (
                      <Button
                      key={size}
                      variant={selectedSize === size ? 'default' : 'outline'}
                      onClick={() => setSelectedSize(size)}
                      size="sm"
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
          <div className="mt-6 flex items-center gap-2">
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button size="default" className="flex-1" onClick={handleAddToCart} disabled={!selectedColor || (allSizes.length > 0 && !selectedSize)}>
              <ShoppingCart className="mr-2 h-5 w-5" /> Ajouter au panier
            </Button>
            <Button variant="outline" size="icon" aria-label="Ajouter aux favoris" onClick={() => toggleWishlist(product)}>
              <Heart className={cn("h-5 w-5", isProductInWishlist ? "fill-red-500 text-red-500" : "")} />
            </Button>
          </div>
        </div>
      </div>

        <div id="description" className="mt-10">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-muted-foreground text-sm">{product.description}</p>
        </div>

       <Separator className="my-10" id="reviews" />

       <ProductReviews productId={productId} onReviewsLoaded={setReviews} />
    </div>
  );
}

    
