
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Product } from '@/lib/types';
import { X } from 'lucide-react';

interface ProductFiltersProps {
  products: Product[];
  onFilterChange: (filteredProducts: Product[]) => void;
}

export function ProductFilters({ products, onFilterChange }: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState('newest');

  const availableSizes = useMemo(() => {
    const allSizes = products.flatMap(p => p.sizes);
    return [...new Set(allSizes)].sort();
  }, [products]);

  const availableColors = useMemo(() => {
    const allColors = products.flatMap(p => p.colors.map(c => c.name));
    return [...new Set(allColors)].sort();
  }, [products]);

  useEffect(() => {
    const filterAndSort = () => {
      let filtered = [...products];

      // Price filter
      filtered = filtered.filter(p => {
        const price = p.onSale && p.salePrice ? p.salePrice : p.price;
        return price >= priceRange[0] && price <= priceRange[1];
      });

      // Size filter
      if (selectedSizes.length > 0) {
        filtered = filtered.filter(p => p.sizes.some(size => selectedSizes.includes(size)));
      }

      // Color filter
      if (selectedColors.length > 0) {
        filtered = filtered.filter(p => p.colors.some(color => selectedColors.includes(color.name)));
      }

      // Sorting
      switch (sortOrder) {
        case 'price-asc':
          filtered.sort((a, b) => (a.onSale && a.salePrice ? a.salePrice : a.price) - (b.onSale && b.salePrice ? b.salePrice : b.price));
          break;
        case 'price-desc':
          filtered.sort((a, b) => (b.onSale && b.salePrice ? b.salePrice : b.price) - (a.onSale && a.salePrice ? a.salePrice : a.price));
          break;
        case 'newest':
          // Assuming `createdAt` exists, otherwise we need to add it or sort differently
          filtered.sort((a, b) => (b.isNew ? 1 : -1) - (a.isNew ? 1 : -1));
          break;
      }
      onFilterChange(filtered);
    };

    filterAndSort();
  }, [priceRange, selectedSizes, selectedColors, sortOrder, products, onFilterChange]);


  const handleSizeChange = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleColorChange = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const resetFilters = () => {
    setPriceRange([0, 100000]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSortOrder('newest');
  }

  return (
    <Card className="sticky top-20">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <CardTitle className="text-lg">Filtres</CardTitle>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <X className="mr-2 h-4 w-4"/>
          Effacer
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div>
          <Label className="font-semibold">Trier par</Label>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Trier par..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Nouveautés</SelectItem>
              <SelectItem value="price-asc">Prix: Croissant</SelectItem>
              <SelectItem value="price-desc">Prix: Décroissant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="price-range" className="font-semibold">
            Prix: {priceRange[0].toLocaleString('fr-FR')} - {priceRange[1].toLocaleString('fr-FR')} FCFA
          </Label>
          <Slider
            id="price-range"
            min={0}
            max={100000}
            step={1000}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mt-4"
          />
        </div>

        {availableSizes.length > 0 && (
          <div>
            <Label className="font-semibold">Taille</Label>
            <div className="space-y-2 mt-2">
              {availableSizes.map(size => (
                <div key={size} className="flex items-center">
                  <Checkbox id={`size-${size}`} checked={selectedSizes.includes(size)} onCheckedChange={() => handleSizeChange(size)} />
                  <Label htmlFor={`size-${size}`} className="ml-2 font-normal">{size}</Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {availableColors.length > 0 && (
          <div>
            <Label className="font-semibold">Couleur</Label>
            <div className="space-y-2 mt-2">
              {availableColors.map(color => (
                <div key={color} className="flex items-center">
                  <Checkbox id={`color-${color}`} checked={selectedColors.includes(color)} onCheckedChange={() => handleColorChange(color)} />
                  <Label htmlFor={`color-${color}`} className="ml-2 font-normal">{color}</Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
