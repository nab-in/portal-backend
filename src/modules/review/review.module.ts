import { Module } from '@nestjs/common';
import { ReviewController } from './controllers/review.controller';
import { ReviewService } from './services/review.service';
@Module({
  imports: [],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
