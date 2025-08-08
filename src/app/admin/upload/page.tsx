
"use client";

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createProduct } from '@/lib/product-service';
import { getCategories } from '@/lib/category-service';
import { Loader2, X, PlusCircle, Link as LinkIcon, AlertCircle } from 'lucide-react';
import type { Product, Category } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function AdminUploadPage() {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [sizes, setSizes] = useState('');
  const [shoeSizes, setShoeSizes] = useState('');
  const [colors, setColors] = useState<{ name: string; hex: string; imageUrl?: string }[]>([{ name: '', hex: '#ffffff' }]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const fetchedCategories = await getCategories();
            setCategories(fetchedCategories);
        } catch (error) {
            console.error(error);
            toast({ title: "Erreur", description: "Impossible de charger les catégories.", variant: "destructive" });
        }
    }
    fetchCategories();
  }, [toast]);

  const handleUploadClick = () => {
    if (!category) {
      toast({ title: "Catégorie requise", description: "Veuillez d'abord sélectionner une catégorie.", variant: 'destructive' });
      return;
    }
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      toast({ title: "Configuration manquante", description: "Les informations Cloudinary ne sont pas configurées. Vérifiez votre fichier .env.local", variant: 'destructive' });
      console.error("Cloudinary cloud name or upload preset is not configured.");
      return;
    }

    setIsUploading(true);
    // @ts-ignore
    const myWidget = window.cloudinary.createUploadWidget({
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      folder: category.name.toLowerCase(),
      language: 'fr',
      multiple: true,
      buttonCaption: "Téléverser des images",
      text: {
        "sources.local.title": "Fichiers locaux",
        "sources.local.drop_file": "Glissez-déposez des fichiers ici",
        "sources.local.browse": "Parcourir",
      }
    }, (error: any, result: any) => { 
      if (result.event === 'close' || result.event === 'abort') {
          setIsUploading(false);
      }
      if (error) {
        console.error("Erreur de téléversement Cloudinary:", error);
        toast({ title: "Erreur de téléversement", description: "Une ou plusieurs images n'ont pas pu être téléversées.", variant: 'destructive' });
        setIsUploading(false);
        return;
      }
      if (result.event === "success") { 
        console.log('Image téléversée avec succès: ', result.info);
        setUploadedImageUrls(prev => [...prev, result.info.secure_url]);
        toast({ title: "Image ajoutée", description: "L'image est prête. Vous pouvez en ajouter d'autres ou enregistrer le produit."});
      }
    });

    myWidget.open();
  };
  
  const handleRemoveImage = (urlToRemove: string) => {
    setUploadedImageUrls(prev => prev.filter(url => url !== urlToRemove));
    setColors(prev => prev.map(color => color.imageUrl === urlToRemove ? { ...color, imageUrl: undefined } : color));
  };

  const handleColorChange = (index: number, field: 'name' | 'hex' | 'imageUrl', value: string) => {
    const newColors = [...colors];
    // @ts-ignore
    newColors[index][field] = value;
    setColors(newColors);
  };

  const addColor = () => {
    setColors([...colors, { name: '', hex: '#ffffff' }]);
  };

  const removeColor = (index: number) => {
    const newColors = colors.filter((_, i) => i !== index);
    setColors(newColors);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let requiredFieldsMissing = !productName || !price || !category || uploadedImageUrls.length === 0 || colors.some(c => !c.name);
    if (category?.attributes?.sizes && !sizes) requiredFieldsMissing = true;
    if (category?.attributes?.shoeSizes && !shoeSizes) requiredFieldsMissing = true;

    if (requiredFieldsMissing) {
      toast({ title: "Champs manquants", description: "Veuillez remplir tous les champs pertinents pour la catégorie choisie et téléverser au moins une image.", variant: "destructive" });
      return;
    }

    if (onSale && !salePrice) {
        toast({ title: "Prix manquant", description: "Veuillez indiquer le prix promotionnel.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
      const newProduct: Partial<Product> = {
        name: productName,
        description,
        price: parseFloat(price),
        category: category!.name,
        images: uploadedImageUrls,
        sizes: sizes ? sizes.split(',').map(s => s.trim()) : [],
        shoeSizes: shoeSizes ? shoeSizes.split(',').map(s => s.trim()) : [],
        colors: colors,
        onSale: onSale,
        salePrice: onSale ? parseFloat(salePrice) : undefined,
      };
      await createProduct(newProduct);
      toast({ title: "Produit créé !", description: `${productName} a été ajouté à la boutique.` });
      // Reset form
      setProductName('');
      setDescription('');
      setPrice('');
      setCategory(null);
      setSizes('');
      setShoeSizes('');
      setColors([{ name: '', hex: '#ffffff' }]);
      setUploadedImageUrls([]);
      setOnSale(false);
      setSalePrice('');
    } catch (error) {
      console.error("Erreur lors de la création du produit:", error);
      toast({ title: "Erreur", description: "Le produit n'a pas pu être créé.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryAttributes = category?.attributes;

  return (
    <>
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        type="text/javascript"
        strategy="lazyOnload"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Ajouter un nouveau produit</CardTitle>
            <CardDescription>
              Remplissez les informations, téléversez les images, et enregistrez pour ajouter le produit.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="productName">Nom du produit</Label>
                    <Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Ex: Tee shirt en coton" required />
                </div>
                 
                <div className="grid sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="price">Prix d'origine (FCFA)</Label>
                        <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ex: 12000" required/>
                    </div>
                     {onSale && (
                        <div className="space-y-2">
                            <Label htmlFor="salePrice" className="text-destructive">Prix promotionnel (FCFA)</Label>
                            <Input id="salePrice" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Ex: 9000" required={onSale}/>
                        </div>
                     )}
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="onSale" checked={onSale} onCheckedChange={setOnSale} />
                    <Label htmlFor="onSale">Mettre ce produit en promotion</Label>
                </div>
                
                 {onSale && parseFloat(salePrice) >= parseFloat(price) && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Le prix promotionnel doit être inférieur au prix d'origine.
                        </AlertDescription>
                    </Alert>
                 )}

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez le produit..." />
                </div>
                
                {selectedCategoryAttributes?.sizes && (
                  <div className="space-y-2">
                      <Label htmlFor="sizes">Tailles disponibles (vêtements)</Label>
                      <Input id="sizes" value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="S, M, L, XL (séparées par une virgule)" required />
                  </div>
                )}
                
                {selectedCategoryAttributes?.shoeSizes && (
                  <div className="space-y-2">
                      <Label htmlFor="shoeSizes">Pointures disponibles (chaussures)</Label>
                      <Input id="shoeSizes" value={shoeSizes} onChange={(e) => setShoeSizes(e.target.value)} placeholder="39, 40, 41 (séparées par une virgule)" required />
                  </div>
                )}


                 <div className="space-y-4">
                    <Label>Couleurs disponibles</Label>
                    {colors.map((color, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input 
                                type="text" 
                                placeholder="Nom de la couleur (ex: Bleu Ciel)" 
                                value={color.name}
                                onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                                required
                            />
                             <Input 
                                type="color" 
                                value={color.hex}
                                onChange={(e) => handleColorChange(index, 'hex', e.target.value)}
                                className="w-16 p-1 h-10"
                            />
                             <Popover>
                              <PopoverTrigger asChild>
                                <Button type="button" variant="outline" size="icon" disabled={uploadedImageUrls.length === 0}>
                                  {color.imageUrl ? <Image src={color.imageUrl} alt="miniature" width={20} height={20} /> : <LinkIcon className="h-4 w-4" />}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-2">
                                <div className="grid grid-cols-3 gap-2">
                                  {uploadedImageUrls.map(url => (
                                    <button
                                      key={url}
                                      type="button"
                                      className="relative aspect-square w-16 h-16 rounded-md overflow-hidden border focus:ring-2 focus:ring-primary"
                                      onClick={() => handleColorChange(index, 'imageUrl', url)}
                                    >
                                      <Image src={url} alt="Aperçu" fill className="object-cover" />
                                    </button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                            {colors.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeColor(index)}>
                                    <X className="h-4 w-4 text-destructive" />
                                </Button>
                            )}
                        </div>
                    ))}
                     <Button type="button" variant="outline" size="sm" onClick={addColor} className="mt-2">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter une couleur
                    </Button>
                </div>


              <div className="grid sm:grid-cols-2 gap-4 items-end pt-4 border-t">
                <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select onValueChange={(value) => setCategory(categories.find(c => c.name === value) || null)} value={category?.name}>
                        <SelectTrigger id="category">
                        <SelectValue placeholder="Sélectionner une catégorie..." />
                        </SelectTrigger>
                        <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button onClick={handleUploadClick} type="button" variant="outline" className="w-full" disabled={!category || isUploading}>
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {uploadedImageUrls.length > 0 ? "Ajouter d'autres images" : "1. Téléverser les images"}
                </Button>
              </div>

              {uploadedImageUrls.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-center">{uploadedImageUrls.length} image(s) prête(s) !</h3>
                   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {uploadedImageUrls.map((url) => (
                        <div key={url} className="relative aspect-square w-full mx-auto rounded-md overflow-hidden border">
                          <Image src={url} alt="Aperçu du téléversement" fill className="object-contain w-full h-full" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full"
                            onClick={() => handleRemoveImage(url)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
                 <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || uploadedImageUrls.length === 0}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    2. Enregistrer le produit
                </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
