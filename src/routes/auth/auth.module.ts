import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesService } from './role.service';
import { AuthRepository } from './auth.repo';
// Import sharedUserRepository from its module
import { ShareUserRepository } from 'src/shared/repositories/share-user.repo';


@Module({
  controllers: [AuthController],
  providers: [AuthService,RolesService, AuthRepository,ShareUserRepository],
  exports: [RolesService],
})
export class AuthModule {}
