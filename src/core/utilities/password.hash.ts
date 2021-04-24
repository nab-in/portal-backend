import * as bcrypt from 'bcrypt';

export const passwordHash = (password: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(
      password,
      10,
      (err: any, hash: string | PromiseLike<string>) => {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      },
    );
  });
};

export const passwordCompare = (password: any, hash: any): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(
      password,
      hash,
      (err: any, hash: boolean | PromiseLike<boolean>) => {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      },
    );
  });
};
