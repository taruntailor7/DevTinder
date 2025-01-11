const express = require("express");
const connectDB = require("./config/database");
const User = require('./models/user');

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Response from Server!");
});

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch(err) {
    res.status(400).send("Something went wrong!");
  }
});

app.get("/user", async (req, res) => {
  try {
    const user = await User.findOne({email: req.body.email});
    if(!user) {
      return res.status(404).send("User not found!");
    }
    res.send(user);
  } catch(err) {
    res.status(400).send("Something went wrong!");
  }
});

app.post("/signup", async (req, res) => {
  // Crearting a new instance of the User model
  const user = new User(req.body);

  try {
    await user.save();
    res.send("User Added successfully!");
  } catch(err) {
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
})

app.patch("/user", async (req, res) => {
  const userId = req.body.userId;
  const data = req.body;
  console.log('userId', userId);
  console.log('data', data);
  try {
    const user = await User.findByIdAndUpdate({_id: userId}, data, {
      returnDocument: "after", // by default value is "before"
      runValidators: true,
     });
    res.send("User updated sucessfully!");
  } catch (error) {
    res.status(400).send("Something went wrong!");
  }
})

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
