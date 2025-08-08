
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/components/product/product-card';
import { getProducts } from '@/lib/product-service';
import { getCategories } from '@/lib/category-service';
import type { Product, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


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
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [fetchedCategories, allProducts] = await Promise.all([
          getCategories(),
          getProducts()
        ]);
        
        // Sort products into a map for easy lookup
        const productMap: Record<string, Product[]> = {};
        allProducts.forEach(product => {
            if (!productMap[product.category]) {
                productMap[product.category] = [];
            }
            productMap[product.category].push(product);
        });
        
        setCategories(fetchedCategories);
        setProductsByCategory(productMap);

      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const getCategoryImage = (categoryName: string) => {
    const products = productsByCategory[categoryName] || [];
    const newProduct = products.find(p => p.isNew);
    if (newProduct) return newProduct.images[0];
    if (products.length > 0) return products[0].images[0];
    return "https://placehold.co/400x400.png"; // Fallback image
  }

  if (loading) {
     return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="text-center mb-12">
                <Skeleton className="h-12 w-2/3 mx-auto" />
                <Skeleton className="h-6 w-1/3 mx-auto mt-4" />
            </div>
            <section className="mb-16">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 md:gap-4">
                    {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
                </div>
            </section>
            <div className="space-y-16">
                {Array.from({length: 2}).map((_, i) => (
                    <section key={i}>
                        <Skeleton className="h-10 w-1/4 mb-8" />
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <div key={j}>
                                    <Skeleton className="aspect-[3/4] w-full" />
                                    <Skeleton className="h-5 w-3/4 mt-4" />
                                    <Skeleton className="h-5 w-1/2 mt-2" />
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
     )
  }

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
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${slugify(category.name)}`} passHref>
               <div className="group relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={getCategoryImage(category.name)}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h2 className="text-sm font-bold text-white text-center p-1">{category.name}</h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="space-y-16">
        {categories.map((category) => {
          const products = productsByCategory[category.name] || [];
          if(products.length === 0) return null;
          
          return (
            <section key={category.id} id={`${slugify(category.name)}`} className="scroll-mt-24">
               <div className="flex justify-between items-end mb-8 border-b pb-4">
                   <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">{category.name}</h2>
                   <Button asChild variant="link" className="text-primary pr-0">
                      <Link href={`/category/${slugify(category.name)}`}>
                          Voir tout <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                   </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {products.slice(0, 4).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  );
}
