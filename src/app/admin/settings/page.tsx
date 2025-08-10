
"use client";

import { useState, useEffect } from 'react';
import Script from 'next/script';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X } from 'lucide-react';
import { getHomepageSettings, updateHomepageSettings, type HomepageSettings } from '@/lib/settings-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const defaultSettings: HomepageSettings = {
    heroImageUrls: [],
    heroHeadline: 'La Mode, Réinventée.',
    heroSubheadline: 'Découvrez les dernières tendances et exprimez votre style unique avec Allano.'
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<HomepageSettings>(defaultSettings);
  const [initialSettings, setInitialSettings] = useState<HomepageSettings>(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const fetchedSettings = await getHomepageSettings();
      // Use fetched settings or fall back to defaults, allowing empty strings
      const currentSettings = {
          heroImageUrls: fetchedSettings?.heroImageUrls || defaultSettings.heroImageUrls,
          heroHeadline: fetchedSettings?.heroHeadline ?? defaultSettings.heroHeadline,
          heroSubheadline: fetchedSettings?.heroSubheadline ?? defaultSettings.heroSubheadline,
      };
      setSettings(currentSettings);
      setInitialSettings(currentSettings);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleUploadClick = () => {
    // @ts-ignore
    if (!window.cloudinary) {
        toast({
            title: "Le service de téléversement n'est pas prêt",
            description: "Veuillez patienter quelques instants et réessayer.",
            variant: "destructive"
        });
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
            return;
        }
        if (result.event === "success") { 
            setSettings(prev => ({...prev, heroImageUrls: [...prev.heroImageUrls, result.info.secure_url]}));
            toast({ title: "Image ajoutée", description: "Cliquez sur 'Enregistrer' pour appliquer."});
        }
    });
    myWidget.open();
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setSettings(prev => ({...prev, heroImageUrls: prev.heroImageUrls.filter(url => url !== urlToRemove)}));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({...prev, [id]: value }));
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        await updateHomepageSettings(settings);
        setInitialSettings(settings);
        toast({ title: "Succès !", description: "Les paramètres de la page d'accueil ont été mis à jour." });
    } catch (error) {
        console.error(error);
        toast({ title: "Erreur", description: "Impossible de sauvegarder les paramètres.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  if(loading) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-24 w-full" />
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
                Gérez le contenu de la section principale de la page d'accueil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4 border-b pb-6">
                    <div className="space-y-2">
                        <Label htmlFor="heroHeadline">Titre principal</Label>
                        <Input id="heroHeadline" value={settings.heroHeadline || ''} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="heroSubheadline">Sous-titre</Label>
                        <Textarea id="heroSubheadline" value={settings.heroSubheadline || ''} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold">Images du carrousel</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                       {settings.heroImageUrls.map((url) => (
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
