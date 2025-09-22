import { Module } from '@nestjs/common';
import { ProductTranslationController } from './product-translation.controller';
import { ProductTranslationService } from './product-translation.service';
import { ProductTranslationRepo } from './product-translation.repo';

@Module({
  controllers: [ProductTranslationController],
  providers: [ProductTranslationService,ProductTranslationRepo]
})
export class ProductTranslationModule {}
