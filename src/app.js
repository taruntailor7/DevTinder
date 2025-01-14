const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/request', requestRouter);

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
    console.log("Error while connecting with Database", err);
    console.log("Database is not Connected!");
  });
