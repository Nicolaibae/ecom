import { ConflictException, HttpException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { RolesService } from './role.service';
import { HashingService } from 'src/shared/services/hashing.service';
import { generateOtp, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helper';
import { LoginBodyType, RefreshTokenBodyType, RefreshTokenType, RegisterBodyType, SendOtpBodyType } from './auth.model';
import { AuthRepository } from './auth.repo';
import { ShareUserRepository } from 'src/shared/repositories/share-user.repo';
import ms from 'ms';
import { addMilliseconds } from 'date-fns';
import envConfig from 'src/shared/config';
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant';
import path from 'path';
import { EmailService } from 'src/shared/services/email.service';
import { TokenService } from 'src/shared/services/token.service';
import { AccessTokenPayloadCreate } from 'src/shared/types/jwt.type';
import { HttpExceptionFilter } from 'src/shared/filters/http-exception.filter';
import { InvalidOTPException } from './error.model';

@Injectable()
export class AuthService {
    constructor(
        private readonly rolesService: RolesService,
        private readonly sharedUserRepository: ShareUserRepository,
        private readonly authRepository: AuthRepository,
        private readonly hashService: HashingService,
        private readonly emailService: EmailService,
        private readonly tokenService: TokenService
    ) { }
    async register(body: RegisterBodyType): Promise<any> {
        try {
            const verificationCode = await this.authRepository.findVerificationCode({
                email: body.email,
                code: body.code,
                type: TypeOfVerificationCode.REGISTER,

            })
            if (!verificationCode) {
                throw InvalidOTPException
            }
            // Kiểm tra mã xác thực có hết hạn không
            if (verificationCode.expiredAt < new Date()) {
                throw new UnprocessableEntityException([
                    {
                        message: 'Mã xác thực đã hết hạn',
                        path: 'code',
                    }
                ]);
            }
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
            if (user) {
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
                expiredAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN as ms.StringValue)) // 5 phút
            });
            const { error } = await this.emailService.sendOtp({
                email: body.email,
                code
            })
            if (error) {
                throw new UnprocessableEntityException({
                    message: "Gui max otp that bai",
                    path: "code"
                })
            }
            return {message: 'Gửi mã OTP thành công' }
        } catch (error) {
            throw error;
        }
    }
    async login(body: LoginBodyType & { userAgent: string, ip: string }) {
        // console.log('agent',body.userAgent)
        // console.log('ip',body.ip)
        const user = await this.authRepository.findUniqueUserInclueRole({

            email: body.email,

        })


        if (!user) {
            throw new UnprocessableEntityException({
                message: "Email khong ton tai",
                path: "Email"
            })
        }


        const isPasswordMatch = await this.hashService.compare(body.password, user.password)
        if (!isPasswordMatch) {
            throw new UnprocessableEntityException([
                {
                    field: 'password',
                    error: 'Mat khau khong dung',
                },
            ])
        }
        const device = await this.authRepository.createDevice({
            userId: user.id,
            userAgent: body.userAgent,
            ip: body.ip
        })

        const tokens = await this.generateTokens({
            userId: user.id,
            deviceId: device.id,
            roleId: user.roleId,
            roleName: user.role.name

        })
        console.log('1')
        return tokens
    }

    async generateTokens({ userId, deviceId, roleId, roleName }: AccessTokenPayloadCreate) {
        const [accessToken, refreshToken] = await Promise.all([
            this.tokenService.signAccessToken({
                userId,
                deviceId,
                roleId,
                roleName
            }),
            this.tokenService.signRefreshToken({ userId }),
        ])
        const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
        await this.authRepository.createRefreshToken({

            token: refreshToken,
            userId,
            expiresAt: new Date(decodedRefreshToken.exp * 1000),
            deviceId

        })
        return { accessToken, refreshToken }
    }

    async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenBodyType & { userAgent: string, ip: string }) {
        try {
            // 1. Kiểm tra refreshToken có hợp lệ không
            const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)
            // 2. Kiểm tra refreshToken có tồn tại trong database không
            const refreshTokenInDb = await this.authRepository.findUniqueRefreshokenIncludeUserRole({
                token: refreshToken
            })
            console.log(refreshTokenInDb)
            // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
            // refresh token của họ đã bị đánh cắp
            if (!refreshTokenInDb) {
                throw new UnauthorizedException('Refresh token của bạn đã được sử dụng')
            }
            const { deviceId, user: { roleId, name: roleName } } = refreshTokenInDb
            //3.cập nhập device
            const $updateDevice = this.authRepository.UpdateDevice(deviceId, { userAgent, ip })
            // 4. Xóa refreshToken cũ
            const $deleteRefrehToken = await this.authRepository.DeleteRefreshToken({
                token: refreshToken,
            })
            // // 5. Tạo mới accessToken và refreshToken
            const $tokens = await this.generateTokens({ userId, deviceId, roleId, roleName })
            const [, , tokens] = await Promise.all([
                $updateDevice,$deleteRefrehToken,$tokens
            ])
            return tokens
        } catch (error) {
            if(error instanceof HttpException){
                throw error
            }
            throw new UnauthorizedException()
        }
    }

    async logout(refreshToken: string) {
      try {
        // 1. Kiểm tra refreshToken có hợp lệ không
        await this.tokenService.verifyRefreshToken(refreshToken)
        // 2. Xóa refreshToken trong database
        const deletedRefreshToken = await this.authRepository.DeleteRefreshToken({
            token: refreshToken,
        })
        //3. cập nhập device thành không hoạt động
        await this.authRepository.UpdateDevice(deletedRefreshToken.deviceId,{ isActive: false })
        return { message: 'Đăng xuất thành công' }
      } catch (error) {
        // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
        // refresh token của họ đã bị đánh cắp
        if (isNotFoundPrismaError(error)) {
          throw new UnauthorizedException('Refresh token đã được sử dụng')
        }
        throw new UnauthorizedException()
      }
    }

}

