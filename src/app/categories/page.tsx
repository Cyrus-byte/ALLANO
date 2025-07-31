
import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/components/product/product-card';
import { PRODUCTS } from '@/lib/data';
import type { Product } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
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
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">Catégories</h1>

      <section className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(categories).map((category) => (
            <Link key={category} href={`#${category.toLowerCase().replace(/\s/g, '-')}`} className="block group">
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="relative h-48 w-full">
                      <Image
                        src={categories[category].image}
                        alt={category}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                       <div className="absolute inset-0 bg-black/40" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h2 className="text-2xl font-bold text-white text-center p-4">{category}</h2>
                    </div>
                  </CardContent>
                </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="space-y-16">
        {Object.entries(categories).map(([category, { products }]) => (
          <section key={category} id={`${category.toLowerCase().replace(/\s/g, '-')}`} className="scroll-mt-20">
             <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">{category}</h2>
                 <Link href={`#`} className="text-primary hover:underline flex items-center text-sm">
                    Voir tout <ArrowRight className="ml-1 h-4 w-4" />
                 </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
