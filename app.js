const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const petsRouter = require("./controllers/pets");
const usersRouter = require("./controllers/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./models/user");

mongoose.set("strictQuery", false);

console.log("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use("/api/pets", petsRouter);
app.use("/api/users", usersRouter);

module.exports = app;
