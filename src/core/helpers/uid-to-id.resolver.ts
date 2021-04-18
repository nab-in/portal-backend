import * as _ from 'lodash';

export async function UIDToIDResolver(
    uid: string,
    entityRepository: any,
    tablename: string,
): Promise<any> {
    const queryResults: any[] = await entityRepository
        .createQueryBuilder()
        .select(tablename, [`id`])
        .from(tablename, tablename)
        .where(`${tablename}.uid = :uid`, { uid })
        .execute();
    return queryResults.length >= 1 ? getEntityRelationIds(queryResults) : {};
}

function getEntityRelationIds(queryResults: any) {
    return _.map(queryResults, (result: any) => {
        let entityProp = {};
        if (result) {
            Object.keys(result).forEach((key: string) => {
                if (key.split('_')[1] === 'id') {
                    entityProp = { ...entityProp, ...{ id: result[key] } };
                }
            });
            return entityProp;
        }
    })[0];
}
