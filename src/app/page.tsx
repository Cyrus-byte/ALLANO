
"use client";

import { useState, useEffect } from 'react';
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
    heroSubheadline: 'Découvrez les dernières tendances et exprimez votre style unique avec Allano.'
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setProductsLoading] = useState(true);
  const [heroSettings, setHeroSettings] = useState<HomepageSettings>(defaultSettings);
  const [loadingHero, setHeroLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
              heroHeadline: settings.heroHeadline || defaultSettings.heroHeadline,
              heroSubheadline: settings.heroSubheadline || defaultSettings.heroSubheadline
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

  const isLoading = loadingHero || !isMounted;

  return (
    <div>
       <section className="relative w-full h-[60vh] md:h-[70vh] bg-secondary group">
        {isLoading ? (
          <Skeleton className="absolute inset-0 w-full h-full" />
        ) : (
          <>
            <Carousel
              className="w-full h-full"
              plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="h-full">
                {heroSettings.heroImageUrls.length > 0 ? (
                  heroSettings.heroImageUrls.map((url, index) => (
                    <CarouselItem key={index} className="h-full">
                       <Image
                          src={url}
                          alt={`Hero image ${index + 1}`}
                          fill
                          className="object-cover"
                          priority={index === 0}
                        />
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem className="h-full w-full bg-secondary" />
                )}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 text-white bg-black/30 hover:bg-black/50 hover:text-white border-none" />
              <CarouselNext className="absolute right-4 text-white bg-black/30 hover:bg-black/50 hover:text-white border-none" />
            </Carousel>
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-4">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-headline">
                {heroSettings.heroHeadline}
                </h1>
                <p className="mt-4 max-w-2xl text-lg md:text-xl text-primary-foreground/80">
                {heroSettings.heroSubheadline}
                </p>
                <Button size="lg" className="mt-8" asChild>
                <Link href="/categories">
                    Explorer les collections <ArrowRight className="ml-2" />
                </Link>
                </Button>
            </div>
          </>
        )}
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
             <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                        <Skeleton className="aspect-[3/4] w-full" />
                        <Skeleton className="h-5 w-3/4 mt-4" />
                        <Skeleton className="h-5 w-1/2 mt-2" />
                    </div>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
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
