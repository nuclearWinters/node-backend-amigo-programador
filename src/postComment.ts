import { Router } from "express";
import { ObjectID } from "mongodb";
import { refreshTokenMiddleware } from "./refreshTokenMiddleware";

const postComment = Router();

postComment.post("/", async (req, res) => {
  const {
    app: {
      context: { comentarios },
    },
  } = req;
  try {
    const {
      refreshToken,
      module_id,
      message,
      user_id,
      parent_comment_id,
      username,
    } = req.body;
    const accessToken = req.headers.authorization || "";
    const { validAccessToken, _id } = await refreshTokenMiddleware(
      accessToken,
      refreshToken
    );
    if (!_id || !accessToken) throw new Error("El usuario no existe.");
    if (module_id && typeof module_id !== "string")
      throw new Error("module_id debe ser una cadena");
    if (typeof message !== "string")
      throw new Error("message debe ser una cadena");
    if (!message) throw new Error("message no debe estar vacío");
    if (typeof user_id !== "string")
      throw new Error("user_id debe ser una cadena");
    if (!user_id) throw new Error("user_id no debe estar vacío");
    if (parent_comment_id && typeof parent_comment_id !== "string")
      throw new Error("parent_comment_id debe ser una cadena");
    if (typeof username !== "string")
      throw new Error("username debe ser una cadena");
    if (!username) throw new Error("username no debe estar vacío");
    const documentMongo: {
      _id: ObjectID;
      likes: number;
      message: string;
      user_id: ObjectID;
      created: string;
      totalSubcomments: number;
      module_id?: ObjectID;
      username: string;
      parent_comment_id?: ObjectID;
    } = {
      _id: new ObjectID(),
      likes: 0,
      message,
      user_id: new ObjectID(user_id),
      created: new Date().toISOString(),
      totalSubcomments: 0,
      module_id: new ObjectID(module_id),
      username,
    };
    if (parent_comment_id) {
      documentMongo.parent_comment_id = new ObjectID(parent_comment_id);
    } else if (module_id) {
      documentMongo.module_id = new ObjectID(module_id);
    }
    await comentarios.insertOne(documentMongo);
    if (parent_comment_id) {
      await comentarios.updateOne(
        {
          _id: new ObjectID(parent_comment_id),
        },
        {
          $inc: { totalSubcomments: 1 },
        }
      );
    }
    res.status(200).json({
      comment: documentMongo,
      message: "Comentario insertado con exito",
      accessToken: validAccessToken,
    });
  } catch (e) {
    res.status(400).json(e.message);
  }
});

export { postComment };
