
import { CldImage } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/product-card';
import { ProductRecommendations } from '@/components/product/product-recommendations';
import { PRODUCTS } from '@/lib/data';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const newArrivals = PRODUCTS.filter(p => p.isNew).slice(0, 8);

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[60vh] md:h-[70vh] text-white">
        <CldImage
          src="allano-app/hero-background_bquwnv"
          alt="Hero background"
          fill
          className="object-cover"
          data-ai-hint="fashion model"
          priority
        />
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center p-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-headline">
            La Mode, Réinventée.
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-primary-foreground/80">
            Découvrez les dernières tendances et exprimez votre style unique avec Allano.
          </p>
          <Button size="lg" className="mt-8">
            Nouvelle Collection <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ProductRecommendations />

        <section className="py-12 md:py-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Nouveautés</h2>
            <Button variant="link" className="text-primary">
              Voir tout <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
