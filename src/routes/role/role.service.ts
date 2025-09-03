import { Injectable } from '@nestjs/common';
import { RoleRepository } from './role.repo';
import { GetRolesQueryType } from './role.model';

@Injectable()
export class RoleService {
    constructor(private readonly roleRepo: RoleRepository) {}
    async list(pagination: GetRolesQueryType){
        return this.roleRepo.list(pagination)
    }
}
