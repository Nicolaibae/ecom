import z from "zod";
import { UserStatus } from "../constants/auth.constant";

export const UserSchema = z.object({
    id: z.number(),
    email: z.email(),
    name: z.string().min(1).max(100),
    password: z.string().min(6).max(50),
    phoneNumber: z.string().min(10).max(15),
    avatar: z.string().nullable(),
    totpSecret: z.string().nullable().optional(),
    status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
    roleId: z.number().positive(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
    
})
export type UserType = z.Infer<typeof UserSchema>;