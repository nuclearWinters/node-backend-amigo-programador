import { Router } from "express";
import { ObjectID } from "mongodb";
import { refreshTokenMiddleware } from "./refreshTokenMiddleware";
import { getCacheTopicsAndModules } from "./redisHelper";

const getUser = Router();

getUser.post("/", async (req, res) => {
  const {
    app: {
      context: { usuarios, topicsAndModules, redis },
    },
  } = req;
  try {
    const { refreshToken } = req.body;
    const accessToken = req.headers.authorization || "";
    const { validAccessToken, _id } = await refreshTokenMiddleware(
      accessToken,
      refreshToken
    );
    if (!_id || !accessToken) throw new Error("El usuario no existe.");
    const user = await usuarios.findOne({
      _id: new ObjectID(_id),
    });
    if (!user) throw new Error("El usuario no existe.");
    const topicsAndModulesCached = await getCacheTopicsAndModules(
      redis,
      topicsAndModules
    );
    res.status(200).json({
      _id: user._id.toHexString(),
      username: user.username,
      email: user.email,
      currentTopic: user.currentTopic,
      arrayLikedComments: user.arrayLikedComments,
      topicsAndModules: topicsAndModulesCached,
      topicsAndModulesData: user.topicsAndModulesData,
      accessToken: validAccessToken,
    });
  } catch (e) {
    const topicsAndModulesCached = await getCacheTopicsAndModules(
      redis,
      topicsAndModules
    );
    res.status(200).json({
      _id: "",
      username: "",
      email: "",
      currentTopic: "Inicio rápido",
      topicsAndModules: topicsAndModulesCached,
      arrayLikedComments: [],
      topicsAndModulesData: topicsAndModulesCached.map(({ _id, name }) => ({
        _id,
        name,
        currentModule: 0,
        modulesCompleted: [],
      })),
      accessToken: "",
    });
  }
});

export { getUser };
