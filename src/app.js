const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
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

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(400).send("Something went wrong!");
  }
});

app.get("/user", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send("User not found!");
    }
    res.send(user);
  } catch (err) {
    res.status(400).send("Something went wrong!");
  }
});

app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete(userId);
    res.send("User deleted sucessfully!");
  } catch (error) {
    res.status(400).send("Something went wrong!");
  }
});

app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;
  try {
    const ALLOWED_UPDATED = ["photoUrl", "about", "gender", "age", "skills"];
    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATED.includes(k)
    );
    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }
    if (data.skills?.length > 10) {
      throw new Error("Skills cannot be more than 10");
    }
    const user = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: "after", // by default value is "before"
      runValidators: true,
    });
    res.send("User updated sucessfully!");
  } catch (error) {
    res.status(400).send("UPDATE FAILED:" + error.message);
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
    console.log("Error while connecting with Database", err);
    console.log("Database is not Connected!");
  });
