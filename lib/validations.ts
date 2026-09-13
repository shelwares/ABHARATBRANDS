import { z } from 'zod';

export const JoinPoolSchema = z.object({
  poolId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const UpdateProfileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .max(100, 'Full name is too long')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .min(10, 'Phone must be at least 10 digits')
    .max(15, 'Phone is too long')
    .regex(/^[+\d\s\-()]+$/, 'Invalid phone format')
    .optional()
    .or(z.literal('')),
  company_name: z
    .string()
    .trim()
    .max(200, 'Company name is too long')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address is too long')
    .optional()
    .or(z.literal('')),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10).max(15),
  company_name: z.string().min(2).max(100),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string(),
  category: z.string().min(1).max(100),
  base_image: z.string().optional(),
});

export const CreatePoolSchema = z.object({
  product_id: z.string().uuid(),
  target_quantity: z.number().int().positive(),
  deadline: z.string().datetime({ offset: true }).or(z.string()), // Accept ISO dates or valid strings
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['joined', 'confirmed', 'shipped', 'delivered', 'cancelled']),
});
