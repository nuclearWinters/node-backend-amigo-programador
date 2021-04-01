import { Router } from "express";
import { ObjectID } from "mongodb";
import { refreshTokenMiddleware } from "./refreshTokenMiddleware";

const editComment = Router();

editComment.post("/", async (req, res) => {
  const {
    app: {
      context: { comentarios },
    },
  } = req;
  try {
    const { refreshToken, comment_id, message } = req.body;
    const accessToken = req.headers.authorization || "";
    const { validAccessToken, _id } = await refreshTokenMiddleware(
      accessToken,
      refreshToken
    );
    if (!_id || !accessToken) throw new Error("El usuario no existe.");
    if (typeof comment_id !== "string")
      throw new Error("comment_id debe ser una cadena");
    if (!comment_id) throw new Error("comment_id no debe estar vacío");
    if (typeof message !== "string")
      throw new Error("message debe ser una cadena");
    if (!message) throw new Error("message no debe estar vacío");
    await comentarios.updateOne(
      { _id: new ObjectID(comment_id) },
      {
        $set: { message },
      }
    );
    res.status(200).json({
      accessToken: validAccessToken,
    });
  } catch (e) {
    res.status(400).json(e.message);
  }
});

export { editComment };
