
"use client";

import { useParams, notFound } from 'next/navigation';
import { ProductCard } from '@/components/product/product-card';
import { PRODUCTS } from '@/lib/data';
import { SearchX } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Helper to generate a URL-friendly slug from a category name
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

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Find the original category name that matches the slug
  const categoryName = Object.keys(
    PRODUCTS.reduce((acc, p) => ({ ...acc, [p.category]: true }), {})
  ).find(cat => slugify(cat) === slug);
  
  if (!categoryName) {
    notFound();
  }

  const filteredProducts = PRODUCTS.filter(product => 
    product.category === categoryName
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <Button asChild variant="ghost" className="pl-0">
          <Link href="/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Toutes les catégories
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">
        Catégorie : {categoryName}
      </h1>
      <p className="text-muted-foreground mb-8">
        {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
      </p>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <SearchX className="mx-auto h-24 w-24 text-muted-foreground" />
          <h2 className="mt-4 text-2xl font-bold">Aucun produit trouvé</h2>
          <p className="mt-2 text-muted-foreground">
            Il n'y a aucun produit dans cette catégorie pour le moment.
          </p>
        </div>
      )}
    </div>
  );
}
