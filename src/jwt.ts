import jsonwebtoken, { SignOptions } from "jsonwebtoken";

export interface DecodeJWT {
  _id: string;
}

export const jwt: {
  decode: (token: string) => string | DecodeJWT | null;
  verify: (token: string, password: string) => Promise<DecodeJWT | undefined>;
  sign: (
    data: { _id: string },
    secret: string,
    options: SignOptions
  ) => Promise<string>;
} = {
  decode: (token) => {
    const decoded = jsonwebtoken.decode(token);
    return decoded as string | DecodeJWT | null;
  },
  verify: (token, password) => {
    return new Promise((resolve, reject) => {
      jsonwebtoken.verify(token, password, (err, decoded) => {
        if (err) {
          return reject(err);
        }
        resolve(decoded as DecodeJWT | undefined);
      });
    });
  },
  sign: (data, secret, options) => {
    return new Promise((resolve, reject) => {
      jsonwebtoken.sign(data, secret, options, (err, token) => {
        if (err) {
          return reject(err);
        }
        resolve(token);
      });
    });
  },
};
