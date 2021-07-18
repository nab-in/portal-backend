import { Injectable } from '@nestjs/common';
import { User } from '../../modules/user/entities/user.entity';
import { FindConditions, Repository, UpdateResult } from 'typeorm';
import { PortalCoreEntity } from '../entities/portal.core.entity';
import { getRelations, getSelections } from '../helpers/get-fields.utility';
import { getWhereConditions } from '../helpers/get-where-conditions.utility';
import { resolvedResponse } from '../helpers/resolve.payload';
import { resolveWhere } from '../helpers/resolvewhere';

@Injectable()
export class BaseService<T extends PortalCoreEntity> {
  constructor(
    protected readonly modelRepository: Repository<T>,
    protected readonly Model,
  ) {}

  async findAll(): Promise<T[]> {
    const results = await this.modelRepository.find();
    return results;
  }

  async findWhere(where: FindConditions<T>): Promise<T[]> {
    return await this.modelRepository.find({ where });
  }
  async findAndCount(fields, filter, size, page): Promise<[T[], number]> {
    const metaData = this.modelRepository.manager.connection.getMetadata(
      this.Model,
    );
    const conditions = Object.assign(
      {},
      ...(await resolveWhere(this.modelRepository, getWhereConditions(filter))),
    );
    return await this.modelRepository.findAndCount({
      select: getSelections(fields, metaData),
      relations: getRelations(fields, metaData),
      where: conditions,
      skip: page * size,
      take: size,
    });
  }

  async findOneByUid(uid: string, fields?: any): Promise<T> {
    const metaData = this.modelRepository.manager.connection.getMetadata(
      this.Model,
    );
    return await this.modelRepository.findOne({
      where: { uid },
      select: getSelections(fields, metaData),
      relations: getRelations(fields, metaData),
    });
  }
  async findOneById(id: any): Promise<T> {
    return await this.modelRepository.findOne({ where: { id } });
  }

  saveEntity(data, modelTarget) {
    const model = new modelTarget();
    const metaData = this.modelRepository.manager.connection.getMetadata(
      this.Model,
    );
    const savedEntity = model.save();
    Object.keys(data).forEach((key) => {
      if (
        metaData.relations
          .map((item) => {
            return item.propertyName;
          })
          .indexOf(key) > -1
      ) {
        metaData.relations
          .filter((item) => {
            return item.propertyName === key;
          })
          .forEach((item) => {
            if (item.relationType === 'one-to-many') {
              data[key].forEach((child) => {
                savedEntity[key].push(this.saveEntity(child, item.target));
              });
            }
          });
      } else {
        model[key] = data[key];
      }
    });
    return savedEntity;
  }

  /**
   *
   * @param entity
   */
  async create(entity: any): Promise<any> {
    const model = new this.Model();
    Object.keys(entity).forEach((key) => {
      model[key] = entity[key];
    });
    await this.modelRepository.save(model);
    const savedEntity = await this.modelRepository.findOne({
      where: { uid: model.uid },
    });

    /*
     * Associate user with company they created
     */
    if (this.Model.plural === 'companies') {
      const query = `INSERT INTO USERCOMPANIES(USERID,COMPANYID) VALUES(${entity.createdBy.id}, ${savedEntity['id']})`;
      await this.modelRepository.manager.query(query);
    }
    return savedEntity;
  }
  async updateByUID(uid: string, model: any): Promise<UpdateResult> {
    const condition: any = { uid };
    if (condition) {
      return await this.modelRepository.update(condition, model);
    }
  }
  async update(dataModel: any): Promise<UpdateResult> {
    if (dataModel) {
      dataModel.id = +dataModel.id;
      return await this.modelRepository.save(dataModel);
    }
  }

  async delete(id: string): Promise<any> {
    const condition: any = { uid: id };
    if (id) {
      return this.modelRepository.delete(condition);
    }
  }
  async EntityUidResolver(entityUpdates: any, user?: any, method?) {
    if (entityUpdates) {
      const updated = await resolvedResponse({
        payload: entityUpdates,
        repository: this.modelRepository,
        user,
        method,
      });
      return updated;
    }
  }
}
