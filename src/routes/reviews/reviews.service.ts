import { Injectable } from '@nestjs/common'

import { PaginationQueryType } from 'src/shared/models/request.model'
import { ReviewRepository } from './review.repo';
import { CreateReviewBodyType, UpdateReviewBodyType } from './review.model';

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  list(productId: number, pagination: PaginationQueryType) {
    return this.reviewRepository.list(productId, pagination)
  }

  async create(userId: number, body: CreateReviewBodyType) {
    return this.reviewRepository.create(userId, body)
  }

  async update({ userId, reviewId, body }: { userId: number; reviewId: number; body: UpdateReviewBodyType }) {
    return this.reviewRepository.update({
      userId,
      reviewId,
      body,
    })
  }
}