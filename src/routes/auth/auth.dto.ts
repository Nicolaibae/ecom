
import { createZodDto } from 'nestjs-zod'
import { RegisterBodySchema, RegisterResSchema, SendOtpBodySchema } from './auth.model';
import e from 'express';



export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}
export class RegisterResDto extends createZodDto(RegisterResSchema) {}

export class SendOtpBody extends createZodDto(SendOtpBodySchema){}
