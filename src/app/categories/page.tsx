
import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import { ProductCard } from '@/components/product/product-card';
import { PRODUCTS } from '@/lib/data';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const slugify = (text: string) =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

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
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 md:gap-4">
          {Object.keys(categories).map((category) => (
            <Link key={category} href={`/category/${slugify(category)}`} passHref>
               <div className="group relative aspect-square overflow-hidden rounded-lg">
                <CldImage
                  src={categories[category].image}
                  alt={category}
                  fill
                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h2 className="text-sm font-bold text-white text-center p-1">{category}</h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="space-y-16">
        {Object.entries(categories).map(([category, { products }]) => (
          <section key={category} id={`${slugify(category)}`} className="scroll-mt-24">
             <div className="flex justify-between items-end mb-8 border-b pb-4">
                 <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">{category}</h2>
                 <Button asChild variant="link" className="text-primary pr-0">
                    <Link href={`/category/${slugify(category)}`}>
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
