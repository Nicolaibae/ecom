import { ConflictException, HttpException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { RolesService } from './role.service';
import { HashingService } from 'src/shared/services/hashing.service';
import { generateOtp, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helper';
import { ForgotPasswordBodyType, LoginBodyType, RefreshTokenBodyType, RefreshTokenType, RegisterBodyType, SendOtpBodyType } from './auth.model';
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
import { EmailAlreadyExistsException, EmailNotFoundException, FailedToSendOTPException, InvalidOTPException, InvalidPasswordException, OTPExpiredException, RefreshTokenAlreadyUsedException, UnauthorizedAccessException } from './error.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly rolesService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: ShareUserRepository,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
  ) {}
  async register(body: RegisterBodyType) {
    try {
      const vevificationCode = await this.authRepository.findVerificationCode({
        email: body.email,
        code: body.code,
        type: TypeOfVerificationCode.REGISTER,
      })
      if (!vevificationCode) {
        throw InvalidOTPException
      }
      if (vevificationCode.expiredAt < new Date()) {
        throw OTPExpiredException
      }
      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(body.password)
      return await this.authRepository.createUser({
        email: body.email,
        name: body.name,
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        roleId: clientRoleId,
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailAlreadyExistsException
      }
      throw error
    }
  }

  async sendOTP(body: SendOtpBodyType) {
    // 1. Kiểm tra email đã tồn tại trong database chưa
    const user = await this.sharedUserRepository.findUnique({
      email: body.email,
    })
    if (user) {
      throw EmailAlreadyExistsException
    }
    // 2. Tạo mã OTP
    const code = generateOtp()
    const verificationCode = this.authRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiredAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN as ms.StringValue)),
    })
    // 3. Gửi mã OTP
    const { error } = await this.emailService.sendOtp({
      email: body.email,
      code,
    })
    if (error) {
      throw FailedToSendOTPException
    }
    return { message: 'Gửi mã OTP thành công' }
  }

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    const user = await this.authRepository.findUniqueUserInclueRole({
      email: body.email,
    })

    if (!user) {
      throw EmailNotFoundException
    }

    const isPasswordMatch = await this.hashingService.compare(body.password, user.password)
    if (!isPasswordMatch) {
      throw InvalidPasswordException
    }
    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: body.userAgent,
      ip: body.ip,
    })
    const tokens = await this.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
    })
    return tokens
  }

  async generateTokens({ userId, deviceId, roleId, roleName }: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        deviceId,
        roleId,
        roleName,
      }),
      this.tokenService.signRefreshToken({
        userId,
      }),
    ])
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId,
    })
    return { accessToken, refreshToken }
  }

  async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      // 1. Kiểm tra refreshToken có hợp lệ không
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)
      // 2. Kiểm tra refreshToken có tồn tại trong database không
      const refreshTokenInDb = await this.authRepository.findUniqueRefreshokenIncludeUserRole({
        token: refreshToken,
      })
      if (!refreshTokenInDb) {
        // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
        // refresh token của họ đã bị đánh cắp
        throw RefreshTokenAlreadyUsedException
      }
      const {
        deviceId,
       user: {
          roleId,
          role: { name: roleName },
        },
      } = refreshTokenInDb
      // 3. Cập nhật device
      const $updateDevice = this.authRepository.UpdateDevice(deviceId, {
        ip,
        userAgent,
      })
      // 4. Xóa refreshToken cũ
      const $deleteRefreshToken = this.authRepository.DeleteRefreshToken({
        token: refreshToken,
      })
      // 5. Tạo mới accessToken và refreshToken
      const $tokens = this.generateTokens({ userId, roleId, roleName, deviceId })
      const [, , tokens] = await Promise.all([$updateDevice, $deleteRefreshToken, $tokens])
      return tokens
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw UnauthorizedAccessException
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
      // 3. Cập nhật device là đã logout
      await this.authRepository.UpdateDevice(deletedRefreshToken.deviceId, {
        isActive: false,
      })
      return { message: 'Đăng xuất thành công' }
    } catch (error) {
      // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
      // refresh token của họ đã bị đánh cắp
      if (isNotFoundPrismaError(error)) {
        throw RefreshTokenAlreadyUsedException
      }
      throw UnauthorizedAccessException
    }
  }
  async forgotPassword(body: ForgotPasswordBodyType) {}
}

