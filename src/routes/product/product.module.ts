import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductTranslationModule } from './product-translation/product-translation.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [ProductTranslationModule]
})
export class ProductModule {}
