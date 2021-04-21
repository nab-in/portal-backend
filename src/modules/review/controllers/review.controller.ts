import { Controller } from '@nestjs/common';
import { BaseController } from '../../../core/controllers/base.controller';
import { Review } from '../entities/review.entity';
import { ReviewService } from '../services/Review.service';

@Controller('api/' + Review.plural)
export class ReviewController extends BaseController<Review> {
  constructor(private service: ReviewService) {
    super(service, Review);
  }
}
