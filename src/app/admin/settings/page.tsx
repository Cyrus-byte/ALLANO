
"use client";

import { useState, useEffect } from 'react';
import Script from 'next/script';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { getHomepageHeroUrl, updateHomepageHeroUrl } from '@/lib/settings-service';
import { Skeleton } from '@/components/ui/skeleton';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function AdminSettingsPage() {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [newHeroImageUrl, setNewHeroImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const url = await getHomepageHeroUrl();
      setHeroImageUrl(url);
      setNewHeroImageUrl(url); // Start with the current image
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
      multiple: false,
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
        setNewHeroImageUrl(result.info.secure_url);
        toast({ title: "Image téléversée", description: "Cliquez sur 'Enregistrer' pour appliquer."});
        setIsUploading(false);
      }
    });
    myWidget.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeroImageUrl) {
        toast({ title: "Aucune image sélectionnée", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
        await updateHomepageHeroUrl(newHeroImageUrl);
        setHeroImageUrl(newHeroImageUrl);
        toast({ title: "Succès !", description: "L'image de la page d'accueil a été mise à jour." });
    } catch (error) {
        console.error(error);
        toast({ title: "Erreur", description: "Impossible de sauvegarder le paramètre.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  }

  if(loading) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full aspect-video" />
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
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Personnalisation</CardTitle>
              <CardDescription>
                Modifiez les éléments visuels de votre site, comme l'image de la page d'accueil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <h3 className="font-semibold">Image de la page d'accueil</h3>
                    <div className="relative w-full aspect-video rounded-md overflow-hidden border bg-muted">
                        <Image 
                            src={newHeroImageUrl || "https://placehold.co/1600x900.png"} 
                            alt="Aperçu de l'image d'accueil" 
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                <Button onClick={handleUploadClick} type="button" variant="outline" className="w-full" disabled={isUploading}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Changer l'image
                </Button>
            </CardContent>
            <CardFooter>
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || newHeroImageUrl === heroImageUrl}>
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
