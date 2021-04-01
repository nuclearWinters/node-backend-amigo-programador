/*import { Router } from "express";
import { ObjectID } from "mongodb";
import { refreshTokenMiddleware } from "../refreshTokenMiddleware";
import { CommentsBucketDB } from "../types";

const postComment = Router();

postComment.post("/", async (req, res) => {
  const {
    app: {
      context: { comentarios },
    },
  } = req;
  try {
    const { refreshToken, module_id, message, user_id } = req.body;
    const accessToken = req.headers.authorization || "";
    const { validAccessToken, _id } = await refreshTokenMiddleware(
      accessToken,
      refreshToken
    );
    if (!_id || !accessToken) throw new Error("El usuario no existe.");
    if (typeof module_id !== "string")
      throw new Error("module_id debe ser una cadena");
    if (!module_id) throw new Error("module_id no debe estar vacío");
    if (typeof message !== "string")
      throw new Error("message debe ser una cadena");
    if (!message) throw new Error("message no debe estar vacío");
    if (typeof user_id !== "string")
      throw new Error("user_id debe ser una cadena");
    if (!user_id) throw new Error("user_id no debe estar vacío");
    const findByRegex = new RegExp("^" + module_id + "_");
    const updateWrite = await comentarios.updateOne(
      { _id: findByRegex, count: { $lt: 20 }, byPopularity: false },
      {
        $push: {
          comments: {
            _id: new ObjectID(),
            show: true,
            likes: 0,
            message,
            user_id: new ObjectID(user_id),
            created: new Date().toISOString(),
            totalSubcomments: 0,
          },
        },
        $inc: { count: 1 },
        $setOnInsert: {
          _id: `${module_id}_${new Date().getTime()}`,
          byPopularity: false,
        },
      },
      { upsert: true }
    );
    if (!updateWrite.result.nModified) {
      const findByRegex = new RegExp("^" + module_id + "_");
      const commentsBucket = await comentarios
        .find({
          _id: findByRegex,
          byPopularity: false,
        })
        .toArray();
      const arrayOfComments = commentsBucket
        .reduce<CommentsBucketDB[]>(
          (prev, next) =>
            prev.concat(
              next.comments.map((item) => ({ ...item, bucket_id: next._id }))
            ),
          []
        )
        .sort((a, b) => b.likes - a.likes);
      await comentarios.updateOne(
        { _id: findByRegex, byPopularity: true },
        {
          $set: {
            comments: arrayOfComments.slice(0, 20),
            count: arrayOfComments.filter((item) => item.show).length,
          },
          $setOnInsert: {
            _id: `${module_id}_${new Date().getTime()}`,
            byPopularity: true,
          },
        },
        { upsert: true }
      );
    }
    res.status(200).json({
      message: "Comentario insertado con exito",
      accessToken: validAccessToken,
    });
  } catch (e) {
    res.status(400).json(e.message);
  }
});

export { postComment };

import { Router } from "express";
import { CommentsBucketDB } from "./types";

const getCommentsDate = Router();

getCommentsDate.post("/", async (req, res) => {
  const {
    app: {
      context: { comentarios },
    },
  } = req;
  try {
    const { module_id, skip, commentCursor, bucketCursor } = req.body;
    if (typeof module_id !== "string")
      throw new Error("module_id debe ser una cadena");
    if (!module_id) throw new Error("module_id no debe estar vacío");
    if (typeof skip !== "number") throw new Error("skip debe ser un número");
    if (skip < 0) throw new Error("skip debe ser mayor o igual o 0");
    if (typeof module_id !== "string")
      throw new Error("module_id debe ser una cadena");
    const findByRegex = new RegExp("^" + module_id + "_");
    const commentsBuckets = await comentarios
      .find({
        _id: bucketCursor ? { $lte: bucketCursor } : findByRegex,
        byPopularity: false,
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(2)
      .toArray();
    if (commentsBuckets.length === 0)
      throw new Error("No hay más comentarios.");
    const comments = commentsBuckets.reduce<CommentsBucketDB[]>(
      (prev, next) => {
        return prev.concat(
          next.comments
            .reverse()
            .map((item) => ({ ...item, bucket_id: next._id }))
        );
      },
      []
    );
    const commentCursorIndex = commentCursor
      ? comments.findIndex((item) => {
          return item._id.toHexString() === commentCursor;
        })
      : 0;
    const commentCursorDB = comments.slice(
      commentCursor ? commentCursorIndex + 1 : 0,
      20
    );
    res.status(200).json({
      comments: commentCursorDB,
      hasMore: comments.length >= 21,
      commentCursor:
        commentCursorDB.length !== 0
          ? commentCursorDB[commentCursorDB.length - 1]._id
          : "",
      bucketCursor:
        commentsBuckets.length === 2
          ? commentsBuckets[1]._id
          : commentsBuckets.length === 1
          ? commentsBuckets[0]._id
          : "",
    });
  } catch (e) {
    res.status(400).json(e.message);
  }
});

export { getCommentsDate };

import { Router } from "express";
import { refreshTokenMiddleware } from "./refreshTokenMiddleware";

const getPopularComments = Router();

getPopularComments.post("/", async (req, res) => {
  const {
    app: {
      context: { comentarios },
    },
  } = req;
  try {
    const { refreshToken, module_id } = req.body;
    const accessToken = req.headers.authorization || "";
    const { validAccessToken, _id } = await refreshTokenMiddleware(
      accessToken,
      refreshToken
    );
    if (!_id || !accessToken) throw new Error("El usuario no existe.");
    if (typeof module_id !== "string")
      throw new Error("module_id debe ser una cadena");
    if (!module_id) throw new Error("module_id no debe estar vacío");
    const findByRegex = new RegExp("^" + module_id + "_");
    const comments = await comentarios.findOne({
      _id: findByRegex,
      byPopularity: true,
    });
    if (!comments) throw new Error("No hay más comentarios.");
    res.status(200).json({
      count: comments.count,
      comments: comments.comments,
      accessToken: validAccessToken,
    });
  } catch (e) {
    res.status(400).json(e.message);
  }
});

export { getPopularComments };


*/
