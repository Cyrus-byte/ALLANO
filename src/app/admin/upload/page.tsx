
"use client";

import { useState } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createProduct } from '@/lib/product-service';
import { Loader2 } from 'lucide-react';

const categories = [
  'Vêtements',
  'Chaussures',
  'Sacs',
  'Bijoux',
  'Chapeaux',
  'Accessoires'
];

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function AdminUploadPage() {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleUploadClick = () => {
    if (!category) {
      toast({ title: "Catégorie requise", description: "Veuillez d'abord sélectionner une catégorie.", variant: 'destructive' });
      return;
    }
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      toast({ title: "Configuration manquante", description: "Les informations Cloudinary ne sont pas configurées. Vérifiez votre fichier next.config.ts", variant: 'destructive' });
      console.error("Cloudinary cloud name or upload preset is not configured.");
      return;
    }

    setIsUploading(true);
    // @ts-ignore
    const myWidget = window.cloudinary.createUploadWidget({
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      folder: category.toLowerCase(),
      language: 'fr',
      buttonCaption: "Téléverser une image",
      text: {
        "sources.local.title": "Fichiers locaux",
        "sources.local.drop_file": "Glissez-déposez un fichier ici",
        "sources.local.browse": "Parcourir",
      }
    }, (error: any, result: any) => { 
      if (result.event === 'close' || result.event === 'abort') {
          setIsUploading(false);
      }
      if (error) {
        console.error("Erreur de téléversement Cloudinary:", error);
        toast({ title: "Erreur de téléversement", description: "L'image n'a pas pu être téléversée. Vérifiez votre configuration Cloudinary.", variant: 'destructive' });
        setIsUploading(false);
        return;
      }
      if (result.event === "success") { 
        console.log('Image téléversée avec succès: ', result.info);
        setUploadedImageUrl(result.info.secure_url);
        toast({ title: "Image téléversée", description: "L'image est prête. Vous pouvez maintenant enregistrer le produit."});
        setIsUploading(false);
      }
    });

    myWidget.open();
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !price || !category || !uploadedImageUrl) {
      toast({ title: "Champs manquants", description: "Veuillez remplir tous les champs et téléverser une image.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const newProduct = {
        name: productName,
        description,
        price: parseFloat(price),
        category,
        images: [uploadedImageUrl],
        sizes: ['S', 'M', 'L', 'XL'], // Valeurs par défaut
        colors: [{name: 'Default', hex: '#FFFFFF'}], // Valeur par défaut
      };
      await createProduct(newProduct);
      toast({ title: "Produit créé !", description: `${productName} a été ajouté à la boutique.` });
      // Reset form
      setProductName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setUploadedImageUrl('');
    } catch (error) {
      console.error("Erreur lors de la création du produit:", error);
      toast({ title: "Erreur", description: "Le produit n'a pas pu être créé.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        type="text/javascript"
        strategy="lazyOnload"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Ajouter un nouveau produit</CardTitle>
            <CardDescription>
              Remplissez les informations, téléversez l'image, et enregistrez pour ajouter le produit à la base de données.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="productName">Nom du produit</Label>
                        <Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Ex: Tee shirt en coton" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price">Prix (FCFA)</Label>
                        <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ex: 9000" required/>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez le produit..." />
                </div>

              <div className="grid sm:grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select onValueChange={setCategory} value={category}>
                        <SelectTrigger id="category">
                        <SelectValue placeholder="Sélectionner une catégorie..." />
                        </SelectTrigger>
                        <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button onClick={handleUploadClick} type="button" variant="outline" className="w-full" disabled={!category || isUploading}>
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {uploadedImageUrl ? "Changer l'image" : "1. Téléverser l'image"}
                </Button>
              </div>

              {uploadedImageUrl && (
                <div className="space-y-2 pt-4 border-t">
                  <h3 className="font-semibold text-center">Image prête !</h3>
                  <div className="relative aspect-square w-full max-w-xs mx-auto rounded-md overflow-hidden border">
                      <img src={uploadedImageUrl} alt="Aperçu du téléversement" className="object-contain w-full h-full" />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
                 <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !uploadedImageUrl}>
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
