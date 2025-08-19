import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import { RegisterBodyType, VerificationCodeType } from "./auth.model";
import { UserType } from "src/shared/models/shared-user.model";
import { TypeOfVerificationCodeType } from "src/shared/constants/auth.constant";
@Injectable()


export class AuthRepository {

    constructor(
        private readonly prismaService: PrismaService
    ) { }
    async createUser(user: Omit<RegisterBodyType, 'confirmPassword'|'code'> & Pick<UserType, 'roleId'>): Promise<Omit<UserType, 'password' | 'toptSecret'>> {
        return this.prismaService.user.create({
            data: user,
            omit: {
                password: true,
                totpSecret: true,
                
            }
        });
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
        uniqueValue: { email: string,code:string, type: TypeOfVerificationCodeType }
    ): Promise<VerificationCodeType | null> {
        return this.prismaService.verificationCode.findFirst({
            where: {
                
                    email: uniqueValue.email,
                    code: uniqueValue.code,
                    type: uniqueValue.type

                
            }
        });
    }

}