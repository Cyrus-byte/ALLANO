
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, Upload, Search, Wand2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { ProductCard } from '@/components/product/product-card';
import { findSimilarProducts } from '@/ai/flows/visual-search-flow';
import type { Product } from '@/lib/types';
import Link from 'next/link';

export default function VisualSearchPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (showCamera) {
        const getCameraPermission = async () => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError("La caméra n'est pas supportée sur ce navigateur.");
                setHasCameraPermission(false);
                return;
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setHasCameraPermission(true);
                if (videoRef.current) {
                videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Error accessing camera:', err);
                setError('Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur.');
                setHasCameraPermission(false);
                 toast({
                    variant: 'destructive',
                    title: 'Accès à la caméra refusé',
                    description: 'Veuillez autoriser l\'accès à la caméra pour utiliser cette fonctionnalité.',
                });
            }
        };
        getCameraPermission();
    } else {
        // Stop camera stream when not shown
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [showCamera, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        setImageData(dataUri);
        setShowCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUri = canvas.toDataURL('image/jpeg');
            setImagePreview(dataUri);
            setImageData(dataUri);
        }
        setShowCamera(false);
    }
  };

  const handleSearch = async () => {
    if (!imageData) {
      toast({ title: 'Aucune image', description: 'Veuillez sélectionner ou prendre une photo.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const similarProducts = await findSimilarProducts({ photoDataUri: imageData });
      setResults(similarProducts);
      if (similarProducts.length === 0) {
        setError("Aucun produit similaire n'a été trouvé.");
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de la recherche. Veuillez réessayer.");
      toast({ title: 'Erreur de recherche', description: "L'IA n'a pas pu traiter votre demande.", variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
            <Button asChild variant="ghost" className="pl-0">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
            </Link>
            </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-2">
            <Wand2 className="text-primary h-7 w-7" />
            Recherche Visuelle
          </CardTitle>
          <CardDescription>
            Trouvez des articles similaires dans notre boutique à partir d'une simple photo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
             {showCamera ? (
                 <div className="space-y-4">
                    <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                    {hasCameraPermission === false && (
                         <Alert variant="destructive">
                            <Camera className="h-4 w-4" />
                            <AlertTitle>Accès à la caméra requis</AlertTitle>
                            <AlertDescription>
                                Veuillez autoriser l'accès à la caméra pour utiliser cette fonctionnalité.
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="flex gap-4">
                        <Button onClick={handleCapture} className="w-full" disabled={!hasCameraPermission}>
                            <Camera className="mr-2 h-4 w-4" />
                            Capturer
                        </Button>
                        <Button onClick={() => setShowCamera(false)} variant="outline">Annuler</Button>
                    </div>
                 </div>
             ) : (
                <div 
                    className="relative w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {imagePreview ? (
                        <Image src={imagePreview} alt="Aperçu de l'image" fill className="object-contain rounded-lg" />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Upload className="h-10 w-10" />
                            <p className="font-semibold">Cliquez pour téléverser une image</p>
                            <p className="text-xs">Ou glissez-déposez un fichier ici</p>
                        </div>
                    )}
                </div>
             )}
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
             <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Téléverser
                </Button>
                <Button variant="outline" onClick={() => setShowCamera(true)}>
                    <Camera className="mr-2 h-4 w-4" />
                    Prendre une photo
                </Button>
            </div>
          </div>
          
          <div>
            <Button onClick={handleSearch} disabled={!imageData || loading} className="w-full" size="lg">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Search className="mr-2 h-4 w-4" />
              Trouver des articles similaires
            </Button>
          </div>
        </CardContent>
      </Card>

      {(loading || results.length > 0 || error) && (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8">Résultats</h2>
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i}><div className="animate-pulse rounded-md bg-muted aspect-[3/4] w-full" /></div>
                    ))}
                </div>
            ) : error ? (
                <p className="text-center text-destructive">{error}</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {results.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
}
