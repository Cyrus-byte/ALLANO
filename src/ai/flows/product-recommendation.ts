'use server';
/**
 * @fileOverview Provides personalized product recommendations based on user history.
 *
 * This file exports:
 * - `getProductRecommendations`: A function to retrieve product recommendations.
 * - `productRecommendationFlow`: The Genkit flow for recommendations.
 * - `ProductRecommendationInput`: The input type for `getProductRecommendations`.
 * - `ProductRecommendationOutput`: The output type for `getProductRecommendations`.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductRecommendationInputSchema = z.object({
  userId: z.string().describe('The ID of the user to generate recommendations for.'),
  browsingHistory: z.array(z.string()).optional().describe('The user browsing history'),
  pastPurchases: z.array(z.string()).optional().describe('The user past purchases')
});
export type ProductRecommendationInput = z.infer<typeof ProductRecommendationInputSchema>;

const ProductRecommendationOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('A list of recommended product IDs.')
});
export type ProductRecommendationOutput = z.infer<typeof ProductRecommendationOutputSchema>;

export async function getProductRecommendations(input: ProductRecommendationInput): Promise<ProductRecommendationOutput> {
  return productRecommendationFlow(input);
}

const productRecommendationPrompt = ai.definePrompt({
  name: 'productRecommendationPrompt',
  input: {schema: ProductRecommendationInputSchema},
  output: {schema: ProductRecommendationOutputSchema},
  prompt: `You are a product recommendation expert for Allano, an e-commerce platform in Burkina Faso.

  Based on the user's past purchases and browsing history, recommend products that they might be interested in.
  Respond in french.

  User ID: {{{userId}}}
  Browsing History: {{#if browsingHistory}}{{#each browsingHistory}}- {{{this}}}{{/each}}{{else}}None{{/if}}
  Past Purchases: {{#if pastPurchases}}{{#each pastPurchases}}- {{{this}}}{{/each}}{{else}}None{{/if}}

  Recommend a diverse range of products. Only return the product IDs as a JSON array.
  `,
});

export const productRecommendationFlow = ai.defineFlow(
  {
    name: 'productRecommendationFlow',
    inputSchema: ProductRecommendationInputSchema,
    outputSchema: ProductRecommendationOutputSchema,
  },
  async input => {
    const {output} = await productRecommendationPrompt(input);
    return output!;
  }
);
