export const hasHelper = (obj: any, path: string) => {
  const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);

  return !!pathArray.reduce((prevObj, key) => prevObj && prevObj[key], obj);
};
