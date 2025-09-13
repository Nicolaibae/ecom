import { Body, Controller, Get, Put } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ZodResponse } from 'nestjs-zod';
import { GetUserProfileResDTO, UpdateProfileResDTO } from 'src/shared/dtos/shared-user.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { ChangePasswordBodyDTO, UpdateMeBodyDTO } from './profile.dto';
import { MessageResDTO } from 'src/shared/dtos/reponse.dto';

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get()
    @ZodResponse({ type: GetUserProfileResDTO })
    getProfile(@ActiveUser('userId') userId: number) {
        return this.profileService.getProfile(userId)
    }

    @Put()
    @ZodResponse({ type: UpdateProfileResDTO })
    updateProfile(@Body() body: UpdateMeBodyDTO, @ActiveUser('userId') userId: number) {
        return this.profileService.updateProfile({
            userId,
            body,
        })
    }
    @Put('change-password')
     @ZodResponse({ type: MessageResDTO })
    changePassword(@Body() body: ChangePasswordBodyDTO, @ActiveUser('userId') userId: number) {
    return this.profileService.changePassword({
      userId,
      body,
    })
  }



}
