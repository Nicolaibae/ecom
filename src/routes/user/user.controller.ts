import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ActiveRolePermissions } from 'src/shared/decorators/active-role-permissions.decorator';
import { UserService } from './user.service';
import { ZodResponse } from 'nestjs-zod';
import { CreateUserBodyDTO, CreateUserResDTO, GetUserParamsDTO, GetUsersQueryDTO, GetUsersResDTO, UpdateUserBodyDTO } from './user.dto';
import { GetUserProfileResDTO, UpdateProfileResDTO } from 'src/shared/dtos/shared-user.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { MessageResDTO } from 'src/shared/dtos/reponse.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    @Get()
    @ZodResponse({ type: GetUsersResDTO })
    list(@Query() query: GetUsersQueryDTO) {
        return this.userService.list({
            page: query.page,
            limit: query.limit,
        })
    }
    @Get(':userId')
    @ZodResponse({ type: GetUserProfileResDTO })
    findUserById(@Param() params: GetUserParamsDTO) {
        return this.userService.findUserById(params.userId)
    }
    @Post()
    @ZodResponse({ type: CreateUserResDTO })
    createUser(
        @Body() Body: CreateUserBodyDTO,
        @ActiveUser("userId") userId: number,
        @ActiveRolePermissions('name') roleName: string
    ) {
        return this.userService.createUser({
            data: Body,
            createdById: userId,
            createdByRoleName: roleName
        })
    }
    @Put(":userId")
    @ZodResponse({ type: UpdateProfileResDTO })
    updateUser(
        @Body() body: UpdateUserBodyDTO,
        @Param() params: GetUserParamsDTO,
        @ActiveUser("userId") userId: number,
        @ActiveRolePermissions('name') roleName: string
    ) {
        return this.userService.updateUser({
            data: body,
            id: params.userId,
            updatedById: userId,
            updatedByRoleName: roleName
        })
    }
    @Delete(":userId")
    @ZodResponse({ type: MessageResDTO })
    deleteUser(
        @Param() params: GetUserParamsDTO,
        @ActiveUser("userId") userId: number,
        @ActiveRolePermissions('name') roleName: string
    ) {
        return this.userService.deleteUser({
            id: params.userId,
            deletedById: userId,
            deletedByRoleName: roleName,
        })
    }
}
