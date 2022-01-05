import { entityDatabaseMapping } from '../resolvers/entity-database.mapping.resolver';

export async function resolveWhere(
  modelRepository: any,
  conditions: string | any[],
) {
  const checks = [];
  for (const condition of conditions) {
    if (entityDatabaseMapping.hasOwnProperty(Object.keys(condition)[0])) {
      const entity = await modelRepository.manager.query(
        `SELECT id FROM ${
          entityDatabaseMapping[Object.keys(condition)[0]]
        } WHERE uid='${Object.values(condition)[0]}' LIMIT 1`,
      );
      condition[Object.keys(condition)[0]] = entity[0].id;
    }
    checks.push(condition);
  }
  return checks;
}

export async function resolveWhereJob(modelRepository: any, conditions: any[]) {
  const checks = [];
  const categories = [];

  for (const condition of conditions) {
    if (condition?.categories) {
      for (const key of condition.categories
        .split('[')
        .join('')
        .split(']')
        .join('')
        .split(',')) {
        const entity = await modelRepository.manager.query(
          `SELECT id FROM JOBCATEGORY WHERE uid='${key}' LIMIT 1`,
        );
        categories.push(...entity);
      }
    } else {
      if (entityDatabaseMapping.hasOwnProperty(Object.keys(condition)[0])) {
        const entity = await modelRepository.manager.query(
          `SELECT id FROM ${
            entityDatabaseMapping[Object.keys(condition)[0]]
          } WHERE uid='${Object.values(condition)[0]}' LIMIT 1`,
        );
        if (entity.length > 0) {
          condition[Object.keys(condition)[0]] = entity[0]?.id;
        }
      }
      checks.push(condition);
    }
  }
  const condition = conditions.find(({ categories }) => categories);
  if (condition) {
    return { checks, categories };
  }
  return checks;
}
