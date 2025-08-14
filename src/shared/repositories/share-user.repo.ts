import { Injectable } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { UserType } from "../models/shared-user.model";

@Injectable()
export class ShareUserRepository {
    constructor(private readonly prismaService:PrismaService) {}
    async findUnique(uniqueObject: {email:string}| {id:number}): Promise<UserType | null> {
        return await this.prismaService.user.findUnique({
            where: uniqueObject
        });
    }
}