import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RolesService } from 'src/routes/auth/role.service';
import { RegisterBodyDto, RegisterResDto, SendOtpBody } from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';

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
  // @Post('login')
  // async login(@Body() body: any) {
  //   return this.authService.login(body)
  // }

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
