const express = require("express");
const { userAuth } = require("../middlewares/auth");

const requestRouter = express.Router();

requestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user.firstName + " Send Request");
  } catch (err) {
    res.status(400).send("ERROR while signup: " + err.message);
  }
});

module.exports = requestRouter;
