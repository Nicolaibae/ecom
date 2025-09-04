import { Injectable } from "@nestjs/common";
import { SerializeAll } from "src/shared/decorators/serialize.decorator";
import { PrismaService } from "src/shared/services/prisma.service";
import { CreateRoleBodyType, GetRolesQueryType, GetRolesResType, RoleType, RoleWithPermissionsType, UpdateRoleBodyType } from "./role.model";

@Injectable()
@SerializeAll()
export class RoleRepository {
    constructor(private prismaService: PrismaService) { }

    async list(pagination: GetRolesQueryType): Promise<GetRolesResType> {
        const skip = (pagination.page - 1) * pagination.limit
        const take = pagination.limit
        const [totalItems, data] = await Promise.all([
            this.prismaService.role.count({
                where: {
                    deletedAt: null,
                },
            }),
            this.prismaService.role.findMany({
                where: {
                    deletedAt: null,
                },
                skip,
                take,
            }),
        ])
        return {
            data,
            totalItems,
            page: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(totalItems / pagination.limit),
        } as any
    }
    async finndById(id: number): Promise<RoleWithPermissionsType | null> {
        return this.prismaService.role.findUnique({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                permissions: {
                    where: {
                        deletedAt: null,
                    }
                },
            },
        }) as any
    }
    async create({ data, createdById }: { data: CreateRoleBodyType, createdById: number | null }): Promise<RoleType> {
        return this.prismaService.role.create({
            data: {
                ...data,
                createdById,
            },
        }) as any
    }
    async update({ data, updatedById, id }: { data: UpdateRoleBodyType, id: number, updatedById: number | null }): Promise<RoleWithPermissionsType> {
        // Kiểm tra nếu có bất cứ permissionId nào mà đã soft delete thì không cho phép cập nhật
        if (data.permissionIds.length > 0) {
            const permission = await this.prismaService.permission.findMany({
                where: {
                    id: { in: data.permissionIds },
                },
            })
            // Trả về danh sách permission đã bị xóa mềm
            const TotalDeletedPermission = permission.filter((permission) => permission.deletedAt)
            if (TotalDeletedPermission.length > 0) {
                const deletedIds = TotalDeletedPermission.map((permission) => permission.id).join(', ')
                throw new Error(`Permission with id has been deleted: ${deletedIds}`)
            }
        }

        return this.prismaService.role.update({
            where: {
                id,
                deletedAt: null,
            },
            data: {
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                permissions: {
                    set: data.permissionIds.map((id) => ({ id })),
                },
                updatedById,
            },
            include: {
                permissions: {
                    where: {
                        deletedAt: null,
                    },
                },
            },
        }) as any
    }
    delete(
        {
            id,
            deletedById,
        }: {
            id: number
            deletedById: number
        },
        isHard?: boolean,
    ): Promise<RoleType> {
        return (
            isHard
                ? this.prismaService.role.delete({
                    where: {
                        id,
                    },
                })
                : this.prismaService.role.update({
                    where: {
                        id,
                        deletedAt: null,
                    },
                    data: {
                        deletedAt: new Date(),
                        deletedById,
                    },
                })
        ) as any
    }

}