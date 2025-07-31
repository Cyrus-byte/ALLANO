
import { ProductCard } from '@/components/product/product-card';
import { PRODUCTS } from '@/lib/data';
import type { Product } from '@/lib/types';

export default function CategoriesPage() {
  const categories = PRODUCTS.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">Catégories</h1>
      <div className="space-y-12">
        {Object.entries(categories).map(([category, products]) => (
          <section key={category}>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline mb-8">{category}</h2>
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
