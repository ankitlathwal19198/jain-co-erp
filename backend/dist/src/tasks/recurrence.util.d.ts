import { TaskFrequency } from '@prisma/client';
export declare function addPeriod(date: Date, frequency: TaskFrequency, count?: number): Date;
export declare function startOfUtcDay(date: Date): Date;
export declare function diffInDays(later: Date, earlier: Date): number;
