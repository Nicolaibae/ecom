import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repo';
// Import sharedUserRepository from its module

import { GoogleService } from './google.service';
import { ShareUserRepository } from 'src/shared/repositories/share-user.repo';
import { SharedRoleRepository } from 'src/shared/repositories/share-role.repo';



@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository,GoogleService, ShareUserRepository, SharedRoleRepository],
  exports: [],
})
export class AuthModule {}
