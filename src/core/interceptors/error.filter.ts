import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { isFunction } from 'lodash';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest();
    const response = context.getResponse();
    let message: string;
    const detail = exception.detail;
    if (typeof detail === 'string' && detail.includes('already exists')) {
      message = exception.table.split('_').join(' ') + ' with';
      message = exception.detail.replace('Key', message);
    } else {
      message = exception?.message;
    }
    message = message.split('(').join('');
    message = message.split(')').join('');
    message = message.split('=').join(' ');

    const errorResponse = {
      statusCode: isFunction(exception.getStatus)
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      method: request.method,
      path: request.path,
    };

    Logger.error(
      `${request.method} ${request.url}`,
      exception.stack,
      'Exception',
    );

    response.status(errorResponse.statusCode).json(errorResponse);
  }
}
