
"use client";

import { useState, useEffect } from 'react';
import Script from 'next/script';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X } from 'lucide-react';
import { getHomepageHeroUrls, updateHomepageHeroUrls } from '@/lib/settings-service';
import { Skeleton } from '@/components/ui/skeleton';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function AdminSettingsPage() {
  const [heroImageUrls, setHeroImageUrls] = useState<string[]>([]);
  const [initialImageUrls, setInitialImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const urls = await getHomepageHeroUrls();
      const initialUrls = urls || [];
      setHeroImageUrls(initialUrls);
      setInitialImageUrls(initialUrls);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleUploadClick = () => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      toast({ title: "Configuration manquante", description: "Les informations Cloudinary ne sont pas configurées.", variant: 'destructive' });
      return;
    }
    
    setIsUploading(true);
    // @ts-ignore
    const myWidget = window.cloudinary.createUploadWidget({
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      folder: 'site',
      language: 'fr',
      multiple: true,
    }, (error: any, result: any) => { 
      if (result.event === 'close' || result.event === 'abort') {
        setIsUploading(false);
      }
      if (error) {
        console.error("Upload error:", error);
        toast({ title: "Erreur de téléversement", variant: 'destructive' });
        setIsUploading(false);
      }
      if (result.event === "success") { 
        setHeroImageUrls(prev => [...prev, result.info.secure_url]);
        toast({ title: "Image ajoutée", description: "Cliquez sur 'Enregistrer' pour appliquer."});
      }
       if (result.event === "queue-changed" && result.info.files.length === 0) {
        setIsUploading(false);
      }
    });
    myWidget.open();
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setHeroImageUrls(prev => prev.filter(url => url !== urlToRemove));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        await updateHomepageHeroUrls(heroImageUrls);
        setInitialImageUrls(heroImageUrls);
        toast({ title: "Succès !", description: "Les images de la page d'accueil ont été mises à jour." });
    } catch (error) {
        console.error(error);
        toast({ title: "Erreur", description: "Impossible de sauvegarder les paramètres.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  }

  const hasChanges = JSON.stringify(heroImageUrls) !== JSON.stringify(initialImageUrls);

  if(loading) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full h-48" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-12 w-full" />
                </CardFooter>
            </Card>
        </div>
    )
  }

  return (
    <>
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        type="text/javascript"
        strategy="lazyOnload"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <form onSubmit={handleSubmit}>
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Personnalisation de l'accueil</CardTitle>
              <CardDescription>
                Gérez les images du carrousel de la page d'accueil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <h3 className="font-semibold">Images du carrousel</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                       {heroImageUrls.map((url) => (
                        <div key={url} className="relative group aspect-video w-full rounded-md overflow-hidden border">
                          <Image src={url} alt="Aperçu du téléversement" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-9 w-9 rounded-full"
                              onClick={() => handleRemoveImage(url)}
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                         <Button 
                            onClick={handleUploadClick} 
                            type="button" 
                            variant="outline" 
                            className="aspect-video w-full flex flex-col items-center justify-center gap-2" 
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
                            <span>{isUploading ? "En cours..." : "Ajouter"}</span>
                        </Button>
                    </div>
                </div>

            </CardContent>
            <CardFooter>
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !hasChanges}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enregistrer les modifications
                </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </>
  );
}
