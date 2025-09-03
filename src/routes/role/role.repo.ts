import { Injectable } from "@nestjs/common";
import { SerializeAll } from "src/shared/decorators/serialize.decorator";
import { PrismaService } from "src/shared/services/prisma.service";
import { GetRolesQueryType, GetRolesResType } from "./role.model";

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
        }
    }
}