import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './routes/auth/auth.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { CatchEverythingFilter } from './shared/filters/catch-everything.filter';
import { LanguageController } from './routes/language/language.controller';
import { LanguageModule } from './routes/language/language.module';
import { PermissionController } from './routes/permission/permission.controller';
import { PermissionModule } from './routes/permission/permission.module';
import { RoleModule } from './routes/role/role.module';
import { ProfileModule } from './routes/profile/profile.module';
import { UserModule } from './routes/user/user.module';
import { MediaModule } from './routes/media/media.module';
import { BrandModule } from './routes/brand/brand.module';
import { BrandTranslationModule } from './routes/brand/brand-translation/brand-translation.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n'
import { CategoryModule } from './routes/category/category.module';
import { ProductModule } from './routes/product/product.module';
import { CartModule } from './routes/cart/cart.module';
import { OrderModule } from './routes/order/order.module';
import { PaymentModule } from './routes/payment/payment.module';
import { BullModule } from '@nestjs/bullmq';
import { WebsocketsModule } from './websockets/websockets.module';
import path from 'path'
import envConfig from './shared/config';
import { ThrottlerModule } from '@nestjs/throttler'
import { ThrottlerBehindProxyGuard } from './shared/guards/throttler-behind-proxy.guard';
import { ReviewsModule } from './routes/reviews/reviews.module';
import { ScheduleModule } from '@nestjs/schedule'
import { PaymentConsumer } from './queues/payment.consumer';
import { RemoveRefreshTokenCronjob } from './cronjobs/remove-refresh-token.cronjob';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis'


@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal:true,
       useFactory: () => {
        return {
          stores: [createKeyv(envConfig.URL_REDIS)],
        }
      },
    }),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        url: envConfig.URL_REDIS
      },
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.resolve('src/i18n/'),
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
      typesOutputPath: path.resolve('src/generated/i18n.generated.ts'),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 60000, // 1 minute
          limit: 5,
        },
        {
          name: 'long',
          ttl: 120000, // 2 minutes
          limit: 7,
        },
      ],
    }),

    SharedModule, AuthModule, LanguageModule, PermissionModule, RoleModule, ProfileModule, UserModule, MediaModule, BrandModule, BrandTranslationModule, CategoryModule, ProductModule, CartModule, OrderModule, PaymentModule, WebsocketsModule, ReviewsModule
  ],
  controllers: [AppController, LanguageController, PermissionController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // {
    //   provide: APP_FILTER,
    //   useClass: CatchEverythingFilter,
    // }
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    PaymentConsumer,
    RemoveRefreshTokenCronjob
  ],
})
export class AppModule { }
