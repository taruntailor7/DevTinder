const express = require("express");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();
const ConnectionRequests = require("../models/connectionRequest")

const USER_SAFE_DATA =  "firstName lastName photoUrl age gender skills about";

userRouter.get("/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequests.find({
        toUserId: loggedInUser._id,
        status: "interested"
    }).populate(
      "fromUserId", 
      USER_SAFE_DATA
      // "firstName lastName photoUrl age gender skills about"
    ); // Either write what you want in array or in string
    // ['firstName', 'lastName', 'photoUrl', 'age', 'gender', 'skills', 'about']

    res.json({
        message: "Data fetched successfully!",
        data: connectionRequests
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

userRouter.get("/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequests.find({
        $or: [
          {toUserId: loggedInUser._id, status: "accepted"},
          {fromUserId: loggedInUser._id, status: "accepted"},
        ],
    }).populate(
      "fromUserId", 
      USER_SAFE_DATA
    ).populate(
      "toUserId", 
      USER_SAFE_DATA
    ); 
    // Either write what you want in array or in string
    // ['firstName', 'lastName', 'photoUrl', 'age', 'gender', 'skills', 'about']

    const data = connectionRequests.map((row) => {
      if(row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    })
    res.json({
        message: "Data fetched successfully!",
        data: data
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    
    res.json({
        message: "Data fetched successfully!",
        // data: data
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

module.exports = userRouter;
