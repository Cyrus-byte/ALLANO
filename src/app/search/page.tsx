
"use client";

import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product/product-card';
import { PRODUCTS } from '@/lib/data';
import { SearchX } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const filteredProducts = PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.description.toLowerCase().includes(query.toLowerCase()) ||
    product.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">
        Résultats de recherche
      </h1>
      <p className="text-muted-foreground mb-8">
        {filteredProducts.length} résultat{filteredProducts.length > 1 ? 's' : ''} pour "{query}"
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
          <h2 className="mt-4 text-2xl font-bold">Aucun résultat trouvé</h2>
          <p className="mt-2 text-muted-foreground">
            Nous n'avons trouvé aucun produit correspondant à votre recherche.
          </p>
        </div>
      )}
    </div>
  );
}
