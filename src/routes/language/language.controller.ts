import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LanguageService } from './language.service';
import { ZodResponse, ZodSerializerDto } from 'nestjs-zod';
import { CreateLanguageBodyDTO, GetLanguageDetailResDTO, GetLanguageParamsDTO, GetLanguagesResDTO } from './language.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';

@Controller('languages')
export class LanguageController {
    constructor(private readonly languageService:LanguageService) { }
    @Get()
    @ZodResponse({type:GetLanguagesResDTO})
    async findAll() {
        const result = await this.languageService.findAll();
        return {
            data: result.data,
            totalItems: result.total
        };
    }

    @Get(':languageId')
     @ZodResponse({ type: GetLanguageDetailResDTO })
    async findById(@Param() param:GetLanguageParamsDTO) {
        return this.languageService.findById(param.languageId);
    }

    @Post()
     @ZodResponse({ type: GetLanguageDetailResDTO })
    async create(@Body() body: CreateLanguageBodyDTO,@ActiveUser('userId') userId:number) {
        return this.languageService.create({
            data: body,
            createdById: userId,
        });
    }
}
