import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { LanguageService } from './language.service';
import { ZodResponse, ZodSerializerDto } from 'nestjs-zod';
import { CreateLanguageBodyDTO, GetLanguageDetailResDTO, GetLanguageParamsDTO, GetLanguagesResDTO, UpdateLanguageBodyDTO } from './language.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { MessageResDTO } from 'src/shared/dtos/reponse.dto';

@Controller('languages')
export class LanguageController {
    constructor(private readonly languageService: LanguageService) { }
    @Get()
    @ZodResponse({ type: GetLanguagesResDTO })
    async findAll() {
        const result = await this.languageService.findAll();
        return {
            data: result.data,
            totalItems: result.total
        };
    }

    @Get(':languageId')
    @ZodResponse({ type: GetLanguageDetailResDTO })
    async findById(@Param() param: GetLanguageParamsDTO) {
        return this.languageService.findById(param.languageId);
       
    }

    @Post()
    @ZodResponse({ type: GetLanguageDetailResDTO })
    async create(@Body() body: CreateLanguageBodyDTO, @ActiveUser('userId') userId: number) {
        return this.languageService.create({
            data: body,
            createdById: userId,
        });
    }

    @Put(':languageId')
    @ZodResponse({ type: GetLanguageDetailResDTO })
    update(
        @Body() body: UpdateLanguageBodyDTO,
        @Param() params: GetLanguageParamsDTO,
        @ActiveUser('userId') userId: number,
    ) {
        return this.languageService.update({
            data: body,
            id: params.languageId,
            updatedById: userId,
        })
    }

    @Delete(':languageId')
    @ZodResponse({ type: MessageResDTO })
    delete(@Param() params: GetLanguageParamsDTO) {
        return this.languageService.delete(params.languageId)
    }
}
