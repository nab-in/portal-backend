import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { FindConditions, Repository, UpdateResult } from 'typeorm';
import { PortalCoreEntity } from '../entities/portal.core.entity';
import { getRelations, getSelections } from '../helpers/get-fields.utility';
import { getWhereConditions } from '../helpers/get-where-conditions.utility';
import { resolveWhere } from '../helpers/resolvewhere';
import { UIDToIDResolver } from '../helpers/uid-to-id.resolver';
import { entityDatabaseMapping } from '../resolvers/database-table.resolver';

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

  async findIn(inConditions: { [attributeName: string]: string[] }) {
    const sanitizedConditions = _.flatten(
      _.keys(inConditions || []).map((conditionKey) => {
        return (inConditions[conditionKey] || []).map((conditionValue) => {
          return { [conditionKey]: conditionValue };
        });
      }),
    );

    const metaData = this.modelRepository.manager.connection.getMetadata(
      this.Model,
    );

    const relations = (metaData.relations || [])
      .map((relation) => {
        return relation.relationType === 'many-to-one'
          ? relation.propertyName
          : undefined;
      })
      .filter((propertyName) => propertyName);

    return await this.modelRepository.find({
      where: sanitizedConditions,
      relations,
    });
  }
  async findAndCount(fields, filter, size, page): Promise<[T[], number]> {
    const metaData = this.modelRepository.manager.connection.getMetadata(
      this.Model,
    );

    let join: any = {};

    if (metaData.tableName === 'organisationunit') {
      join = {
        alias: 'organisationunit',
        leftJoinAndSelect: {
          profile: 'organisationunit.parent',
        },
      };
    }
    const conditions = await resolveWhere(
      this.modelRepository,
      getWhereConditions(filter),
    );
    return await this.modelRepository.findAndCount({
      select: getSelections(fields, metaData),
      relations: getRelations(fields, metaData),
      join,
      where: conditions,
      skip: page * size,
      take: size,
    });
  }

  async findOneByUid(uid: string): Promise<T> {
    return await this.modelRepository.findOne({ where: { uid } });
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
    return await this.modelRepository.save(model);
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
      return await this.modelRepository.update(dataModel.id, dataModel);
    }
  }

  async delete(id: string): Promise<any> {
    const condition: any = { uid: id };
    if (id) {
      return this.modelRepository.delete(condition);
    }
  }
  async EntityUidResolver(entityUpdates: any, entity: any) {
    if (entityUpdates) {
      const id = entity.id;
      entity = { ...entity, id: entity.id };
      const objectKeys = Object.keys(entityUpdates);
      const relationUIDs = await Promise.all(
        _.map(
          objectKeys,
          async (key: string): Promise<any> => {
            if (_.isArray(entityUpdates[key])) {
              const result = await this.getRelationUids(entityUpdates, key);
              entity[key] = [
                ...entity[key],
                ...(await this.getRelationUids(entityUpdates, key)),
              ];
              if (result) {
                return await this.getRelationUids(entityUpdates, key);
              }
            } else {
              if (_.has(entityUpdates, key) && _.has(entity, key)) {
                entity[key] = entityUpdates[key];
              }
            }
          },
        ),
      );
      entity.id = id;
      return _.flatten(
        _.filter(relationUIDs, (uid) => uid === 0 || Boolean(uid)),
      ).length >= 1
        ? entity
        : entity;
    }
  }
  async getRelationUids(entityRelationProps: any[], key: string): Promise<any> {
    return Promise.all(
      _.map(
        entityRelationProps[key],
        async (relationObj: any): Promise<any> => {
          const relationUids = await UIDToIDResolver(
            relationObj.uid,
            this.modelRepository,
            entityDatabaseMapping[key],
          );
          return await relationUids;
        },
      ),
    );
  }
}
