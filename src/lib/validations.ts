import { z } from "zod"

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
})

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  phone: z.string().optional(),
})

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  comparePrice: z.number().positive().optional(),
  images: z.array(z.string()).min(1, "At least one image is required"),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().optional(),
})

export const checkoutSchema = z.object({
  email: z.string().email(),
  address: addressSchema,
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type ProductInput = z.infer<typeof productSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
