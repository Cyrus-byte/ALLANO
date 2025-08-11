
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/product-card';
import { ProductRecommendations } from '@/components/product/product-recommendations';
import { getProducts } from '@/lib/product-service';
import type { Product } from '@/lib/types';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getHomepageSettings, type HomepageSettings } from '@/lib/settings-service';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";


const defaultSettings: HomepageSettings = {
    heroImageUrls: [],
    heroHeadline: 'La Mode, Réinventée.',
    heroSubheadline: 'Découvrez les dernières tendances et exprimez votre style unique avec Allano.',
    heroButtonText: 'Explorer les collections'
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setProductsLoading] = useState(true);
  const [heroSettings, setHeroSettings] = useState<HomepageSettings>(defaultSettings);
  const [loadingHero, setHeroLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setProductsLoading(false);
      }
    };
    
    const fetchHeroSettings = async () => {
      setHeroLoading(true);
      try {
          const settings = await getHomepageSettings();
          if (settings) {
            setHeroSettings({
              heroImageUrls: settings.heroImageUrls || [],
              heroHeadline: settings.heroHeadline,
              heroSubheadline: settings.heroSubheadline,
              heroButtonText: settings.heroButtonText
            });
          } else {
             setHeroSettings(defaultSettings);
          }
      } catch (error) {
        console.error("Failed to fetch hero settings:", error);
        setHeroSettings(defaultSettings);
      } finally {
        setHeroLoading(false);
      }
    }

    fetchHeroSettings();
    fetchProducts();
  }, []);


  const isLoading = loadingHero || loadingProducts;

  if (isLoading) {
    return (
        <div className="container mx-auto px-2">
            <section className="w-full py-12 md:py-20">
                <Skeleton className="w-full aspect-video md:aspect-[16/7] rounded-lg" />
                 <div className="text-center mt-8">
                    <Skeleton className="h-12 w-2/3 mx-auto" />
                    <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
                    <Skeleton className="h-12 w-48 mx-auto mt-8" />
                </div>
            </section>
        </div>
    )
  }

  return (
    <div className="flex-1">
      <section className="w-full">
        {heroSettings.heroImageUrls.length > 0 ? (
          <div className="relative aspect-[4/3] md:aspect-video w-full">
            <Carousel
              opts={{ align: "center", loop: true }}
              plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
              className="w-full h-full"
            >
              <CarouselContent>
                {heroSettings.heroImageUrls.map((url, index) => (
                  <CarouselItem key={index}>
                    <div className="relative w-full h-full aspect-[4/3] md:aspect-video">
                      <Image
                        src={url}
                        alt={`Hero image ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
              {heroSettings.heroHeadline && (
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-headline text-white">
                  {heroSettings.heroHeadline}
                </h1>
              )}
              {heroSettings.heroSubheadline && (
                <p className="mt-4 max-w-2xl mx-auto text-base md:text-xl text-white/90">
                  {heroSettings.heroSubheadline}
                </p>
              )}
              {heroSettings.heroButtonText && (
                <Button size="lg" className="mt-8 text-base py-6 px-8">
                    <Link href="/categories">
                    {heroSettings.heroButtonText} <ArrowRight className="ml-2" />
                    </Link>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="container mx-auto text-center py-24 md:py-32 px-2">
            {heroSettings.heroHeadline && (
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-headline text-foreground">
                {heroSettings.heroHeadline}
              </h1>
            )}
            {heroSettings.heroSubheadline && (
              <p className="mt-4 max-w-2xl mx-auto text-base md:text-xl text-muted-foreground">
                {heroSettings.heroSubheadline}
              </p>
            )}
            {heroSettings.heroButtonText && (
                <Button size="lg" className="mt-8 text-base py-6 px-8">
                <Link href="/categories">
                    {heroSettings.heroButtonText} <ArrowRight className="ml-2" />
                </Link>
                </Button>
            )}
          </div>
        )}
      </section>

      <div className="container mx-auto px-2">
        <ProductRecommendations />

        <section className="py-12 md:py-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Nouveautés</h2>
            <Button variant="link" asChild className="text-primary">
              <Link href="/categories">
                Voir tout <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {loadingProducts ? (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                        <Skeleton className="aspect-[3/4] w-full" />
                        <Skeleton className="h-5 w-3/4 mt-4" />
                        <Skeleton className="h-5 w-1/2 mt-2" />
                    </div>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {products.filter(p => p.isNew).slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
