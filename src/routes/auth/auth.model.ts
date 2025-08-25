import { ExternalExceptionFilter } from "@nestjs/core/exceptions/external-exception-filter";
import e from "express";
import { TypeOfVerificationCode, UserStatus } from "src/shared/constants/auth.constant";
import { UserSchema } from "src/shared/models/shared-user.model";
import { z, infer as zInfer } from "zod";





export const RegisterBodySchema = UserSchema.pick({
    email: true,
    password: true,
    name: true,
    phoneNumber: true,
}).extend({
    confirmPassword: z.string().min(6).max(50),
    code: z.string().length(6)

}).strict().superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
        ctx.addIssue({
            code: 'custom',
            message: 'Mật khẩu không khớp',
            path: ['confirmPassword'],
        })
    }
})


export const RegisterResSchema = UserSchema.omit({
    password: true,
    toptSecret: true,
})


export const VerificationCodeSchema = z.object({
    id: z.number(),
    email: z.email(),
    code: z.string().length(6),
    type: z.enum([TypeOfVerificationCode.REGISTER, TypeOfVerificationCode.FORGOT_PASSWORD, TypeOfVerificationCode.LOGIN, TypeOfVerificationCode.DISDISABLE_2FA]),
    expiredAt: z.date(),
    createdAt: z.date(),
})



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


export const LoginBodySchema = UserSchema.pick({
    email: true,
    password: true
}).strict()


export const LoginResSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string()
})


export const RefreshTokenBodySchema = z.object({
    refreshToken: z.string()
})


export const RefreshTokenResSchema = LoginResSchema


export const DeviceSchema = z.object({
    id: z.number(),
    userId: z.number(),
    userAgent: z.string(),
    ip: z.string(),
    lastActive: z.date(),
    createdAt: z.date(),
    isActive: z.boolean()
})


export const RoleSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    isActive: z.boolean(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
})
export const RefreshTokenSchema = z.object({
  token: z.string(),
  userId: z.number(),
  deviceId: z.number(),
  expiresAt: z.date(),
  createdAt: z.date(),
})
export const LogoutBodySchema = RefreshTokenBodySchema
export const GoogleAuthStateSchema = DeviceSchema.pick({
  userAgent: true,
  ip: true,
})
export const GetAuthorizationUrlResSchema = z.object({
  url: z.string(),
})




export type DeviceType = zInfer<typeof DeviceSchema>;
export type RegisterBodyType = zInfer<typeof RegisterBodySchema>;
export type RegisterResType = zInfer<typeof RegisterResSchema>;
export type VerificationCodeType = zInfer<typeof VerificationCodeSchema>;
export type SendOtpBodyType = zInfer<typeof SendOtpBodySchema>;
export type LoginBodyType = zInfer<typeof LoginBodySchema>;
export type LoginResType = zInfer<typeof LoginResSchema>;
export type RefreshTokenBodyType = zInfer<typeof RefreshTokenBodySchema>;
export type RefreshTokenResType = LoginResType
export type RefreshTokenType =  zInfer<typeof RefreshTokenSchema>;
export type LogoutBodyType = RefreshTokenBodyType
export type GoogleAuthStateType = zInfer<typeof GoogleAuthStateSchema>;
export type RoleType = zInfer<typeof RoleSchema>;
export type GetAuthorizationUrlResType = zInfer<typeof GetAuthorizationUrlResSchema>;