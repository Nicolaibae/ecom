import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ShareUserRepository } from 'src/shared/repositories/share-user.repo';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, ShareUserRepository]
})
export class ProfileModule {}
