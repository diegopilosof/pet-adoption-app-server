const express = require("express");
const app = require("./app");
const config = require("./utils/config");

const PORT = 3002;

app.listen(PORT, () => {
  console.log("Listening on port" + PORT);
});
