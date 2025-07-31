
import { ProductCard } from '@/components/product/product-card';
import { PRODUCTS } from '@/lib/data';

export default function PromotionsPage() {
  const onSaleProducts = PRODUCTS.filter(p => p.onSale);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">Promotions</h1>
      {onSaleProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {onSaleProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">Aucune promotion pour le moment</h2>
          <p className="mt-2 text-muted-foreground">Revenez bientôt pour découvrir nos offres !</p>
        </div>
      )}
    </div>
  );
}
