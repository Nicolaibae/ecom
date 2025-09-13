import { Injectable } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { UserType } from "../models/shared-user.model";
import { SerializeAll } from "../decorators/serialize.decorator";
import { PermissionType } from "src/routes/permission/permission.model";
import { RoleType } from "../models/shared-role.model";
export type UserIncludeRolePermissionsType = UserType & { role: RoleType & { permissions: PermissionType[] } }

export type WhereUniqueUserType = { id: number} | { email: string }
@Injectable()
@SerializeAll()
export class ShareUserRepository {
  constructor(private readonly prismaService: PrismaService) { }
  async findUnique(where: WhereUniqueUserType): Promise<UserType | null> {
    return await this.prismaService.user.findFirst({
      where
    }) as any;
  }
  findUniqueIncludeRolePermissions(where: WhereUniqueUserType): Promise<UserIncludeRolePermissionsType | null> {
    return this.prismaService.user.findFirst({
      where,
      include: {
        role: {
          include: {
            permissions: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    })as any
  }
  update(where: { id: number }, data: Partial<UserType>): Promise<UserType> {
    return this.prismaService.user.update({
      where: {
        ...where,
        deletedAt: null,
      },
      data,
    })as any
  } 

}