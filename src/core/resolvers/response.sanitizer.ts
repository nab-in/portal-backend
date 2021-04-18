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
    omit(responseObject, ['id', 'uid', 'password']),
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
          newResponseObject[attributeKey] = resolveResponse.map(
            (value: any) => value === attributeValue,
          );
        } else {
          if (isNaN(Date.parse(attributeValue))) {
            newResponseObject[attributeKey] = resolveResponse(attributeValue);
          } else {
            newResponseObject[attributeKey] = attributeValue;
          }
        }
      } else {
        newResponseObject[attributeKey] = attributeValue;
      }
    }
  });

  return newResponseObject;
};
