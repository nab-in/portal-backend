import { entityDatabaseMapping } from '../resolvers/entity-database.mapping.resolver';

export const resolvedResponse = async ({ payload, repository }) => {
  const newPayload: { [x: string]: any } = {};
  const payloadKeys = Object.keys(payload);
  for (const key of payloadKeys) {
    if (entityDatabaseMapping[key] && typeof payload[key] === 'object') {
      const query = `SELECT id FROM public.${entityDatabaseMapping[key]} WHERE uid='${payload[key]['id']}' LIMIT 1;`;
      const entity = await repository.manager.query(query);
      newPayload[key] = entity[0];
    }
    if (Array.isArray(payload[key])) {
      newPayload[key] = await extractValues({
        data: payload[key],
        repository,
        key,
      });
    }
    if (!entityDatabaseMapping[key]) {
      newPayload[key] = payload[key];
    }
  }
  return newPayload;
};

const extractValues = async ({ data, repository, key }) => {
  let newPayload: any[];
  if (entityDatabaseMapping[key] && Array.isArray(data)) {
    let dataValues: any;
    const newPayloadPromise = data.map(async (dataValue) => {
      for (const dataKey of Object.keys(dataValue)) {
        if (dataKey === 'id') {
          const query = `SELECT id FROM public.${entityDatabaseMapping[key]} WHERE uid='${dataValue[dataKey]}' LIMIT 1;`;
          const entity = await repository.manager.query(query);
          dataValues = entity[0];
        }
        if (typeof dataValue[dataKey] === 'object') {
        }
        if (Array.isArray(dataValue[dataKey])) {
          dataValues = dataValue[dataKey].map((arrayDataValue: any) => {
            return extractValues({
              data: arrayDataValue,
              repository,
              key: dataKey,
            });
          });
        }
      }
      return dataValues;
    });
    newPayload = await Promise.all(newPayloadPromise);
    return newPayload;
  }
};
