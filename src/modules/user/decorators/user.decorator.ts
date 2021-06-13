import { createParamDecorator } from '@nestjs/common';
import { User } from '../entities/user.entity';

export const UserDecorator = createParamDecorator((data, req): User => {
  console.log(req);
  return req.useer;
});
