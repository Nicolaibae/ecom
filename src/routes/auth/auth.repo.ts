import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import { DeviceType, RefreshTokenType, RegisterBodyType, RoleType, VerificationCodeType } from "./auth.model";
import { UserType } from "src/shared/models/shared-user.model";
import { TypeOfVerificationCodeType } from "src/shared/constants/auth.constant";
@Injectable()


export class AuthRepository {
    findUserByEmail(email: string) {
        throw new Error('Method not implemented.');
    }

    constructor(
        private readonly prismaService: PrismaService
    ) { }
    async createUser(user: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'email' | 'name' | 'password' | 'phoneNumber' | 'roleId'> & { avatar?: string | null }): Promise<Omit<UserType, 'password' | 'toptSecret'>> {
        return this.prismaService.user.create({
            data: user,
            omit: {
                password: true,
                totpSecret: true,

            }
        });
    }
    async createUserInclueRole(
        user: Pick<UserType, 'email' | 'name' | 'password' | 'phoneNumber' | 'avatar' | 'roleId'>,
    ): Promise<UserType & { role: RoleType }> {
        return this.prismaService.user.create({
            data: user,
            include: {
                role: true,
            },
        })
    }
    async createVerificationCode(payload: Pick<VerificationCodeType, 'email' | 'type' | 'code' | 'expiredAt'>): Promise<VerificationCodeType> {
        return this.prismaService.verificationCode.upsert({
            where: {
                email_type: {
                    email: payload.email,
                    type: payload.type,
                },
            },
            create: payload,
            update: {
                code: payload.code,
                expiredAt: payload.expiredAt,
            }
        });
    }
    async findVerificationCode(
    uniqueValue:
      | { id: number }
      | {
          email_type: {
            email: string
            type: TypeOfVerificationCodeType
          }
        },
  ): Promise<VerificationCodeType | null> {
    return this.prismaService.verificationCode.findUnique({
      where: uniqueValue,
    }) as any
  }
    async createRefreshToken(data: { token: string, userId: number, expiresAt: Date, deviceId: number }) {
        return await this.prismaService.refreshToken.create({
            data
        })
    }
    async createDevice(data: Pick<DeviceType, 'userId' | 'userAgent' | 'ip'> & Partial<Pick<DeviceType, | 'lastActive' | 'isActive'>>) {
        return await this.prismaService.device.create({
            data
        })
    }
    async findUniqueUserInclueRole(uniqueObject: { email: string } | { id: number }): Promise<UserType & { role: RoleType } | null> {
        return await this.prismaService.user.findUnique({
            where: uniqueObject,
            include: {
                role: true
            }
        });
    }
    async findUniqueRefreshokenIncludeUserRole(uniqueToken: { token: string }): Promise<
        RefreshTokenType & { user: UserType & { role: RoleType } } | null
    > {
        return this.prismaService.refreshToken.findUnique({
            where: uniqueToken,
            include: {
                user: {
                    include: {
                        role: true
                    }
                }
            }
        });
    }
    UpdateDevice(deviceId: number, data: Partial<DeviceType>): Promise<DeviceType> {
        return this.prismaService.device.update({
            where: {
                id: deviceId
            },
            data
        })
    }
    DeleteRefreshToken(payloadToken: { token: string }): Promise<RefreshTokenType> {
        return this.prismaService.refreshToken.delete({
            where: payloadToken
        })
    }
    UpdateUser(where: { id: number } | { email: string }, data: Partial<Omit<UserType, 'id'>>): Promise<UserType> {
        return this.prismaService.user.update({
            where,
            data
        })
    }
    DeleteVerificationCode(
        uniqueValue:
            | { id: number }
            | {
                email_type: {
                    email: string,
                    type: TypeOfVerificationCodeType
                }
            },
    ): Promise<VerificationCodeType> {
        return this.prismaService.verificationCode.delete({
            where: uniqueValue,
        }) as any
    }
}


