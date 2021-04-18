import { HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { UIDParams } from '../interfaces/response/params.interface';

/**
 *
 * @param request
 * @param response
 * @param params
 * @param deleteResponse
 */
export function deleteSuccessResponse(
  request: Request,
  response: Response,
  params: UIDParams,
  deleteResponse: any,
): Response {
  if (deleteResponse.affected === 1) {
    return response.status(response.statusCode).json({
      message: `Object with identifier ${params.id} deleted successfully`,
    });
  }
}

export function genericFailureResponse(
  response: Response,
  params?: UIDParams,
): Response {
  return response.status(HttpStatus.NOT_FOUND).json({
    message: `Object with identifier ${params.id} could not be found.`,
  });
}

export function resultNotFoundResponse(
  response: Response,
  params?: UIDParams,
): Response {
  return response.status(HttpStatus.NOT_FOUND).json({
    message: `Object with identifier ${params.id} could not be found.`,
  });
}

export function errorEntityWithAssociation(
  response: Response,
  params?: UIDParams,
): Response {
  return response.status(HttpStatus.NOT_FOUND).json({
    message: `Object with identifier ${params.id} could not be deleted. It has association with another objects`,
  });
}

export function errorMessage(response: Response, msg: string): Response {
  return response.status(HttpStatus.NOT_FOUND).json({
    message: msg,
  });
}

export function entityExistResponse(response: Response, entity: any): Response {
  return response.json({
    message: `Object with identifier ${entity.uid} could already exist.`,
  });
}
export function getSuccessResponse(
  response: Response,
  getResponse: any,
): Response {
  if (getResponse !== undefined) {
    return response.status(response.statusCode).json(getResponse);
  }
}

export function postSuccessResponse(
  response: Response,
  postResponse: any,
): Response {
  if (postResponse !== undefined) {
    const newItem = {
      message: 'Item successfully created',
      payload: postResponse,
    };
    return response.status(response.statusCode).json(newItem);
  }
}
