import express from "express";
import { signIn } from "./signIn";
import { signUp } from "./signUp";
import { getUser } from "./getUser";
import { postComment } from "./postComment";
import { getComments } from "./getComments";
import { deleteComment } from "./deleteComment";
import { editComment } from "./editComment";
import { likeComment } from "./likeComment";
import { unlikeComment } from "./unlikeComment";
import MongoClient from "mongodb";
import { ATLAS_CONFIG } from "./config";
import { UserDB, CommentDB, TopicsAndModules } from "./types";
import redis from "redis";
import cors from "cors";

const redisClient = redis.createClient(6379);
const menuOptions = { useNewUrlParser: true, useUnifiedTopology: true };
const app = express();

app.use(cors());
app.use(express.json());
app.use("/signIn", signIn);
app.use("/signUp", signUp);
app.use("/getUser", getUser);
app.use("/postComment", postComment);
app.use("/getComments", getComments);
app.use("/deleteComment", deleteComment);
app.use("/editComment", editComment);
app.use("/likeComment", likeComment);
app.use("/unlikeComment", unlikeComment);

MongoClient.connect(ATLAS_CONFIG, menuOptions).then((client) => {
  const db = client.db("amigo_programador");
  const usuarios = db.collection<UserDB>("usuarios");
  const comentarios = db.collection<CommentDB>("comentarios");
  const topicsAndModules = db.collection<TopicsAndModules>("arbo_tecnologicol");
  app.context = {
    usuarios,
    comentarios,
    redis: redisClient,
    topicsAndModules,
  };
  app.listen(4000, () => {
    console.log(`Example app listening at http://localhost:${4000}`);
  });
});
