const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignUpDate } = require("./utils/validation");
const bcrypt = require('bcrypt');
const validator = require('validator');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(cookieParser());

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

app.post("/signup", async (req, res) => {
  try {
    // Validate the data
    validateSignUpDate(req);

    const {firstName, lastName, email, password} = req.body;

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Crearting a new instance of the User model
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash
    });

    await user.save();
    res.send("User Added successfully!");
  } catch (err) {
    res.status(400).send("ERROR while signup: " + err.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const {email, password} = req.body;
    // Validate the data
    const isEmailExist = validator.isEmail(email);

    if(!isEmailExist) {
      throw new Error("Invalid Credentials!")
    }

    const user = await User.findOne({email: email})
    if(!user) {
      throw new Error("Invalid Credentials!")
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if(isPasswordValid) {
      const token = await jwt.sign({_id: user._id}, "DEV@Tinder@7");

      // Add token token to the cookie and send the response back to the user
      res.cookie("token", token)
      res.send("Login Successfull!");
    } else {
      throw new Error("Invalid Credentials!")
    }
  } catch (err) {
    res.status(400).send("ERROR while login: " + err.message);
  }
});

app.get("/profile", async (req, res) => {
  try {
    const cookies = req.cookies;
    const { token } = cookies;
    if (!token) {
      throw new Error("Invalid Token!");
    }

    const decodedMessage = await jwt.verify(token, "DEV@Tinder@7");
    const { _id } = decodedMessage;

    const user = await User.findById(_id);
    console.log('user', user);
    if(!user) {
      throw new Error("User does not exist!")
    }

    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
})

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
