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
