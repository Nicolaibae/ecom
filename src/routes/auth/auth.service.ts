import { ConflictException, Injectable } from '@nestjs/common';
import { RolesService } from './role.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { HashingService } from 'src/shared/services/hashing.service';
import { isUniqueConstraintPrismaError } from 'src/shared/helper';

@Injectable()
export class AuthService {
    constructor(
        private readonly rolesService: RolesService,
        private readonly prismaService: PrismaService,
        private readonly hashService: HashingService
    ) { }
    async register(body: any): Promise<any> {
        try {
            const clientRoleId = await this.rolesService.getClientRoleId();
            const hashedPassword = await this.hashService.hash(body.password);
            const user = await this.prismaService.user.create({
                data: {
                    email: body.email,
                    password: hashedPassword,
                    name: body.name,
                    phoneNumber: body.phoneNumber,
                    roleId: clientRoleId,
                },
                omit: {
                    password: true,
                    totpSecret: true,
                }
            });
            return user;
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw new ConflictException('Email đã tồn tại')
            }
            throw error
        }

    }

}

