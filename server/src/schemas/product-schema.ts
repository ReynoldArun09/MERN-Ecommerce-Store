import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3, "Name is Required"),
  description: z
    .string()
    .min(12, "Description must be at least 12 characters long"),
  price: z.number(),
  image: z.string(),
  category: z.string().min(1, "Category is Required"),
  brand: z.string().min(1, "Brand is Required"),
  targetAudience: z.enum(["Men", "Women"]),
  stock: z.number(),
});
