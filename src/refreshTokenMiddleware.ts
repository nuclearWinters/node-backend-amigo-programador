import { jwt } from "./jwt";
import { ACCESSSECRET, REFRESHSECRET } from "./config";

export const refreshTokenMiddleware = (
  accessToken: string,
  refreshToken: string
): Promise<{ validAccessToken: string; _id: string }> => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await jwt.verify(accessToken, ACCESSSECRET);
      if (!user) throw new Error("El token esta corrompido.");
      resolve({ validAccessToken: accessToken, _id: user._id });
    } catch (e) {
      if (e.message === "jwt expired") {
        try {
          const user = await jwt.verify(refreshToken, REFRESHSECRET);
          if (!user) throw new Error("El token esta corrompido.");
          const validAccessToken = await jwt.sign(
            { _id: user._id },
            ACCESSSECRET,
            {
              expiresIn: "15m",
            }
          );
          return resolve({ validAccessToken, _id: user._id });
        } catch (e) {
          return reject(e);
        }
      }
      reject(e);
    }
  });
};
