
import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repo';
import { CreateUserBodyType, GetUsersQueryType, UpdateUserBodyType } from './user.model';
import { ShareUserRepository } from 'src/shared/repositories/share-user.repo';
import { NotFoundRecordException } from 'src/shared/error';
import { isForeignKeyConstraintPrismaError, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helper';
import { CannotUpdateOrDeleteYourselfException, RoleNotFoundException, UserAlreadyExistsException } from './user.error';
import { RoleName } from 'src/shared/constants/role.constant';
import { SharedRoleRepository } from 'src/shared/repositories/share-role.repo';
import { HashingService } from 'src/shared/services/hashing.service';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly sharedUserRepository: ShareUserRepository,
        private readonly sharedRoleRepository: SharedRoleRepository,
        private readonly hashingService: HashingService

    ) { }
    /**
* Function này kiểm tra xem người thực hiện có quyền tác động đến người khác không.
* Vì chỉ có người thực hiện là admin role mới có quyền sau: Tạo admin user, update roleId thành admin, xóa admin user.
* Còn nếu không phải admin thì không được phép tác động đến admin
*/
    private async verifyRole({ roleNameAgent, roleIdTarget }) {
        // Agent là admin thì cho phép
        if (roleNameAgent === RoleName.Admin) {
            return true
        } else {
            //check người tác động đến roleIdTarget là admin throw lỗi
            const adminId = await this.sharedRoleRepository.getAdminRoleId()
            if (roleIdTarget === adminId) { // nếu người bị tác động là admin quăng ra lỗi
                throw new ForbiddenException()
            }

        }
    }
    private async getRoleIdByUserId(userId: number) {
        const currentUser = await this.sharedUserRepository.findUnique({
            id: userId
        })
        if (!currentUser) {
            throw NotFoundRecordException
        }
        return currentUser.roleId
    }
    private async verifyYourSelf({ userAgentId, userTargetId }: { userAgentId: number; userTargetId: number }){
         if (userAgentId === userTargetId) {
      throw CannotUpdateOrDeleteYourselfException
    }
    }
    list(panigation: GetUsersQueryType) {
        return this.userRepo.list(panigation)
    }
    async findUserById(id: number) {
        const user = await this.sharedUserRepository.findUniqueIncludeRolePermissions({
            id
        })
        if (!user) {
            throw NotFoundRecordException
        }
        return user
    }
    async createUser({ data, createdById, createdByRoleName }: {
        createdById: number,
        data: CreateUserBodyType,
        createdByRoleName: string
    }
    ) {
        try {
            // Chỉ có admin agent mới có quyền tạo user với role là admin
            await this.verifyRole({
                roleNameAgent: createdByRoleName,
                roleIdTarget: data.roleId
            })
            const hashPass = await this.hashingService.hash(data.password)
            const user = await this.userRepo.createUser({
                createdById,
                data: {
                    ...data,
                    password: hashPass
                }
            })
            return user

        } catch (error) {
            if (isForeignKeyConstraintPrismaError(error)) {
                throw RoleNotFoundException
            }

            if (isUniqueConstraintPrismaError(error)) {
                throw UserAlreadyExistsException
            }
            throw error
        }
    }
    async updateUser(
        {
            data,
            id,
            updatedById,
            updatedByRoleName

        }: {
            data: UpdateUserBodyType,
            id: number,
            updatedById: number,
            updatedByRoleName: string

        }) {
        try {
            // check không thể cập nhập chính mình 
             this.verifyYourSelf({
               userAgentId:updatedById,
                userTargetId: id
            })

            // Lấy roleId ban đầu trong DB của người được update để kiểm tra xem liệu người update có quyền update không
            // Không dùng data.roleId vì dữ liệu này có thể bị cố tình truyền sai
            const roleIdTarget = await this.getRoleIdByUserId(id)
            await this.verifyRole({
                roleNameAgent: updatedByRoleName,
                roleIdTarget
            })
            const updatedUser = await this.sharedUserRepository.update(
                { id},
                {
                    ...data,
                    updatedById
                }
            )
            return updatedUser


        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException
            }
            if (isUniqueConstraintPrismaError(error)) {
                throw UserAlreadyExistsException
            }
            if (isForeignKeyConstraintPrismaError(error)) {
                throw RoleNotFoundException
            }
            throw error
        }
    }
    async deleteUser({ id, deletedById, deletedByRoleName }: { id: number; deletedById: number; deletedByRoleName: string }) {
        try {
             // check không thể xóa chính mình 
             this.verifyYourSelf({
               userAgentId:deletedById,
                userTargetId: id
            })
            const roleIdTarget = await this.getRoleIdByUserId(id)
            await this.verifyRole({
                roleNameAgent: deletedByRoleName,
                roleIdTarget
            })
            await this.userRepo.delete({
                id,
                deletedById
            })
            return {
                message: 'Delete successfully',
            }
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException
            }
            throw error
        }
    }
}








