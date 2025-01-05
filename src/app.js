const express = require("express");
const connectDB = require("./config/database");
const User = require('./models/user');

const app = express();

app.get("/", (req, res) => {
  res.send("Response from Server!");
});

app.post("/signup", async (req, res) => {
  // Crearting a new instance of the User model
  const user = new User({
    firstName: "Tarun",
    lastName: "Tailor",
    email: "tarun@tailor.com",
    password: "" // Random
  });

  try {
    await user.save();
    res.send("User Added successfully!");
  } catch(err) {
    res.status(400).send("Error saving the user:" + err.message);
  }
  
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
