import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductTranslationModule } from './product-translation/product-translation.module';
import { ProductRepo } from './product.repo';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductRepo],
  imports: [ProductTranslationModule]
})
export class ProductModule {}
