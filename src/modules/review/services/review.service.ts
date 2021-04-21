import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/services/base.service';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';

@Injectable()
export class ReviewService extends BaseService<Review> {
  constructor(
    @InjectRepository(Review)
    public repository: Repository<Review>,
  ) {
    super(repository, Review);
  }
}
