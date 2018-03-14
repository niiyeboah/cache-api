import { name, version, description } from "../../package.json";
import { Router } from "express";
import cache from "./cache";
import errorHandler from "./error";

export default config => {
  const api = Router();

  // mount the cache resource
  api.use("/cache", cache(config));

  // API metadata at the root
  api.get("/", (req, res) => {
    res.json({ name, version, description });
  });

  api.use(errorHandler);

  return api;
};
