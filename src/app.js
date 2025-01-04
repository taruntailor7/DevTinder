const express = require("express");
const connectDB = require("./config/database");

const app = express();

app.get("/", (req, res) => {
  res.send("Response from Server!");
});

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    // First connect with Database then listen for the request! (This is good way)
    console.log("Database Connected Successfully!");
    app.listen(port, () => {
      console.log("Server is listening on port:", port);
    });
  })
  .catch((err) => {
    console.log("Rrror while connecting with Database", err);
    console.log("Database is not Connected!");
  });
