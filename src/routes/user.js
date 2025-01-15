const express = require("express");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();
const ConnectionRequests = require("../models/connectionRequest");
const User = require("../models/user");

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

    const page = req.query.page || 1;
    let limit = req.query.limit || 10;
    limit = limit > 50 ? 50 : limit;

    const skip = (page - 1) * limit;

    const connectionRequest = await ConnectionRequests.find({
      $or: [
        { fromUserId: loggedInUser._id },
        { toUserId: loggedInUser._id },
      ],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequest.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed)} },
        { _id: { $ne: loggedInUser._id} },
      ]
    }).select(USER_SAFE_DATA).skip(skip).limit(limit);
    
    res.json({
      message: "Data fetched successfully!",
      data: users
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

module.exports = userRouter;
