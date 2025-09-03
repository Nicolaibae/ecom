import { Injectable } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { UserType } from "../models/shared-user.model";
import { SerializeAll } from "../decorators/serialize.decorator";

@Injectable()
@SerializeAll()
export class ShareUserRepository {
    constructor(private readonly prismaService:PrismaService) {}
    async findUnique(uniqueObject: {email:string}| {id:number}): Promise<UserType | null> {
        return await this.prismaService.user.findUnique({
            where: uniqueObject
        }) as any;
    }
     update(where: { id: number }, data: Partial<UserType>): Promise<UserType> {
    return this.prismaService.user.update({
      where: {
        ...where,
        deletedAt: null,
      },
      data,
    }) as any
  }

}