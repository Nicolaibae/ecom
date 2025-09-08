import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ZodResponse } from 'nestjs-zod';
import { CreatePermissionBodyDTO, GetPermissionDetailResDTO, GetPermissionParamsDTO, GetPermissionsQueryDTO, GetPermissionsResDTO, UpdatePermissionBodyDTO } from './permission.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { MessageResDTO } from 'src/shared/dtos/reponse.dto';

@Controller('permission')
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) { }


    @Get()
    @ZodResponse({ type: GetPermissionsResDTO })
    list(@Query() query: GetPermissionsQueryDTO) {
        
        return this.permissionService.list({
            page: query.page,
            limit: query.limit,
        })
    }

    @Get(":permissionId")
    @ZodResponse({ type: GetPermissionDetailResDTO })
    findById(@Param() param: GetPermissionParamsDTO) {
        return this.permissionService.findById(param.permissionId)
    }
    @Post()
    @ZodResponse({ type: GetPermissionDetailResDTO })
    create(@Body() body: CreatePermissionBodyDTO, @ActiveUser('userId') userId: number) {
        return this.permissionService.create({
            data: body,
            createdById: userId,
        })
    }
    @Put(':permissionId')
    @ZodResponse({ type: GetPermissionDetailResDTO })
    update(
        @Body() body: UpdatePermissionBodyDTO,
        @Param() params: GetPermissionParamsDTO,
        @ActiveUser('userId') userId: number,
    ) {
        return this.permissionService.update({
            data: body,
            id: params.permissionId,
            updatedById: userId,
        })
    }
    @Delete(':permissionId')
    @ZodResponse({ type: MessageResDTO })
    delete(@Param() params: GetPermissionParamsDTO, @ActiveUser('userId') userId: number) {
       return this.permissionService.delete({
        id: params.permissionId,
        deletedById: userId,
       })
    }

}
