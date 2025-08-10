
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Logo } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { getProducts } from '@/lib/product-service';
import type { Product } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

export function MobileHeader() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const products = await getProducts();
        setAllProducts(products);
      } catch (error) {
        console.error("Failed to fetch products for search:", error);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const results = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5); // Limit to 5 results
      setFilteredProducts(results);
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, allProducts]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        setIsFocused(false);
        setSearchQuery('');
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const handleSuggestionClick = (path: string) => {
      setIsFocused(false);
      setSearchQuery('');
      router.push(path);
  }

  return (
    <header className="md:hidden sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center">
          <Logo className="h-6 w-auto" />
        </Link>
        <div className="flex-1 flex justify-end" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
               <button type="submit" className="p-0 m-0 h-full bg-transparent border-none" aria-label="Rechercher">
                <Search className="h-5 w-5 text-muted-foreground" />
               </button>
            </div>
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-10 h-10 rounded-full bg-muted border-transparent focus-visible:ring-primary focus-visible:ring-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
            />
             {isFocused && searchQuery && (
                <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg overflow-hidden">
                    {filteredProducts.length > 0 ? (
                        <ul>
                            {filteredProducts.map((product, index) => (
                                <li key={product.id}>
                                    <button 
                                        type="button"
                                        onClick={() => handleSuggestionClick(`/product/${product.id}`)}
                                        className="w-full text-left flex items-center gap-4 p-3 hover:bg-muted"
                                    >
                                        <div className="relative w-12 h-16 rounded-md overflow-hidden">
                                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                        </div>
                                        <span className="flex-1 text-sm">{product.name}</span>
                                    </button>
                                </li>
                            ))}
                             <Separator />
                             <li>
                                <button type="submit" className="w-full text-left p-3 text-primary font-semibold text-sm hover:bg-muted">
                                    Voir tous les résultats pour "{searchQuery}"
                                </button>
                             </li>
                        </ul>
                    ) : (
                         <div className="p-4 text-center text-sm text-muted-foreground">
                            Aucun produit trouvé pour "{searchQuery}"
                         </div>
                    )}
                </div>
            )}
          </form>
        </div>
      </div>
    </header>
  );
}
