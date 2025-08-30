import { Injectable } from '@nestjs/common';
import { LanguageRepository } from './language.repo';
import { CreateLanguageBodyType, LanguageType } from './language.model';
import { NotFoundRecordException } from 'src/shared/error';
import { isUniqueConstraintPrismaError } from 'src/shared/helper';
import { LanguageAlreadyExistsException } from './language.error';


@Injectable()
export class LanguageService {
    constructor(private readonly languageRepo: LanguageRepository) { }
    async findAll() {
        const data = await this.languageRepo.findAll();
        return {
            data,
            total: data.length
        }
    }
    async findById(id: string) {
        const language = await this.languageRepo.findById(id)
        if (!language) {
            throw NotFoundRecordException
        }
        return language;
    }
    async create({ data, createdById }: { data: CreateLanguageBodyType; createdById: number }) {
        try {
            return await this.languageRepo.create({
                createdById,
                data,
            })
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw LanguageAlreadyExistsException
            }
            throw error
        }
    }
}



