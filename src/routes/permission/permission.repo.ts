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
        }) as any
    }
    create({data,createdById}:{createdById:number | null, data: CreatePermissionBodyType} ):Promise<PermissionType>{
        return this.prismaService.permission.create({
            data:{
                ...data,
                createdById,
            }
        }) as any
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
  ): Promise<PermissionType & { roles: { id: number }[] }> {
    return (
      isHard
        ? this.prismaService.permission.delete({
            where: {
              id,
            },
            include: {
              roles: true,
            },
          })
        : this.prismaService.permission.update({
            where: {
              id,
              deletedAt: null,
            },
            data: {
              deletedAt: new Date(),
              deletedById,
            },
            include: {
              roles: true,
            },
          })
    ) as any
  }
}