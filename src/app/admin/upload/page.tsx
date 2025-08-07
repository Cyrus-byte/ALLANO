
"use client";

import { useState } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Assurez-vous que ces valeurs correspondent aux dossiers que vous avez créés dans Cloudinary
const categories = [
  'vetements',
  'chaussures',
  'sacs',
  'bijoux',
  'chapeaux',
  'accessoires'
];

// Remplacez par votre "Cloud Name" que vous trouverez sur votre tableau de bord Cloudinary
const CLOUDINARY_CLOUD_NAME = "dhjcx6ckx"; 
// Remplacez par un "Upload Preset" que vous devez créer dans les paramètres de Cloudinary
const CLOUDINARY_UPLOAD_PRESET = "ml_default";


export default function AdminUploadPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleUploadClick = () => {
    if (!selectedCategory) {
      alert("Veuillez d'abord sélectionner une catégorie.");
      return;
    }

    // @ts-ignore
    const myWidget = window.cloudinary.createUploadWidget({
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      folder: selectedCategory, // C'est ici que la magie opère !
      language: 'fr',
      buttonCaption: "Téléverser une image",
      text: {
        "sources.local.title": "Fichiers locaux",
        "sources.local.drop_file": "Glissez-déposez un fichier ici",
        "sources.local.browse": "Parcourir",
      }
    }, (error: any, result: any) => { 
      if (!error && result && result.event === "success") { 
        console.log('Image téléversée avec succès: ', result.info);
        setUploadedImageUrl(result.info.secure_url);
      }
      if (error) {
        console.error("Erreur de téléversement Cloudinary:", error);
      }
    });

    myWidget.open();
  };

  return (
    <>
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        type="text/javascript"
        strategy="lazyOnload"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Automatiser le téléversement d'images</CardTitle>
            <CardDescription>
              Téléversez une image de produit. Elle sera automatiquement rangée dans le bon dossier sur Cloudinary.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">1. Choisissez une catégorie</Label>
              <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Sélectionner une catégorie..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
                <Label>2. Téléversez l'image</Label>
                <Button onClick={handleUploadClick} className="w-full" disabled={!selectedCategory}>
                    Ouvrir l'outil de téléversement
                </Button>
            </div>

            {uploadedImageUrl && (
              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-semibold text-center">Image téléversée avec succès !</h3>
                <div className="relative aspect-square w-full max-w-xs mx-auto rounded-md overflow-hidden border">
                    <img src={uploadedImageUrl} alt="Aperçu du téléversement" className="object-contain w-full h-full" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL publique de l'image :</Label>
                  <Input id="imageUrl" readOnly value={uploadedImageUrl} />
                  <p className="text-xs text-muted-foreground">
                    Copiez cette URL pour l'ajouter à votre fichier `data.ts`.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
