import * as _ from 'lodash';
import { In, Like, ILike } from 'typeorm';
export function getWhereConditions(filter: any): any[] {
  if (!filter) {
    return [];
  }

  const filterParams = _.isString(filter) ? [filter] : filter;

  return _.filter(
    _.map(filterParams || [], (filterParam) => {
      const filterSplit = (filterParam || '').split(':');
      const filterOperation = filterSplit[1];

      switch (filterOperation) {
        case 'eq': {
          if (filterSplit[0] == 'id') {
            return { uid: filterSplit[2] };
          }
          return { [filterSplit[0]]: filterSplit[2] };
        }
        case 'in': {
          if (filterSplit[0] == 'id') {
            return {
              uid: In(
                filterSplit[2]
                  .slice(1, -1)
                  .split(',')
                  .map((filters) => filters),
              ),
            };
          }
          if (filterSplit[0] == 'name') {
          }
          return { [filterSplit[0]]: filterSplit[2] };
        }
        case 'like': {
          if (filterSplit[0] == 'id') {
            return { uid: filterSplit[2] };
          }
          return { [filterSplit[0]]: Like(`%${filterSplit[2]}%`) };
        }
        case 'ilike': {
          if (filterSplit[0] == 'id') {
            return { uid: filterSplit[2] };
          }
          return { [filterSplit[0]]: ILike(`%${filterSplit[2]}%`) };
        }
        default:
          return null;
      }
    }),
    (condition) => condition,
  );
}
