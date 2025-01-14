const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const mongoose = require("mongoose");

const requestRouter = express.Router();

requestRouter.post("/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    // This we can do in modal also
    // if(fromUserId.equals(toUserId)) {
    //   return res.status(400).json({
    //     message: "User can not send request to him/herself"
    //   });
    // }

    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({
        message: "Invalid User ID format!",
      });
    }

    const allowedStatus = ['interested', 'ignored'];

    if(!allowedStatus.includes(status)) {
      return res.status(400).json({
        message:  "Invalid Status type: " + status,
      })
    }

    const toUser = await User.findById(toUserId);
    if(!toUser) {
      return res.status(404).json({
        message: 'User not found!',
      });
    }

    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if(existingConnectionRequest) {
      return res.status(400).json({
        message: "Connection Request Already Exists!"
      });
    }

    const connectionRequest = new ConnectionRequest({
      fromUserId, toUserId, status
    })

    const data = await connectionRequest.save();

    res.json({
      message: "Interested/Ignored Request Sent Successfully!",
      data,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});

module.exports = requestRouter;
