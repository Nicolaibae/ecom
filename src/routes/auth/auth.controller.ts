import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RolesService } from 'src/routes/auth/role.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService,
        
    ) { }
    @Post('register')
    async register(@Body() body: any) {
        return await this.authService.register(body);
    }
}
