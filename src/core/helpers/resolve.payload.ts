import { entityDatabaseMapping } from '../resolvers/entity-database.mapping.resolver';

export const resolvedResponse = async ({ payload, repository }) => {
  const newPayload: { [x: string]: any } = {};
  const payloadKeys = Object.keys(payload);
  for (const key of payloadKeys) {
    if (
      entityDatabaseMapping[key] &&
      typeof payload[key] !== 'object' &&
      !Array.isArray(payload[key])
    ) {
      const query = `SELECT id FROM ${entityDatabaseMapping[key]} WHERE uid='${payload[key]}' LIMIT 1;`;
      const entity = await repository.manager.query(query);
      newPayload[key] = entity[0];
      console.log(newPayload);
    }
    if (
      entityDatabaseMapping[key] &&
      typeof payload[key] == 'object' &&
      !Array.isArray(payload[key])
    ) {
      if (payload[key]['id']) {
        const query = `SELECT id FROM ${entityDatabaseMapping[key]} WHERE uid='${payload[key]['id']}' LIMIT 1;`;
        const entity = await repository.manager.query(query);
        newPayload[key] = entity[0];
      }
    }
    if (entityDatabaseMapping[key] && Array.isArray(payload[key])) {
      newPayload[key] = payload[key].map(async (vals: any) => {
        const resolved = await resolveArray({
          payload: vals,
          repository,
        });
        return new Promise((resolve) => {
          resolve(resolved);
        });
      });
    }
    if (isNaN(Date.parse(payload[key]))) {
      newPayload[key] = await resolveArray({
        payload: payload[key],
        repository,
      });
    }
    if (!entityDatabaseMapping[key]) {
      newPayload[key] = payload[key];
    }
  }
  return newPayload;
};
async function resolveArray({ payload, repository }) {
  const newPayload = {};
  Object.keys(payload).forEach((key) => {
    if (typeof entityDatabaseMapping[key] === 'object') {
      const query = `SELECT id FROM ${entityDatabaseMapping[key]} WHERE uid='${payload[key]['id']}' LIMIT 1;`;

      const entity = repository.manager.query(query);
      newPayload[key] = entity[0];
    } else if (Array.isArray(entityDatabaseMapping[key])) {
      newPayload[key] = payload[key].map(
        async (values: any) =>
          await resolveArray({ payload: values, repository }),
      );
    } else {
      newPayload[key] = payload[key];
    }
  });
  return newPayload;
}
