import { Injectable } from "@nestjs/common";
import { SerializeAll } from "src/shared/decorators/serialize.decorator";
import { PrismaService } from "src/shared/services/prisma.service";
import { CreatePermissionBodyType, GetPermissionDetailResType, GetPermissionParamsType, GetPermissionsQueryType, GetPermissionsResType, PermissionType, UpdatePermissionBodyType, } from "./permission.model";

@Injectable()
@SerializeAll()
export class PermissionRepo {
    constructor(private prismaService: PrismaService) { }

    async list(pagination: GetPermissionsQueryType): Promise<GetPermissionsResType> {
        const skip = (pagination.page - 1) * pagination.limit
        const take = pagination.limit
        const [totalItems, data] = await Promise.all([
            this.prismaService.permission.count({
                where: {
                    deletedAt: null,
                },
            }),
            this.prismaService.permission.findMany({
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
    findById(id: number): Promise<PermissionType | null> {
        return this.prismaService.permission.findUnique({
            where: {
                id,
                deletedAt: null,
            },
        })
    }
    create({data,createdById}:{createdById:number | null, data: CreatePermissionBodyType} ):Promise<PermissionType>{
        return this.prismaService.permission.create({
            data:{
                ...data,
                createdById,
            }
        })
    }
    update({data, id, updatedById}:{id:number, updatedById: number, data: UpdatePermissionBodyType}):Promise<PermissionType>{
        return this.prismaService.permission.update({
            where:{
                id,
            },
            data:{
                ...data,
                updatedById,
            }
        })
    }
    delete({ id, deletedById }: { id: number, deletedById: number }, isHard?: Boolean):Promise<PermissionType> {
        return isHard
        ? this.prismaService.permission.delete({
            where: {
                id,
            },
        })
        : this.prismaService.permission.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
                updatedById: deletedById,
            },
        })
    }
}