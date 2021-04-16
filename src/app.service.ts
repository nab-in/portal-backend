import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private readonly connection: Connection) {}
  async getHello() {
    const data = await this.connection?.query('SELECT * FROM public."user";');
    console.log('CON', data);
    return data;
  }
}
