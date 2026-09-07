import { z } from 'zod';

export const JoinPoolSchema = z.object({
  poolId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const UpdateProfileSchema = z.object({
  phone: z.string().min(10).max(15),
  company_name: z.string().min(2).max(100),
  address: z.string().min(5).max(255),
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
