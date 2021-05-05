import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { User } from '../entities/user.entity';

export class SessionGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();

    try {
      if (request.session && request.session.user) {
        request.session.previousPath = request.path;
        return true;
      }
      if (request.headers?.authorization) {
        const buff = Buffer.from(
          request.headers?.authorization.replace('Basic ', ''),
          'base64',
        );
        const auth = buff.toString('ascii').split(':');
        const user = await User.verifyUser(auth[0], auth[1]);
        if (user) {
          if (!request.session) {
            request.session = {};
          }
          request.session.user = user;
          return true;
        }
      }
    } catch (e) {
      Logger.error(e.message);
      throw new Error('Not In Session');
    }
  }
}
