import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { RolesService } from './role.service';
import { HashingService } from 'src/shared/services/hashing.service';
import {  generateOtp, isUniqueConstraintPrismaError } from 'src/shared/helper';
import { TokenService } from 'src/shared/services/token.service';
import { RegisterBodyType, SendOtpBodyType } from './auth.model';
import { AuthRepository } from './auth.repo';
import { ShareUserRepository } from 'src/shared/repositories/share-user.repo';
import ms from 'ms';
import { generate } from 'rxjs';
import { addMilliseconds } from 'date-fns';
import envConfig from 'src/shared/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly rolesService: RolesService,
        private readonly sharedUserRepository: ShareUserRepository,
        private readonly authRepository: AuthRepository,
        private readonly hashService: HashingService
    ) { }
    async register(body: RegisterBodyType): Promise<any> {
        try {
            const clientRoleId = await this.rolesService.getClientRoleId();
            const hashedPassword = await this.hashService.hash(body.password);
           
            return await this.authRepository.createUser({

                email: body.email,
                name: body.name,
                phoneNumber: body.phoneNumber,
                password: hashedPassword,
                roleId: clientRoleId
            })
            
            
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw new ConflictException('Email đã tồn tại')
            }
            throw error
        }

    }
    async sendOtp(body: SendOtpBodyType) {
        try {
            // Kiểm tra xem email đã được đăng ký chưa
            const user = await this.sharedUserRepository.findUnique({ email: body.email });
            if(user) {
                throw new UnauthorizedException([
                    {
                    message: 'Email đã được đăng ký',
                    path: 'email',
                    }
                ]);
            }
            // Tạo mã OTP
            const code = generateOtp()
            const verificationCode = await this.authRepository.createVerificationCode({
                email: body.email,
                code,
                type: body.type,
                expiredAt: addMilliseconds(new Date(),ms(envConfig.OTP_EXPIRES_IN)) // 5 phút
            });

        } catch (error) {
            
        }
    }
  //   async login(body: any) {
  //   const user = await this.prismaService.user.findFirst({
  //     where: {
  //       email: body.email,
  //     },
  //   })

  //   if (!user) {
  //     throw new UnauthorizedException('Account is not exist')
  //   }

  //   const isPasswordMatch = await this.hashService.compare(body.password, user.password)
  //   if (!isPasswordMatch) {
  //     throw new UnprocessableEntityException([
  //       {
  //         field: 'password',
  //         error: 'Password is incorrect',
  //       },
  //     ])
  //   }
  //   const tokens = await this.generateTokens({ userId: user.id })
  //   return tokens
  // }

  // async generateTokens(payload: { userId: number }) {
  //   const [accessToken, refreshToken] = await Promise.all([
  //     this.tokenService.signAccessToken(payload),
  //     this.tokenService.signRefreshToken(payload),
  //   ])
  //   const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
  //   await this.prismaService.refreshToken.create({
  //     data: {
  //       token: refreshToken,
  //       userId: payload.userId,
  //       deviceId: 0, 
  //       expiresAt: new Date(decodedRefreshToken.exp * 1000),
  //     },
  //   })
  //   return { accessToken, refreshToken }
  // }

  // async refreshToken(refreshToken: string) {
  //   try {
  //     // 1. Kiểm tra refreshToken có hợp lệ không
  //     const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)
  //     // 2. Kiểm tra refreshToken có tồn tại trong database không
  //     await this.prismaService.refreshToken.findUniqueOrThrow({
  //       where: {
  //         token: refreshToken,
  //       },
  //     })
  //     // 3. Xóa refreshToken cũ
  //     await this.prismaService.refreshToken.delete({
  //       where: {
  //         token: refreshToken,
  //       },
  //     })
  //     // 4. Tạo mới accessToken và refreshToken
  //     return await this.generateTokens({ userId })
  //   } catch (error) {
  //     // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
  //     // refresh token của họ đã bị đánh cắp
  //     if (isNotFoundPrismaError(error)) {
  //       throw new UnauthorizedException('Refresh token has been revoked')
  //     }
  //     throw new UnauthorizedException()
  //   }
  // }

  // async logout(refreshToken: string) {
  //   try {
  //     // 1. Kiểm tra refreshToken có hợp lệ không
  //     await this.tokenService.verifyRefreshToken(refreshToken)
  //     // 2. Xóa refreshToken trong database
  //     await this.prismaService.refreshToken.delete({
  //       where: {
  //         token: refreshToken,
  //       },
  //     })
  //     return { message: 'Logout successfully' }
  //   } catch (error) {
  //     // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
  //     // refresh token của họ đã bị đánh cắp
  //     if (isNotFoundPrismaError(error)) {
  //       throw new UnauthorizedException('Refresh token has been revoked')
  //     }
  //     throw new UnauthorizedException()
  //   }
  // }

}

