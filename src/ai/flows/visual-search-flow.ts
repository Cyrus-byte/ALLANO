
'use server';
/**
 * @fileOverview Provides visual search capabilities for products.
 *
 * This file exports:
 * - `findSimilarProducts`: A function to find products similar to an image.
 * - `generateProductDescription`: A function to generate a descriptive text for a product image.
 */

import {ai} from '@/ai/genkit';
import { getProducts } from '@/lib/product-service';
import type { Product } from '@/lib/types';
import {z} from 'genkit';

// Schema for generating a description from an image
const GenerateDescriptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateDescriptionInput = z.infer<typeof GenerateDescriptionInputSchema>;

const GenerateDescriptionOutputSchema = z.object({
    description: z.string().describe('A detailed description of the clothing item, including type, color, pattern, style, and material.'),
});

// Prompt to generate a detailed description from an image
const descriptionPrompt = ai.definePrompt({
  name: 'generateDescriptionPrompt',
  input: {schema: GenerateDescriptionInputSchema},
  output: {schema: GenerateDescriptionOutputSchema},
  prompt: `You are a fashion expert. Analyze the provided image of a clothing item and generate a concise, descriptive text.
  Focus on objective attributes like: item type (e.g., t-shirt, dress, jeans), color, pattern (e.g., solid, floral, striped), style (e.g., casual, formal, bohemian), and apparent material (e.g., cotton, denim, silk).
  The description should be a single phrase or sentence. Example: "Short-sleeved white cotton t-shirt with a graphic print."

  Photo: {{media url=photoDataUri}}`,
});

// Flow to generate the description
export const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateDescriptionInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await descriptionPrompt(input);
    return output?.description || '';
  }
);
// Exported wrapper function
export async function generateProductDescription(input: GenerateDescriptionInput): Promise<string> {
  return generateProductDescriptionFlow(input);
}


// Schema for finding similar products
const VisualSearchInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a clothing item to search for, as a data URI."
    ),
});
export type VisualSearchInput = z.infer<typeof VisualSearchInputSchema>;

const VisualSearchOutputSchema = z.object({
  similarProducts: z.array(z.custom<Product>()),
});
export type VisualSearchOutput = z.infer<typeof VisualSearchOutputSchema>;

// This function will be called from the client
export async function findSimilarProducts(input: VisualSearchInput): Promise<Product[]> {
  try {
    // 1. Generate a description for the uploaded image
    const searchDescription = await generateProductDescriptionFlow({ photoDataUri: input.photoDataUri });

    if (!searchDescription) {
        throw new Error("Could not generate a description from the image.");
    }
    
    // 2. Fetch all products from the database
    const allProducts = await getProducts();
    
    const productsWithDescriptions = allProducts.map(p => ({
        id: p.id,
        name: p.name,
        description: p.aiDescription || p.description, // Use AI description if available
    }));
    
    // 3. Use another LLM call to compare the search description with all product descriptions
    const comparisonPrompt = `Based on the search description "${searchDescription}", which of the following products are the most similar?
    Return a ranked list of the top 5 most similar product IDs.
    
    Available products:
    ${JSON.stringify(productsWithDescriptions, null, 2)}
    
    Respond with only a JSON object containing a key "similarProductIds" with an array of strings (the product IDs).
    Example: {"similarProductIds": ["id1", "id2", "id3"]}`;

    const { output } = await ai.generate({
      prompt: comparisonPrompt,
      output: {
        schema: z.object({
            similarProductIds: z.array(z.string()),
        })
      }
    });

    if (!output || !output.similarProductIds) {
        throw new Error("AI could not determine similar products.");
    }

    const similarProductIds = output.similarProductIds;
    const productMap = new Map(allProducts.map(p => [p.id, p]));
    const similarProducts = similarProductIds.map(id => productMap.get(id)).filter(Boolean) as Product[];

    return similarProducts;

  } catch (error) {
    console.error("Error in findSimilarProducts flow:", error);
    throw error;
  }
}
