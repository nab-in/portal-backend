import { entityDatabaseMapping } from '../resolvers/database-table.resolver';

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
  if (checks.length === conditions.length) {
    return checks;
  }
}
