import { Injectable } from '@nestjs/common';
import { InvalidPasswordException, NotFoundRecordException } from 'src/shared/error';
import { ShareUserRepository } from 'src/shared/repositories/share-user.repo';
import { HashingService } from 'src/shared/services/hashing.service';
import { ChangePasswordBodyType, UpdateMeBodyType } from './profile.model';
import { isUniqueConstraintPrismaError } from 'src/shared/helper';

@Injectable()
export class ProfileService {
    constructor(
        private readonly hashingService: HashingService,
        private readonly shareUserRepository: ShareUserRepository
    ) { }
    async getProfile(userId: number) {
        const user = await this.shareUserRepository.findUniqueIncludeRolePermissions({
            id: userId
          
        })
        if (!user) {
            throw NotFoundRecordException
        }
        return user
    }
    async updateProfile({ userId, body }: { userId: number; body: UpdateMeBodyType }) {
        try {
            return await this.shareUserRepository.update(
                { id: userId },
                {
                    ...body,
                    updatedById: userId,
                },
            )
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw NotFoundRecordException
            }
            throw error
        }
    }
    async changePassword({ userId, body }: { userId: number; body: Omit<ChangePasswordBodyType, 'confirmNewPassword'> }) {
        try {
            const { password, newPassword } = body
            const user = await this.shareUserRepository.findUnique({
                id: userId,
            })
            if (!user) {
                throw NotFoundRecordException
            }
            const isPasswordMatch = await this.hashingService.compare(password, user.password)
            if (!isPasswordMatch) {
                throw InvalidPasswordException
            }
            const hashPassword = await this.hashingService.hash(newPassword)
            await this.shareUserRepository.update(
                { id: userId },
                {
                    password: hashPassword,
                    updatedById: userId
                }
            )
            return {
                message: 'Password changed successfully',
            }
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw NotFoundRecordException
            }
            throw error
        }
    }
}
