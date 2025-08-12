
import { UserStatus } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'


const UserSchema = z.object({
    id: z.number(),
    email: z.email(),
    name: z.string().min(1).max(100),
    phoneNumber: z.string().min(10).max(15),
    avatar: z.string().nullable(),
    status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
    roleId: z.number(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
    
    
})

const RegisterBodySchema = z.object({
    email: z.email(),
    password: z.string().min(6).max(50),
    name: z.string().min(1).max(100),
    confirmPassword: z.string().min(6).max(50),
    phoneNumber: z.string().min(10).max(15)

}).strict().superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
        ctx.addIssue({
            code: 'custom',
            message: 'Mật khẩu không khớp',
            path: ['confirmPassword'],
        })
    }
})
export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}
export class RegisterResDto extends createZodDto(UserSchema) {}
