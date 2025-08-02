
import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/components/product/product-card';
import { PRODUCTS } from '@/lib/data';
import type { Product } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function CategoriesPage() {
  const categories = PRODUCTS.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = { products: [], image: product.images[0] };
    }
    acc[category].products.push(product);
    return acc;
  }, {} as Record<string, { products: Product[], image: string }>);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight">Explorez Nos Catégories</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Trouvez exactement ce que vous cherchez, des vêtements aux accessoires.
        </p>
      </div>

      <section className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {Object.keys(categories).map((category) => (
            <Link key={category} href={`#${category.toLowerCase().replace(/\s/g, '-')}`} passHref>
              <Card className="relative block group overflow-hidden rounded-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2">
                <CardContent className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={categories[category].image}
                      alt={category}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 p-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight">{category}</h2>
                     <div className="flex items-center mt-2 text-primary-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span>Voir la collection</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="space-y-16">
        {Object.entries(categories).map(([category, { products }]) => (
          <section key={category} id={`${category.toLowerCase().replace(/\s/g, '-')}`} className="scroll-mt-24">
             <div className="flex justify-between items-end mb-8 border-b pb-4">
                 <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">{category}</h2>
                 <Button asChild variant="link" className="text-primary pr-0">
                    <Link href={`#`}>
                        Voir tout <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                 </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {products.slice(0,4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
