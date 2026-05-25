import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    empId: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    contactNo: z.ZodOptional<z.ZodString>;
    designation: z.ZodOptional<z.ZodString>;
    workState: z.ZodOptional<z.ZodString>;
    workLocation: z.ZodOptional<z.ZodString>;
    reportingManager: z.ZodOptional<z.ZodString>;
    reportingNo: z.ZodOptional<z.ZodString>;
    leaveApproval: z.ZodOptional<z.ZodString>;
    leaveAppNo: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodEnum<{
        user: "user";
        admin: "admin";
    }>>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
