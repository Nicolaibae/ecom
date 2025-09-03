import { Controller, Get, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { ZodResponse } from 'nestjs-zod';
import { GetRolesQueryDTO, GetRolesResDTO } from './role.dto';

@Controller('role')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}


    @Get()
    @ZodResponse({type: GetRolesResDTO})
    list(@Query() query: GetRolesQueryDTO){
        return this.roleService.list({
            page: query.page,
            limit: query.limit,
        })
    }
}
