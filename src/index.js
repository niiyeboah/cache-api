import http from "http";
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import api from "./api";
import config from "./config.json";

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan("dev"));

// 3rd party middleware
app.use(bodyParser.json({ limit: config.bodyLimit }));

// connect to db
mongoose.Promise = global.Promise;
mongoose
  .connect(config.db)
  .then(() => console.log("connected to db"))
  .catch(err => console.error(err));

// set api endpoints
app.use("/api", api(config));

// start server
app.server.listen(process.env.PORT || config.port, () => {
  console.log(`Listening on port ${app.server.address().port}`);
});

export default app;
