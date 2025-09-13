import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repo';
import { SharedRoleRepository } from 'src/shared/repositories/share-role.repo';

@Module({
  providers: [UserService,UserRepository, SharedRoleRepository],
  controllers: [UserController]
})
export class UserModule {}
