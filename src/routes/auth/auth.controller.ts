import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetAuthorizationUrlResDTO, LoginBodyDto, LoginResDto, LogoutBodyDTO, RefreshTokenBodyDTO, RefreshTokenResDTO, RegisterBodyDto, RegisterResDto, SendOtpBody } from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';
import { MessageResDTO } from 'src/shared/dtos/reponse.dto';
import { IsPublic } from 'src/shared/decorators/auth.decorator';
import { GoogleService } from './google.service';
import { GetAuthorizationUrlResSchema } from './auth.model';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly googleService: GoogleService

  ) { }
  @Post('register')
  @IsPublic()
  @ZodSerializerDto(RegisterResDto)
  async register(@Body() body: RegisterBodyDto) {

    return await this.authService.register(body);
  }
  @Post('otp')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  async sendOtp(@Body() body: SendOtpBody) {
    return await this.authService.sendOtp(body);
  }
  @Post('login')
  @IsPublic()
  @ZodSerializerDto(LoginResDto)
  async login(@Body() body: LoginBodyDto, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.login({
      ...body,
      userAgent,
      ip
    })
  }

  @Post('refresh-token')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResDTO)
  async refreshToken(@Body() body: RefreshTokenBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.refreshToken({
      refreshToken: body.refreshToken,
      userAgent,
      ip
    })
  }

  @Post('logout')
  @ZodSerializerDto(MessageResDTO)
  async logout(@Body() body: LogoutBodyDTO) {
    return this.authService.logout(body.refreshToken)
  }
  @Get('google-link')
  @IsPublic()
  @ZodSerializerDto(GetAuthorizationUrlResDTO)
   async getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleService.getAuthorizationUrl({
      userAgent,
      ip,
    });
   }
}
