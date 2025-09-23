import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductTranslationModule } from './product-translation/product-translation.module';
import { ProductRepo } from './product.repo';
import { ManageProductService } from './manage-product.service';
import { ManageProductController } from './manage-product.controller';

@Module({
  controllers: [ProductController, ManageProductController],
  providers: [ProductService, ProductRepo, ManageProductService],
  imports: [ProductTranslationModule]
})
export class ProductModule {}
