import { Module } from '@nestjs/common';
import { ReviewRepository } from './review.repo';
import { ReviewController } from './reviews.controller';
import { ReviewService } from './reviews.service';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService,ReviewRepository]
})
export class ReviewsModule {}
