import { z } from 'zod';

export const PriceAlertSchema = z.object({
  email: z.string().email(),
  windowLabel: z.string(),
  origin: z.string().length(3),
  startStr: z.string(),
  endStr: z.string(),
  currentPrice: z.number(),
  targetPrice: z.number(),
  currency: z.string(),
  destination: z.string(),
});

export type PriceAlert = z.infer<typeof PriceAlertSchema>;

export interface StoredPriceAlert extends PriceAlert {
  id: string;
  createdAt: number;
  lastChecked?: number;
  triggered: boolean;
}
