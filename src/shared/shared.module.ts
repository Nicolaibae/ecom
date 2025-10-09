import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { HashingService } from './services/hashing.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from './guards/access-token.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './guards/authentication.guard';
import { ShareUserRepository } from './repositories/share-user.repo';
import { EmailService } from './services/email.service';
import { TwoFactorService } from './services/2fa.service';
import { S3Service } from './services/s3.service';

import { SharedPaymentRepository } from './repositories/share-payment.repo';
import { SharedWebsocketRepository } from './repositories/share-websocket.repo';
import { PaymentAPIKeyGuard } from './guards/payment-api-key.guard';

@Global()
@Module({
    providers: [PrismaService, HashingService, TokenService, AccessTokenGuard, PaymentAPIKeyGuard, ShareUserRepository,EmailService,TwoFactorService,S3Service,SharedPaymentRepository,SharedWebsocketRepository,
        {
            provide: APP_GUARD,
            useClass: AuthenticationGuard
        }],
    exports: [PrismaService, AccessTokenGuard, PaymentAPIKeyGuard, HashingService, TokenService,ShareUserRepository,EmailService,TwoFactorService,SharedPaymentRepository,SharedWebsocketRepository],
    imports: [JwtModule],
})
export class SharedModule { }
