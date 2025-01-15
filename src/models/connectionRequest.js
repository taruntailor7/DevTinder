const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // reference to the User collection
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // reference to the User collection
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  { timestamps: true }
);

// Created Compound index on fromUserId and toUserId value can be(1, -1, 2d...)
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }); 

// Index on one column either like this or make index:true
// connectionRequestSchema.index({ status: 1}); 

connectionRequestSchema.pre("save", function(next) {
  const connectionRequest = this;
  // Check if the fromUserid is same as toUserId
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot interested/ignored to yourself!");
  }
  next();
});

const ConnectionRequestModel = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = ConnectionRequestModel;
