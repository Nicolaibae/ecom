import { Body, Controller, Get, Param, Query, Post, Put, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ZodResponse } from 'nestjs-zod';
import { CreateCategoryBodyDTO, GetAllCategoriesQueryDTO, GetAllCategoriesResDTO, GetCategoryDetailResDTO, GetCategoryParamsDTO, UpdateCategoryBodyDTO } from './category.dto';
import { IsPublic } from 'src/shared/decorators/auth.decorator';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { MessageResDTO } from 'src/shared/dtos/reponse.dto';

@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }


    @Get()
    @IsPublic()
    @ZodResponse({ type: GetAllCategoriesResDTO })
    findAll(@Query() query: GetAllCategoriesQueryDTO) {
        return this.categoryService.findAll(query.parentCategoryId)
    }
    @Get(':categoryId')
    @IsPublic()
    @ZodResponse({ type: GetCategoryDetailResDTO })
    findById(@Param() params: GetCategoryParamsDTO) {
        return this.categoryService.findById(params.categoryId)
    }
    @Post()
    @ZodResponse({ type: GetCategoryDetailResDTO })
    create(@Body() body: CreateCategoryBodyDTO, @ActiveUser('userId') userId: number) {
        return this.categoryService.create({
            data: body,
            createdById: userId,
        })
    }

    @Put(':categoryId')
    @ZodResponse({ type: GetCategoryDetailResDTO })
    update(
        @Body() body: UpdateCategoryBodyDTO,
        @Param() params: GetCategoryParamsDTO,
        @ActiveUser('userId') userId: number,
    ) {
        return this.categoryService.update({
            data: body,
            id: params.categoryId,
            updatedById: userId,
        })
    }

    @Delete(':categoryId')
    @ZodResponse({ type: MessageResDTO })
    delete(@Param() params: GetCategoryParamsDTO, @ActiveUser('userId') userId: number) {
        return this.categoryService.delete({
            id: params.categoryId,
            deletedById: userId,
        })
    }


}
