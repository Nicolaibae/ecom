import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import { CreateLanguageBodyType, LanguageType, UpdateLanguageBodyType } from "./language.model";
import { SerializeAll } from "src/shared/decorators/serialize.decorator";

@Injectable()
@SerializeAll()

export class LanguageRepository {
    constructor(
        private readonly prismaService: PrismaService,
    ) { }
    async findAll(): Promise<LanguageType[]> {
        return this.prismaService.language.findMany({
            where: { deletedAt: null },
        }) as any
    }
    findById(id: string): Promise<LanguageType | null> {
        return this.prismaService.language.findUnique({
            where: {
                id,
                deletedAt: null,
            },
        }) as any
    }
    create({data,createdById}:{data:CreateLanguageBodyType,createdById:number}):Promise<LanguageType> {
        return this.prismaService.language.create({
            data: {
                ...data,
                createdById
            }
        }) as any
    }
    update({id,updatedById,data}:{id:string,data:UpdateLanguageBodyType,updatedById:number}){
        return this.prismaService.language.update({
            where:{
                id,
                deletedAt:null,
            },
            data:{
                ...data,
                updatedById,
            }
        }) as any
    }
    delete(id: string, hard?:boolean) {
        return (
            hard ? this.prismaService.language.delete({
                where: { id }
            }) : this.prismaService.language.update({
                where: { id, deletedAt: null },
                data: { deletedAt: new Date() }
            }) as any
        )

    }

}