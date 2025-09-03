import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionRepo } from './permission.repo';
import { PermissionController } from './permission.controller';

@Module({
   controllers: [PermissionController],
    providers: [PermissionService,PermissionRepo],
    exports: [PermissionService,PermissionRepo],
})
export class PermissionModule {}
