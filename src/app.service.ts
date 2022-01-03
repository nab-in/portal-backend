import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private readonly connection: Connection) {}
  async getHello() {
    return 'Hello Job Portal';
  }
}
