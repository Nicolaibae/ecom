import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import { CreateLanguageBodyType, LanguageType } from "./language.model";

@Injectable()


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
            },
        }) as any
    }

}