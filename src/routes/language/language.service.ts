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
        return this.languageRepo.findAll();
    }
    async findById(id: string) {
        const language = await this.languageRepo.findById(id)
        if (!language) {
            throw NotFoundRecordException
        }
        return language;
    }
    async create({ data, createdById }: { data: CreateLanguageBodyType, createdById: number }) {
        try {
            return this.languageRepo.create({
                data: {
                    ...data,
                     createdById 
                } ,
                
            })
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw LanguageAlreadyExistsException
            }
            throw error
        }
    }

}

