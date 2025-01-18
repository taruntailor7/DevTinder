const express = require("express");
const { validateSignUpDate } = require("../utils/validation");
const User = require("../models/user");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const validator = require("validator");

authRouter.post("/signup", async (req, res) => {
  try {
    // Validate the data
    validateSignUpDate(req);

    const { firstName, lastName, email, password } = req.body;

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Crearting a new instance of the User model
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });

    await user.save();
    res.json({
      message: "User Added successfully!",
      data: user,
    });
  } catch (err) {
    res.status(400).send("ERROR while signup: " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validate the data
    const isEmailExist = validator.isEmail(email);

    if (!isEmailExist) {
      throw new Error("Invalid Credentials!");
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid Credentials!");
    }

    // using here moongose schema methods
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      // using here moongose schema methods
      const token = await user.getJWT();
      const { password, ...userWithoutPassword } = user.toObject();

      // Add token token to the cookie and send the response back to the user
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000), // Expires in 8 hours
      });
      res.json({
        message: "Login Successfull!",
        data: userWithoutPassword,
      });
    } else {
      throw new Error("Invalid Credentials!");
    }
  } catch (err) {
    res.status(400).send("ERROR while login: " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout Sucessfull!");
});

module.exports = authRouter;
