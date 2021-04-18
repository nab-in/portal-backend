import { EntityMetadata } from 'typeorm';
import { entityDatabaseMapping } from '../resolvers/database-table.resolver';
export function getSelections(fields: any, metaData: EntityMetadata): any {
  if (fields) {
    fields = fields.split('*').join(
      metaData.columns
        .map((metadataColumn) => {
          return metadataColumn.propertyName;
        })
        .join(','),
    );
    const resutls = fields.split(',').filter((item) => {
      return (
        item.indexOf('[') === -1 &&
        metaData.columns
          .map((metadataColumn) => {
            return metadataColumn.propertyName;
          })
          .indexOf(item) > -1
      );
    });
    if (resutls.indexOf('id') > -1) {
      resutls.push('uid');
    }
    if (resutls.indexOf('id') === -1) {
      resutls.push('id');
    }
    return resutls;
  } else {
    return null;
  }
}

function evaluateRelations(
  fields: any,
  results: any,
  metaData: EntityMetadata,
) {
  results = results.concat(
    fields.split(',').filter((item) => {
      return (
        metaData.relations
          .map((metadataRelation) => {
            return metadataRelation.propertyName;
          })
          .indexOf(item) > -1
      );
    }),
  );
  let items: any;
  let itemFiltered;
  if (fields.includes('[')) {
    const matchedItems = fields
      .replace(/,(?=(((?!\]).)*\[)|[^\[\]]*$)/g, '_')
      .split('_')
      .filter((splitted) => splitted.includes(splitted.match(/\[.*]/g)));
    items = convertToRelation(matchedItems);
    itemFiltered = items.filter((item: any) => {
      return item !== undefined && item !== '';
    });
  }
  if (items) {
    return [...results, ...itemFiltered];
  } else {
    return results;
  }
}
export function getRelations(fields: any, metaData: EntityMetadata): any {
  if (fields) {
    let results = [];
    results = results
      .concat(
        fields.split(',').filter((item) => {
          return item.indexOf('[') > -1;
        }),
      )
      .map((item) => {
        item.substring(
          item.indexOf('[') + 1,
          item.substring(0, item.indexOf('[')).length - 1,
        );
        return item.substring(0, item.indexOf('['));
      });
    results = evaluateRelations(fields, results, metaData);
    return results;
  } else {
    return [];
  }
}
export function convertToRelation(members) {
  return members
    .map((member: string) => {
      const splitedMember = member.split('[');
      const parentMember = splitedMember[0];
      const childMembers = (splitedMember[1] || '').replace(']', '').split(',');
      return childMembers.length > 0
        ? childMembers
            .map((childMember) => {
              if (entityDatabaseMapping[childMember] !== undefined) {
                return `${parentMember}.${childMember}`;
              }
            })
            .join(',')
        : parentMember;
    })
    .join(',')
    .split(',');
}
