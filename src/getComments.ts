import { Router } from "express";
import { ObjectID } from "mongodb";

const getComments = Router();

getComments.post("/", async (req, res) => {
  const {
    app: {
      context: { comentarios },
    },
  } = req;
  try {
    const { module_id, skip, order, parent_comment_id } = req.body;
    if (module_id && typeof module_id !== "string")
      throw new Error("module_id debe ser una cadena");
    if (module_id && module_id === "")
      throw new Error("module_id no debe estar vacío");
    if (parent_comment_id && typeof parent_comment_id !== "string")
      throw new Error("parent_comment_id debe ser una cadena");
    if (parent_comment_id && parent_comment_id === "")
      throw new Error("parent_comment_id no debe estar vacío");
    if (typeof skip !== "number") throw new Error("skip debe ser un número");
    if (skip < 0) throw new Error("skip debe ser mayor o igual o 0");
    if (typeof order !== "string") throw new Error("order debe ser una cadena");
    const sortMongo: { likes?: number; _id?: number } = {};
    if (order === "popular") {
      sortMongo.likes = -1;
    } else if (order === "last") {
      sortMongo._id = -1;
    } else if (order === "first") {
      sortMongo._id = 1;
    } else {
      throw new Error("order debe ser una cadena con valor 'popular' ó 'last'");
    }
    const filterMongo: {
      module_id?: ObjectID;
      parent_comment_id?: ObjectID;
    } = {};
    if (module_id) {
      filterMongo.module_id = new ObjectID(module_id);
    } else if (parent_comment_id) {
      filterMongo.parent_comment_id = new ObjectID(parent_comment_id);
    } else {
      throw new Error("Debes proporcionar module_id o parent_comment_id");
    }
    const commentsBuckets = await comentarios
      .find(filterMongo)
      .sort(sortMongo)
      .skip(skip)
      .limit(11)
      .toArray();
    if (commentsBuckets.length === 0) throw new Error("No hay comentarios.");
    const commentCursorDB = commentsBuckets.slice(0, 10);
    res.status(200).json({
      comments: commentCursorDB,
      hasMore: commentsBuckets.length > 10,
    });
  } catch (e) {
    res.status(400).json(e.message);
  }
});

export { getComments };
