"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    empId: zod_1.z.string().min(1).optional(),
    name: zod_1.z.string().min(2).optional(),
    contactNo: zod_1.z
        .string()
        .regex(/^\d{10}$/, 'Contact number must be exactly 10 digits')
        .optional(),
    designation: zod_1.z.string().optional(),
    workState: zod_1.z.string().optional(),
    workLocation: zod_1.z.string().optional(),
    reportingManager: zod_1.z.string().optional(),
    reportingNo: zod_1.z.string().optional(),
    leaveApproval: zod_1.z.string().optional(),
    leaveAppNo: zod_1.z.string().optional(),
    role: zod_1.z.enum(['admin', 'user']).default('user'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email'),
    password: zod_1.z.string().min(1, 'Password required'),
});
//# sourceMappingURL=user.schema.js.map