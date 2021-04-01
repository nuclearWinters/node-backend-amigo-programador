import { Router } from "express";
import { ObjectID } from "mongodb";
import { refreshTokenMiddleware } from "./refreshTokenMiddleware";

const deleteComment = Router();

deleteComment.post("/", async (req, res) => {
  const {
    app: {
      context: { comentarios },
    },
  } = req;
  try {
    const { refreshToken, parent_comment_id, child_comment_id } = req.body;
    const accessToken = req.headers.authorization || "";
    const { validAccessToken, _id } = await refreshTokenMiddleware(
      accessToken,
      refreshToken
    );
    if (!_id || !accessToken) throw new Error("El usuario no existe.");
    if (parent_comment_id && child_comment_id) {
      if (
        typeof parent_comment_id === "string" &&
        parent_comment_id !== "" &&
        typeof child_comment_id === "string" &&
        child_comment_id !== ""
      ) {
        await comentarios.deleteOne({ _id: new ObjectID(child_comment_id) });
        await comentarios.updateOne(
          { _id: new ObjectID(parent_comment_id) },
          {
            $inc: {
              totalSubcomments: -1,
            },
          }
        );
      } else {
        throw new Error(
          "parent_comment_id y child_comment_id deben ser una cadenas que no esten vacias"
        );
      }
    } else if (parent_comment_id) {
      if (typeof parent_comment_id === "string" && parent_comment_id !== "") {
        await comentarios.deleteOne({
          _id: new ObjectID(parent_comment_id),
        });
      } else {
        throw new Error(
          "parent_comment_id y child_comment_id deben ser una cadenas que no esten vacias"
        );
      }
    } else {
      throw new Error("Debes proveer al menos parent_comment_id");
    }
    res.status(200).json({
      message: "Comment deleted",
      accessToken: validAccessToken,
    });
  } catch (e) {
    res.status(400).json(e.message);
  }
});

export { deleteComment };
