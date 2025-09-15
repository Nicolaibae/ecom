
import { createZodDto } from 'nestjs-zod'
import { DisableTwoFactorBodySchema, ForgotPasswordBodySchema, LoginBodySchema, LoginResSchema, LogoutBodySchema, RefreshTokenBodySchema, RefreshTokenResSchema, RegisterBodySchema, RegisterResSchema, SendOtpBodySchema, TwoFactorSetupResSchema } from './auth.model';




export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}
export class RegisterResDto extends createZodDto(RegisterResSchema) {}

export class SendOtpBody extends createZodDto(SendOtpBodySchema){}
export class LoginBodyDto extends createZodDto(LoginBodySchema){}
export class LoginResDto extends createZodDto(LoginResSchema){}
export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {}

export class RefreshTokenResDTO extends createZodDto(RefreshTokenResSchema) {}

export class LogoutBodyDTO extends createZodDto(LogoutBodySchema) {}
export class GetAuthorizationUrlResDTO extends createZodDto(RefreshTokenResSchema) {}
export class ForgotPasswordBodyDTO extends createZodDto(ForgotPasswordBodySchema) {}

export class TwoFactorSetupResDTO extends createZodDto(TwoFactorSetupResSchema) {}

export class DisableTwoFactorBodyDTO extends createZodDto(DisableTwoFactorBodySchema) {}

