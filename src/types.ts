import { ObjectId, Db, Collection, ObjectID } from "mongodb";
import { RedisClient } from "redis";

export interface TopicsAndModules {
  _id: ObjectId;
  step: number;
  name: string;
  url: string;
  type: string;
  modules: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
  }[];
}

export interface CommentDB {
  _id: ObjectId;
  likes: number;
  message: string;
  user_id: ObjectId;
  username: string;
  created: string;
  totalSubcomments: number;
  module_id?: ObjectId;
  parent_comment_id?: ObjectID;
}

export interface Context {
  usuarios: Collection<UserDB>;
  comentarios: Collection<CommentDB>;
  topicsAndModules: Collection<TopicsAndModules>;
  redis: RedisClient;
  accessToken?: string;
}

export interface UserDB {
  _id: ObjectId;
  username: string;
  password: string;
  email: string;
  currentTopic: string;
  arrayLikedComments: string[];
  topicsAndModulesData: {
    _id: ObjectId;
    name: string;
    currentModule: number;
    modulesCompleted: { _id: string; tareaURL: string }[];
  }[];
}

export interface DecodeJWT {
  _id: string;
}

export interface ModulesDB {
  QuickStart: number;
  HTML: number;
  CSS: number;
  Javascript: number;
  React: number;
  Node: number;
  Express: number;
  MongoDB: number;
}

export interface ModuleDB {
  title: string;
  description: string;
  thumbnail: string;
  comments: any[];
}
