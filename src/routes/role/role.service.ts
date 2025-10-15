import { Inject, Injectable } from '@nestjs/common';
import { RoleRepository } from './role.repo';
import { CreateRoleBodyType, GetRolesQueryType, UpdateRoleBodyType } from './role.model';
import { ProhibitedActionOnBaseRoleException, RoleAlreadyExistsException } from './role.error';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helper';
import { NotFoundRecordException } from 'src/shared/error';
import { RoleName } from 'src/shared/constants/role.constant';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager'

@Injectable()
export class RoleService {
    constructor(
        private readonly roleRepo: RoleRepository,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }
    list(pagination: GetRolesQueryType) {
        return this.roleRepo.list(pagination)
    }
    async findById(id: number) {
        const role = await this.roleRepo.findById(id)
        if (!role) {
            throw RoleAlreadyExistsException
        }

        return role
    }
    create({ data, createdById }: { data: CreateRoleBodyType, createdById: number }) {
        try {
            return this.roleRepo.create({ data, createdById })
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw RoleAlreadyExistsException
            }
            throw error
        }
    }
    async update({ id, data, updatedById }: { id: number; data: UpdateRoleBodyType; updatedById: number }) {
        try {
            await this.verifyRole(id)
            const UpdatedRole = await this.roleRepo.update({
                id,
                updatedById,
                data,
            })
            await this.cacheManager.del(`role:${UpdatedRole.id}`)
            return UpdatedRole
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException
            }
            if (isUniqueConstraintPrismaError(error)) {
                throw RoleAlreadyExistsException
            }
            throw error
        }
    }
    async delete({ id, deletedById }: { id: number; deletedById: number }) {
        try {
            await this.verifyRole(id)
            await this.roleRepo.delete({ id, deletedById })
            await this.cacheManager.del(`role:${id}`)
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
    /**
  * Kiểm tra xem role có phải là 1 trong 3 role cơ bản không
  */
    private async verifyRole(roleId: number) {
        const role = await this.roleRepo.findById(roleId)
        if (!role) {
            throw NotFoundRecordException
        }
        const baseRoles: string[] = [RoleName.Admin, RoleName.Client, RoleName.Seller]

        if (baseRoles.includes(role.name)) {
            throw ProhibitedActionOnBaseRoleException
        }
    }
}


