
"use client";

import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Logo } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function MobileHeader() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="md:hidden sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="flex items-center space-x-2">
          <Logo className="h-6 w-6" />
        </Link>
        <div className="flex-1">
          <form onSubmit={handleSearch} className="relative w-full">
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-10 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
               <button type="submit" className="p-0 m-0 h-full bg-transparent border-none">
                <Search className="h-5 w-5 text-muted-foreground" />
               </button>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
