import { BaseEntity } from 'typeorm';

export class PortalCoreEntity extends BaseEntity {
  static plural: string;

  toResponseObject() {
    return this;
  }
}
