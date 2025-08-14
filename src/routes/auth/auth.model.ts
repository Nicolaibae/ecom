import e from "express";
import { TypeOfVerificationCode, UserStatus } from "src/shared/constants/auth.constant";
import { UserSchema } from "src/shared/models/shared-user.model";
import { z, infer as zInfer } from "zod";





export const RegisterBodySchema = UserSchema.pick({
    email:true,
    password:true,
    name:true,
    phoneNumber:true,
}).extend({
    confirmPassword: z.string().min(6).max(50),

}).strict().superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
        ctx.addIssue({
            code: 'custom',
            message: 'Mật khẩu không khớp',
            path: ['confirmPassword'],
        })
    }
})
export type RegisterBodyType = zInfer<typeof RegisterBodySchema>;

export const RegisterResSchema = UserSchema.omit({
    password: true,
    toptSecret: true,
})
export type RegisterResType = zInfer<typeof RegisterResSchema>;

export const VerificationCodeSchema = z.object({
    id: z.number(),
    email: z.email(),
    code: z.string().length(6),
    type: z.enum([TypeOfVerificationCode.REGISTER, TypeOfVerificationCode.FORGOT_PASSWORD]),
    expiredAt: z.date(),
    createdAt: z.date(),
})
export type VerificationCodeType = zInfer<typeof VerificationCodeSchema>;


export const SendOtpBodySchema = VerificationCodeSchema.pick({
    email: true,
    type: true,
}).strict().superRefine(({ type }, ctx) => {
    if (type !== TypeOfVerificationCode.REGISTER && type !== TypeOfVerificationCode.FORGOT_PASSWORD) {
        ctx.addIssue({
            code: 'custom',
            message: 'Loại mã xác thực không hợp lệ',
        })
    }
})
export type SendOtpBodyType = zInfer<typeof SendOtpBodySchema>;