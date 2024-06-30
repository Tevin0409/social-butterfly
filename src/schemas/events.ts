import { z } from "zod";

export const EventSchema = z.object({
  createdAt: z
    .string()
    .datetime()
    .optional()
    .default(() => new Date().toISOString()),
  description: z.string(),
  id: z.string().cuid().optional(),
  eventCreatedById: z.string().cuid(),
  location: z.object({
    longitude: z.number(),
    latitude: z.number(),
  }),
  mapData: z.object({
    longitude: z.number(),
    latitude: z.number(),
  }),
  photos: z.array(z.string().url()),
  price: z.number().nonnegative(),
  title: z.string(),
  updatedAt: z
    .string()
    .datetime()
    .optional()
    .default(() => new Date().toISOString()),
  // Additional fields not present in ListingSchema
});
