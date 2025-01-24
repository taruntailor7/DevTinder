const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const validator = require("validator");
const bcrypt = require("bcrypt");

const profileRouter = express.Router();

profileRouter.get("/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/edit", userAuth, async (req, res) => {
  try {
    const data = req.body;
    if(!validateEditProfileData(req)) {
      throw new Error("Invalid edit request");
    }
    if (data.skills?.length > 10) {
      throw new Error("Skills cannot be more than 10");
    }
    const loggeedInUser = req.user;
    Object.keys(req.body).forEach((key) => (loggeedInUser[key] = req.body[key]));
    await loggeedInUser.save();
    res.json({
      message: `${loggeedInUser.firstName}, your profile updated successfully!`,
      data: loggeedInUser
    });
  } catch (err) {
    res.status(400).send("ERROR while updating user profile : " + err.message);
  }
});

profileRouter.patch("/updatePassword", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const loggeedInUser = req.user;

    const isOldPasswordValid = await loggeedInUser.validatePassword(oldPassword);
    if(!isOldPasswordValid) {
      throw new Error("Incorrect old passwor!");
    }
    if(!validator.isStrongPassword(newPassword)) {
      throw new Error("Please enter strong new passwor!");
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    loggeedInUser.password = passwordHash;
    loggeedInUser.save();
    res.json({
      message: `${loggeedInUser.firstName}, your password has changed successfully!`,
      data: loggeedInUser
    });
  } catch (err) {
    res.status(400).send("ERROR while changing user password : " + err.message);
  }
});

module.exports = profileRouter;
