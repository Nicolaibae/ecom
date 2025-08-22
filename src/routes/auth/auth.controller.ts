import { Body, Controller, Ip, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginBodyDto, LoginResDto, RegisterBodyDto, RegisterResDto, SendOtpBody } from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,

  ) { }
  @Post('register')
  @ZodSerializerDto(RegisterResDto)
  async register(@Body() body: RegisterBodyDto) {

    return await this.authService.register(body);
  }
  @Post('otp')

  async sendOtp(@Body() body: SendOtpBody) {
    return await this.authService.sendOtp(body);
  }
  @Post('login')
  @ZodSerializerDto(LoginResDto)
  async login(@Body() body: LoginBodyDto, @UserAgent() userAgent: string, @Ip() ip:string ) {
    return this.authService.login({
      ...body,
      userAgent,
      ip
    })
  }

  // @Post('refresh-token')
  // @HttpCode(HttpStatus.OK)
  // async refreshToken(@Body() body: any) {
  //   return this.authService.refreshToken(body.refreshToken)
  // }

  // @Post('logout')
  // async logout(@Body() body: any) {
  //   return this.authService.logout(body.refreshToken)
  // }
}
