import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryTranslationModule } from './category-translation/category-translation.module';
import { CategoryRepo } from './category.repo';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService,CategoryRepo],
  imports: [CategoryTranslationModule]
})
export class CategoryModule {}
