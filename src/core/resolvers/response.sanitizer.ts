import { getConfiguration } from '../utilities/systemConfigs';

export const resolveResponse: any = (responseObject: any) => {
  const omit = (
    responseObject: { [x: string]: any },
    responseObjectProps: any[],
  ) => {
    responseObject = { ...responseObject };
    responseObjectProps.forEach((prop) => delete responseObject[prop]);
    return responseObject;
  };

  const newResponseObject = {
    id: responseObject.uid,
  };
  const attributeKeys = Object.keys(
    omit(responseObject, [
      'id',
      'uid',
      'password',
      'salt',
      'userid',
      'jobid',
      'count',
    ]),
  );
  attributeKeys.forEach((attributeKey) => {
    let attributeValue: string | boolean | number | any;
    if (responseObject[attributeKey] === false) {
      attributeValue = false;
    } else {
      attributeValue = responseObject[attributeKey];
    }
    if (attributeValue || attributeValue === false) {
      if (typeof attributeValue === 'object') {
        if (Array.isArray(attributeValue)) {
          if (attributeKey === 'children' && attributeValue.length > 0) {
            newResponseObject[attributeKey] = responseObject[attributeKey].map(
              (value: any) => resolveResponse(value),
            );
          }
          if (attributeKey !== 'children') {
            newResponseObject[attributeKey] = responseObject[attributeKey].map(
              (value: any) => resolveResponse(value),
            );
          }
        } else {
          if (isNaN(Date.parse(attributeValue))) {
            newResponseObject[attributeKey] = resolveResponse(attributeValue);
          } else {
            newResponseObject[attributeKey] = attributeValue;
          }
        }
      } else {
        if (
          attributeKey === 'dp' ||
          attributeKey === 'logo' ||
          attributeKey === 'cv' ||
          attributeKey === 'attachment'
        ) {
          if (attributeKey === 'attachment') {
            newResponseObject[attributeKey] =
              getConfiguration().serverurl +
              '/api/jobs/' +
              attributeValue +
              '/attachment';
          }
          if (attributeKey === 'dp') {
            newResponseObject[attributeKey] =
              getConfiguration().serverurl +
              '/api/users/' +
              attributeValue +
              '/dp';
          }
          if (attributeKey === 'cv') {
            newResponseObject[attributeKey] =
              getConfiguration().serverurl +
              '/api/users/' +
              attributeValue +
              '/cv';
          }
          if (attributeKey === 'logo') {
            newResponseObject[attributeKey] =
              getConfiguration().serverurl +
              '/api/companies/' +
              attributeValue +
              '/logo';
          }
        } else {
          newResponseObject[attributeKey] = attributeValue;
        }
      }
    }
  });

  return newResponseObject;
};
