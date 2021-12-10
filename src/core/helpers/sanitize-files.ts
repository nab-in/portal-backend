import { extname } from 'path';
import { generateUid } from './makeuid.helper';

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

export const filesFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(pdf|doc|docs|docx|txt|text)$/)) {
    return callback(new Error('Only document files are allowed!'), false);
  }
  callback(null, true);
};

export const editFileName = (req, file, callback) => {
  const fileExtName = extname(file.originalname);
  const randomName = Array(4).fill(null).join('');
  callback(null, `${generateUid()}${fileExtName}`);
  return randomName;
};
