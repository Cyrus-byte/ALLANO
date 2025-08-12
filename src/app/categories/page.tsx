
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
        <div className="container mx-auto px-2 py-8 md:py-12">
            <div className="text-center mb-12">
                <Skeleton className="h-12 w-2/3 mx-auto" />
                <Skeleton className="h-6 w-1/3 mx-auto mt-4" />
            </div>
            <section className="mb-16">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-2 gap-y-6 md:gap-x-4">
                    {Array.from({length: 6}).map((_, i) => 
                        <div key={i} className="flex flex-col items-center gap-2">
                           <Skeleton className="w-20 h-20 rounded-full" />
                           <Skeleton className="h-4 w-16" />
                        </div>
                    )}
                </div>
            </section>
            <div className="space-y-16">
                {Array.from({length: 2}).map((_, i) => (
                    <section key={i}>
                        <Skeleton className="h-10 w-1/4 mb-8" />
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-8">
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
    <div className="container mx-auto px-2 py-8 md:py-12">
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight">Explorez Nos Catégories</h1>
        <p className="mt-2 max-w-2xl mx-auto text-lg text-muted-foreground">
          Trouvez exactement ce que vous cherchez, des vêtements aux accessoires.
        </p>
      </div>

      <section className="mb-8">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-x-2 gap-y-6 md:gap-x-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${slugify(category.name)}`} passHref>
               <div className="group flex flex-col items-center gap-2 text-center">
                 <div className="relative w-20 h-20 overflow-hidden rounded-full transition-transform duration-300 ease-in-out group-hover:scale-105">
                    <Image
                      src={getCategoryImage(category.name)}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                 </div>
                 <h2 className="text-sm font-medium text-foreground">{category.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="space-y-8">
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {products.slice(0, 8).map(product => (
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
