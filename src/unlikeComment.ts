import { Router } from "express";
import { ObjectID } from "mongodb";
import { refreshTokenMiddleware } from "./refreshTokenMiddleware";

const unlikeComment = Router();

unlikeComment.post("/", async (req, res) => {
  const {
    app: {
      context: { comentarios, usuarios },
    },
  } = req;
  try {
    const { refreshToken, comment_id, user_id } = req.body;
    const accessToken = req.headers.authorization || "";
    const { validAccessToken, _id } = await refreshTokenMiddleware(
      accessToken,
      refreshToken
    );
    if (!_id || !accessToken) throw new Error("El usuario no existe.");
    if (typeof comment_id !== "string")
      throw new Error("comment_id debe ser una cadena");
    if (!comment_id) throw new Error("comment_id no debe estar vacío");
    if (typeof user_id !== "string")
      throw new Error("message debe ser una cadena");
    if (!user_id) throw new Error("message no debe estar vacío");
    await comentarios.updateOne(
      { _id: new ObjectID(comment_id) },
      {
        $inc: { likes: -1 },
      }
    );
    await usuarios.updateOne(
      { _id: new ObjectID(user_id) },
      {
        $pull: {
          arrayLikedComments: comment_id,
        },
      }
    );
    res.status(200).json({
      message: "Comment unliked",
      accessToken: validAccessToken,
    });
  } catch (e) {
    res.status(400).json(e.message);
  }
});

export { unlikeComment };
