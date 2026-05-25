import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  empId: z.string().min(1).optional(),
  name: z.string().min(2).optional(),
  contactNo: z
    .string()
    .regex(/^\d{10}$/, 'Contact number must be exactly 10 digits')
    .optional(),
  designation: z.string().optional(),
  workState: z.string().optional(),
  workLocation: z.string().optional(),
  reportingManager: z.string().optional(),
  reportingNo: z.string().optional(),
  leaveApproval: z.string().optional(),
  leaveAppNo: z.string().optional(),
  role: z.enum(['admin', 'user']).default('user'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
