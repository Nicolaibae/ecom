
import { createZodDto } from 'nestjs-zod'
import { LoginBodySchema, LoginResSchema, LogoutBodySchema, RefreshTokenBodySchema, RefreshTokenResSchema, RegisterBodySchema, RegisterResSchema, SendOtpBodySchema } from './auth.model';
import e from 'express';



export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}
export class RegisterResDto extends createZodDto(RegisterResSchema) {}

export class SendOtpBody extends createZodDto(SendOtpBodySchema){}
export class LoginBodyDto extends createZodDto(LoginBodySchema){}
export class LoginResDto extends createZodDto(LoginResSchema){}
export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {}

export class RefreshTokenResDTO extends createZodDto(RefreshTokenResSchema) {}

export class LogoutBodyDTO extends createZodDto(LogoutBodySchema) {}
