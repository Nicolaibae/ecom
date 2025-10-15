import { Inject, Injectable } from '@nestjs/common';
import { PermissionRepo } from './permission.repo';
import { CreatePermissionBodyType, GetPermissionsQueryType, UpdatePermissionBodyType } from './permission.model';
import { NotFoundRecordException } from 'src/shared/error';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helper';
import { PermissionAlreadyExistsException } from './permission.error';
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import type { Cache } from 'cache-manager'

@Injectable()
export class PermissionService {
    constructor(
        private readonly permissionRepo: PermissionRepo,
         @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    async list(pagination: GetPermissionsQueryType) {
        return await this.permissionRepo.list(pagination)
    }
    async findById(id: number) {
        const Permission = await this.permissionRepo.findById(id)
        if (!Permission) {
            throw NotFoundRecordException
        }
        return Permission
    }
    async create({ data, createdById }: { data: CreatePermissionBodyType, createdById: number | null }) {
        try {
            return await this.permissionRepo.create({ data, createdById })
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw PermissionAlreadyExistsException
            }
            throw error
        }
    }
    async update({ data, id, updatedById }: { id: number, updatedById: number, data: UpdatePermissionBodyType }) {
        try {
            const permission =  await this.permissionRepo.update({ data, id, updatedById })
            this.deleteCachedRole(permission.roles)
            return permission
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException
            }
            if (isUniqueConstraintPrismaError(error)) {
                throw PermissionAlreadyExistsException
            }
            throw error
        }
    }
    async delete({ id, deletedById }: { id: number, deletedById: number }) {
        try {
          const permission =  await this.permissionRepo.delete({ id, deletedById });
          this.deleteCachedRole(permission.roles)
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
     deleteCachedRole(roles: { id: number }[]) {
    return Promise.all(
      roles.map((role) => {
        const cacheKey = `role:${role.id}`
        return this.cacheManager.del(cacheKey)
      }),
    )
  }

}
