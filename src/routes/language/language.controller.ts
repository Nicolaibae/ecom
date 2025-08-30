import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LanguageService } from './language.service';
import { ZodSerializerDto } from 'nestjs-zod';
import { CreateLanguageBodyDTO, GetLanguageDetailResDTO, GetLanguageParamsDTO, GetLanguagesResDTO } from './language.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';

@Controller('languages')
export class LanguageController {
    constructor(private readonly languageService:LanguageService) { }
    @Get()
    @ZodSerializerDto(GetLanguagesResDTO)
    async findAll() {
        return this.languageService.findAll();
    }

    @Get(':languageId')
    @ZodSerializerDto(GetLanguageDetailResDTO)
    async findById(@Param() param:GetLanguageParamsDTO) {
        return this.languageService.findById(param.languageId);
    }

    @Post()
    @ZodSerializerDto(GetLanguageDetailResDTO)
    async create(@Body() body: CreateLanguageBodyDTO,@ActiveUser('userId') userId:number) {
        return this.languageService.create({
            data: body,
            createdById: userId,
        });
    }
}
