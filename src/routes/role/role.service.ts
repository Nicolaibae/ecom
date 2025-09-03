import { Injectable } from '@nestjs/common';
import { RoleRepository } from './role.repo';
import { CreateRoleBodyType, GetRolesQueryType, UpdateRoleBodyType } from './role.model';
import { RoleAlreadyExistsException } from './role.error';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helper';
import { NotFoundRecordException } from 'src/shared/error';

@Injectable()
export class RoleService {
    constructor(private readonly roleRepo: RoleRepository) { }
    list(pagination: GetRolesQueryType) {
        return this.roleRepo.list(pagination)
    }
    async findById(id: number) {
        const role = await this.roleRepo.finndById(id)
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
            const role = await this.roleRepo.update({
                id,
                updatedById,
                data,
            })
            return role
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
            await this.roleRepo.delete({ id, deletedById })
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


