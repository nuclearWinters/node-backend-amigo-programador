import { RedisClient } from "redis";
import { TopicsAndModules } from "./types";
import { Collection } from "mongodb";

const redisGet = (redis: RedisClient) =>
  new Promise<TopicsAndModules[]>((resolve, reject) => {
    try {
      redis.get("topicsAndModules", (err, data) => {
        if (err) {
          reject(err);
        } else if (!data) {
          try {
            throw new Error("No hay datos en redis");
          } catch (e) {
            reject(e);
          }
        } else {
          resolve(JSON.parse(data));
        }
      });
    } catch (e) {
      reject(e);
    }
  });

const redisSet = (redis: RedisClient, topicsAndModules: TopicsAndModules[]) =>
  new Promise((resolve, reject) => {
    try {
      redis.set(
        "topicsAndModules",
        JSON.stringify(topicsAndModules),
        "EX",
        24 * 60 * 60,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    } catch (e) {
      reject(e);
    }
  });

export const getCacheTopicsAndModules = (
  redis: RedisClient,
  topicsAndModules: Collection<TopicsAndModules>
) =>
  new Promise<TopicsAndModules[]>(async (resolve, reject) => {
    try {
      const topicsAndModules = await redisGet(redis);
      resolve(topicsAndModules);
    } catch (e) {
      if (e.message === "No hay datos en redis") {
        try {
          const results = await topicsAndModules.find().toArray();
          await redisSet(redis, results);
          resolve(results);
        } catch (e) {
          reject(e);
        }
      } else {
        reject(e);
      }
    }
  });
